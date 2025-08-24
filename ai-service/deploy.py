import sagemaker
from sagemaker.serverless import ServerlessInferenceConfig
from sagemaker.model import Model
from sagemaker.pytorch import PyTorchModel
import tarfile
import os
import logging
from dotenv import load_dotenv
import datetime

# .envファイルの内容を環境変数として読み込む
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_script_tar(source_dir: str = './app', output_file: str = 'script.tar.gz'):
    """
    Create tar.gz file from ./app directory.
    """
    logger.info(f"Creating {output_file} from {source_dir}...")
    
    if not os.path.exists(source_dir):
        raise FileNotFoundError(f"Source directory not found: {source_dir}")
    
    with tarfile.open(output_file, 'w:gz') as tar:
        # Add all files from app directory
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Calculate arcname to maintain directory structure
                arcname = os.path.relpath(file_path, source_dir)
                tar.add(file_path, arcname=arcname)
                logger.info(f"  Added: {arcname}")
    
    file_size_mb = os.path.getsize(output_file) / (1024 * 1024)
    logger.info(f"✅ Created {output_file} ({file_size_mb:.2f} MB)")
    return output_file

def cleanup_old_resources(sess: sagemaker.Session, keep_latest: int = 2):
    """
    Clean up old models and endpoint configurations using SageMaker SDK,
    keeping only the latest ones.
    """
    try:
        logger.info("🧹 Starting cleanup of old resources...")

        sm_client = sess.sagemaker_client

        # List models
        models_response = sm_client.list_models(
            NameContains="image-process-model-",
            MaxResults=100
        )
        # List endpoint configs
        configs_response = sm_client.list_endpoint_configs(
            NameContains="image-process-config-",
            MaxResults=100
        )

        # Sort newest first
        models = sorted(models_response["Models"], key=lambda x: x["CreationTime"], reverse=True)
        configs = sorted(configs_response["EndpointConfigs"], key=lambda x: x["CreationTime"], reverse=True)

        # Delete old configs
        configs_to_delete = configs[keep_latest:]
        for config in configs_to_delete:
            config_name = config["EndpointConfigName"]
            try:
                logger.info(f"🗑️  Deleting old endpoint config: {config_name}")
                sm_client.delete_endpoint_config(config_name)
            except Exception as e:
                logger.warning(f"⚠️  Could not delete config {config_name}: {str(e)}")

        # Delete old models
        models_to_delete = models[keep_latest:]
        for model in models_to_delete:
            model_name = model["ModelName"]
            try:
                logger.info(f"🗑️  Deleting old model: {model_name}")
                sm_client.delete_model(ModelName=model_name)
            except Exception as e:
                logger.warning(f"⚠️  Could not delete model {model_name}: {str(e)}")

        logger.info(f"✅ Cleanup completed. Deleted {len(configs_to_delete)} configs and {len(models_to_delete)} models")

    except Exception as e:
        logger.warning(f"⚠️  Cleanup failed: {str(e)}")

# SageMakerセッションとロールを初期化
sagemaker_session = sagemaker.Session()
role = os.getenv('AWS_SAGEMAKER_ROLE')

# エンドポイント名
ENDPOINT_NAME = 'image-process-endpoint'

# 環境変数チェック
if not role:
    logger.error("❌ AWS_SAGEMAKER_ROLE environment variable is not set")
    raise ValueError("AWS_SAGEMAKER_ROLE environment variable is required")

logger.info(f"🔧 Using SageMaker role: {role}")
logger.info(f"🌍 Using region: {sagemaker_session.boto_region_name}")

try:
    # ./appディレクトリをscript.tar.gzに圧縮
    script_tar_path = create_script_tar('./app', 'script.tar.gz')

    # --- 事前にアップロード済みのモデルS3パスを指定 ---
    model_s3_uri = 's3://climbinsight-ai-models/sam-models/sam_vit_b.tar.gz'

    # script.tar.gzをアップロード
    source_dir_path = sagemaker_session.upload_data(
        path=script_tar_path,
        bucket=sagemaker_session.default_bucket(),
        key_prefix='script-source-dir'
    )

    logger.info(f"Script uploaded to: {source_dir_path}")

    # 一意な名前を生成（タイムスタンプ付き）
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    model_name = f"image-process-model-{timestamp}"
    config_name = f"image-process-config-{timestamp}"

    # Check if endpoint already exists
    try:
        sm_client = sagemaker_session.sagemaker_client
        sm_client.describe_endpoint(EndpointName=ENDPOINT_NAME)
        endpoint_exists = True
        logger.info(f"🔍 Found existing endpoint: {ENDPOINT_NAME}")
    except Exception:
        endpoint_exists = False
        logger.info(f"✅ No existing endpoint found: {ENDPOINT_NAME}")

    # モデルを作成
    model = PyTorchModel(
        model_data=model_s3_uri,
        role=role,
        framework_version='2.6',
        py_version='py312',
        sagemaker_session=sagemaker_session,
        source_dir=source_dir_path,
        entry_point='inference.py',
        name=model_name
    )

    # サーバレス設定
    serverless_config = ServerlessInferenceConfig(
        memory_size_in_mb=6144,
        max_concurrency=1
    )

    if endpoint_exists:
        # 既存エンドポイントを更新
        logger.info(f"🔄 Updating existing endpoint: {ENDPOINT_NAME}")
        predictor = model.deploy(
            serverless_inference_config=serverless_config,
            endpoint_name=ENDPOINT_NAME,
            update_endpoint=True
        )
        logger.info(f"🎉 Endpoint updated successfully!")
    else:
        # 新規エンドポイントを作成
        logger.info(f"🚀 Creating new endpoint: {ENDPOINT_NAME}")
        predictor = model.deploy(
            serverless_inference_config=serverless_config,
            endpoint_name=ENDPOINT_NAME,
        )
        logger.info(f"🎉 Endpoint created successfully!")
    logger.info(f"📍 Endpoint name: {predictor.endpoint_name}")
    logger.info(f"🔗 Endpoint URL: https://runtime.sagemaker.{sagemaker_session.boto_region_name}.amazonaws.com/endpoints/{predictor.endpoint_name}/invocations")

    # 古いリソースをクリーンアップ
    cleanup_old_resources(sagemaker_session, keep_latest=2)

    # クリーンアップ: ローカルのtar.gzファイルを削除
    try:
        os.remove(script_tar_path)
        logger.info(f"🗑️  Cleaned up local file: {script_tar_path}")
    except Exception as e:
        logger.warning(f"⚠️  Could not remove {script_tar_path}: {str(e)}")

    print(f"\n=== Deployment Summary ===")
    print(f"Endpoint name: {predictor.endpoint_name}")
    print(f"Model name: {model_name}")
    print(f"Config name: {config_name}")
    print(f"Region: {sagemaker_session.boto_region_name}")
    print(f"Status: Ready for inference")
    print(f"Content-Type: application/zip")
    print(f"Operation: {'Updated' if endpoint_exists else 'Created'}")
    print(f"==========================")

except Exception as e:
    logger.error(f"❌ Deployment failed: {str(e)}")
    # Clean up the tar file even if deployment fails
    try:
        if 'script_tar_path' in locals():
            os.remove(script_tar_path)
            logger.info(f"🗑️  Cleaned up local file: {script_tar_path}")
    except Exception as cleanup_error:
        logger.warning(f"⚠️  Could not remove {script_tar_path}: {str(cleanup_error)}")
    
    raise e