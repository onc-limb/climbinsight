import sagemaker
from sagemaker.serverless import ServerlessInferenceConfig
from sagemaker.pytorch import PyTorchModel

# SageMakerセッションとロールを初期化
sagemaker_session = sagemaker.Session()
role = sagemaker.get_execution_role()

# --- 事前にアップロード済みのモデルS3パスを指定 ---
model_s3_uri = 's3://your-pre-uploaded-bucket/your-model-folder/model.tar.gz'

# --- 変更点1: inference.pyとsam.pyをまとめた.tar.gzをアップロード ---
# pathには、tar.gzファイルへのローカルパスを指定します。
source_dir_path = sagemaker_session.upload_data(
    path='path/to/your/script.tar.gz',
    bucket=sagemaker_session.default_bucket(),
    key_prefix='your-script-source-dir'
)

# モデルを作成
model = PyTorchModel(
    model_data=model_s3_uri,
    role=role,
    framework_version='1.13',
    py_version='py39',
    sagemaker_session=sagemaker_session,
    # --- 変更点2: source_dirにtar.gzのS3パスを指定 ---
    source_dir=source_dir_path,
    entry_point='inference.py' # エントリーポイントはinference.pyのまま
)

# サーバレス設定
serverless_config = ServerlessInferenceConfig(
    memory_size_in_mb=4096,
    max_concurrency=10
)

# エンドポイントのデプロイ
predictor = model.deploy(
    serverless_inference_config=serverless_config,
    endpoint_name='my-custom-serverless-endpoint'
)

print(f"Endpoint name: {predictor.endpoint_name}")