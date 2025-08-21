import sagemaker
from sagemaker.serverless import ServerlessInferenceConfig
from sagemaker.pytorch import PyTorchModel
import tarfile
import os
import logging
from dotenv import load_dotenv

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

# SageMakerセッションとロールを初期化
sagemaker_session = sagemaker.Session()
role = os.getenv('AWS_SAGEMAKER_ROLE')

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

# モデルを作成
model = PyTorchModel(
    model_data=model_s3_uri,
    role=role,
    framework_version='2.6',
    py_version='py312',
    sagemaker_session=sagemaker_session,
    source_dir=source_dir_path,
    entry_point='inference.py'
)

# サーバレス設定
serverless_config = ServerlessInferenceConfig(
    memory_size_in_mb=6144,
    max_concurrency=1
)

# エンドポイントのデプロイ
logger.info("🚀 Deploying model to SageMaker endpoint...")
predictor = model.deploy(
    serverless_inference_config=serverless_config,
    endpoint_name='image-process-endpoint'
)

logger.info(f"🎉 Deployment completed successfully!")
logger.info(f"📍 Endpoint name: {predictor.endpoint_name}")

# クリーンアップ: ローカルのtar.gzファイルを削除
try:
    os.remove(script_tar_path)
    logger.info(f"🗑️  Cleaned up local file: {script_tar_path}")
except Exception as e:
    logger.warning(f"⚠️  Could not remove {script_tar_path}: {str(e)}")

print(f"Endpoint name: {predictor.endpoint_name}")