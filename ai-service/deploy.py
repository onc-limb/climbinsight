import sagemaker
from sagemaker.serverless import ServerlessInferenceConfig
from sagemaker.async_inference import AsyncInferenceConfig
from sagemaker.model import Model
from sagemaker.pytorch import PyTorchModel
from sagemaker.predictor import Predictor
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

def delete_existing_resources(sm_client, endpoint_name: str, model_name: str, config_name: str):
    """
    Delete existing endpoint, endpoint config, and model if they exist.
    """
    # Delete endpoint if exists
    try:
        sm_client.describe_endpoint(EndpointName=endpoint_name)
        logger.info(f"🗑️  Deleting existing endpoint: {endpoint_name}")
        sm_client.delete_endpoint(EndpointName=endpoint_name)
        
        # Wait for endpoint deletion
        logger.info("⏳ Waiting for endpoint deletion to complete...")
        waiter = sm_client.get_waiter('endpoint_deleted')
        waiter.wait(EndpointName=endpoint_name)
        logger.info(f"✅ Endpoint {endpoint_name} deleted successfully")
    except Exception as e:
        if "ValidationException" in str(e) or "does not exist" in str(e):
            logger.info(f"✅ No existing endpoint to delete: {endpoint_name}")
        else:
            logger.warning(f"⚠️  Could not delete endpoint {endpoint_name}: {str(e)}")

    # Delete all endpoint configs that contain the config_name pattern
    try:
        # List all endpoint configs that contain the config_name
        configs_response = sm_client.list_endpoint_configs(
            NameContains=config_name,
            MaxResults=100
        )
        
        configs_to_delete = configs_response.get('EndpointConfigs', [])
        
        if configs_to_delete:
            logger.info(f"🗑️  Found {len(configs_to_delete)} endpoint configs containing '{config_name}' to delete")
            for config in configs_to_delete:
                config_name_to_delete = config['EndpointConfigName']
                try:
                    logger.info(f"🗑️  Deleting endpoint config: {config_name_to_delete}")
                    sm_client.delete_endpoint_config(EndpointConfigName=config_name_to_delete)
                    logger.info(f"✅ Endpoint config {config_name_to_delete} deleted successfully")
                except Exception as e:
                    logger.warning(f"⚠️  Could not delete endpoint config {config_name_to_delete}: {str(e)}")
        else:
            logger.info(f"✅ No existing endpoint configs containing '{config_name}' to delete")
            
    except Exception as e:
        logger.warning(f"⚠️  Error listing endpoint configs containing '{config_name}': {str(e)}")

    # Delete all models that contain the model_name pattern
    try:
        # List all models that contain the model_name
        models_response = sm_client.list_models(
            NameContains=model_name,
            MaxResults=100
        )
        
        models_to_delete = models_response.get('Models', [])
        
        if models_to_delete:
            logger.info(f"🗑️  Found {len(models_to_delete)} models containing '{model_name}' to delete")
            for model in models_to_delete:
                model_name_to_delete = model['ModelName']
                try:
                    logger.info(f"🗑️  Deleting model: {model_name_to_delete}")
                    sm_client.delete_model(ModelName=model_name_to_delete)
                    logger.info(f"✅ Model {model_name_to_delete} deleted successfully")
                except Exception as e:
                    logger.warning(f"⚠️  Could not delete model {model_name_to_delete}: {str(e)}")
        else:
            logger.info(f"✅ No existing models containing '{model_name}' to delete")
            
    except Exception as e:
        logger.warning(f"⚠️  Error listing models containing '{model_name}': {str(e)}")

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

        # Get current endpoint config to avoid deleting it
        current_config = None
        try:
            endpoint_info = sm_client.describe_endpoint(EndpointName="image-process-endpoint")
            current_config = endpoint_info['EndpointConfigName']
            logger.info(f"🔒 Current config in use: {current_config}")
        except Exception:
            # Endpoint doesn't exist, no config to protect
            pass

        # Delete old configs (but not the current one)
        configs_to_delete = []
        for i, config in enumerate(configs):
            config_name = config["EndpointConfigName"]
            # Skip if it's the current config or within keep_latest count
            if config_name != current_config and i >= keep_latest:
                configs_to_delete.append(config)

        for config in configs_to_delete:
            config_name = config["EndpointConfigName"]
            try:
                logger.info(f"🗑️  Deleting old endpoint config: {config_name}")
                sm_client.delete_endpoint_config(EndpointConfigName=config_name)
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

# リソース名
ENDPOINT_NAME = 'image-process-endpoint'
MODEL_NAME = "image-process-model"
CONFIG_NAME = "image-process-endpoint"

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

    # SageMaker client
    sm_client = sagemaker_session.sagemaker_client
    
    # 既存のリソースを全て削除
    logger.info("🧹 Deleting existing resources before creating new ones...")
    delete_existing_resources(sm_client, ENDPOINT_NAME, MODEL_NAME, CONFIG_NAME)

    # モデルを作成
    logger.info(f"📦 Creating new model: {MODEL_NAME}")
    model = PyTorchModel(
        model_data=model_s3_uri,
        role=role,
        framework_version='2.6',
        py_version='py312',
        sagemaker_session=sagemaker_session,
        source_dir=source_dir_path,
        entry_point='inference.py',
        name=MODEL_NAME
    )

    # 非同期推論設定
    async_config = AsyncInferenceConfig(
        output_path=f"s3://{sagemaker_session.default_bucket()}/async-inference-output/",
        max_concurrent_invocations_per_instance=4
    )

    # エンドポイントを作成
    logger.info(f"🔧 Creating async endpoint: {ENDPOINT_NAME}")
    predictor = model.deploy(
            instance_type="ml.g4dn.xlarge",
            initial_instance_count=1,
            async_inference_config=async_config,
            endpoint_name=ENDPOINT_NAME,
        )
    logger.info(f"🎉 Async endpoint created successfully!")
    logger.info(f"📍 Endpoint name: {predictor.endpoint_name}")
    logger.info(f"🔗 Async Endpoint URL: https://runtime.sagemaker.{sagemaker_session.boto_region_name}.amazonaws.com/endpoints/{predictor.endpoint_name}/async-invocations")

    # 古いリソースをクリーンアップ
    cleanup_old_resources(sagemaker_session, keep_latest=2)

    # クリーンアップ: ローカルのtar.gzファイルを削除
    try:
        os.remove(script_tar_path)
        logger.info(f"🗑️  Cleaned up local file: {script_tar_path}")
    except Exception as e:
        logger.warning(f"⚠️  Could not remove {script_tar_path}: {str(e)}")

    print(f"\n=== Async Deployment Summary ===")
    print(f"Endpoint name: {predictor.endpoint_name}")
    print(f"Model name: {MODEL_NAME}")
    print(f"Config name: {CONFIG_NAME}")
    print(f"Region: {sagemaker_session.boto_region_name}")
    print(f"Instance type: ml.g4dn.xlarge")
    print(f"Status: Ready for async inference")
    print(f"Content-Type: application/zip")
    print(f"Operation: Recreated as Async Endpoint")
    print(f"==================================")

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