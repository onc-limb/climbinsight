# SageMaker Deployment Guide

このガイドでは、SAMクライミングホールド抽出モデルをAWS SageMakerにデプロイする方法を説明します。

## 概要

従来のFastAPIサーバーからSageMakerエンドポイントに移行することで、以下の利点があります：

- **スケーラビリティ**: 自動スケーリング
- **可用性**: AWS管理による高可用性
- **コスト効率**: オンデマンド料金
- **メンテナンス**: AWS管理インフラ

## ファイル構成

### 新規作成ファイル

- `inference.py` - SageMaker推論スクリプト（メインエントリポイント）
- `requirements-sagemaker.txt` - SageMaker用依存関係
- `package_model.py` - モデルパッケージング用スクリプト
- `Dockerfile.sagemaker` - SageMaker用Dockerfile
- `sagemaker_client.py` - Goサーバー用SageMakerクライアント
- `deploy_to_sagemaker.sh` - 自動デプロイスクリプト
- `README_SAGEMAKER.md` - このファイル

### 変更点

既存の`server.py`はそのまま残しますが、本番環境ではSageMakerエンドポイントを使用します。

## デプロイ手順

### 1. 前提条件

```bash
# AWS CLIの設定
aws configure

# 必要な権限
# - SageMaker FullAccess
# - S3 権限
# - IAM PassRole権限
```

### 2. S3バケットの設定

```bash
# deploy_to_sagemaker.shでS3_BUCKETを設定
vim deploy_to_sagemaker.sh
# S3_BUCKET="your-bucket-name" を設定
```

### 3. 自動デプロイ

```bash
# 全自動デプロイ
./deploy_to_sagemaker.sh all

# または段階的にデプロイ
./deploy_to_sagemaker.sh check      # 前提条件チェック
./deploy_to_sagemaker.sh package    # モデルパッケージング
./deploy_to_sagemaker.sh model      # SageMakerモデル作成
./deploy_to_sagemaker.sh config     # エンドポイント設定作成
./deploy_to_sagemaker.sh endpoint   # エンドポイント作成・待機
./deploy_to_sagemaker.sh test       # エンドポイントテスト
```

### 4. 手動デプロイ（詳細制御が必要な場合）

```bash
# 1. モデルパッケージ作成
python package_model.py --s3-bucket your-bucket-name

# 2. SageMakerコンソールまたはAWS CLIでエンドポイント作成
```

## Goサーバーの更新

SageMakerエンドポイントを使用するようにGoサーバーを更新する必要があります：

### 環境変数の追加

```env
# .env に追加
SAGEMAKER_ENDPOINT_NAME=sam-climbing-endpoint
AWS_REGION=us-east-1
USE_SAGEMAKER=true
```

### Goコードの変更例

```go
// internal/infra/imageExtraction.go での変更例
func (s *ImageExtractionService) Extraction(imageBytes []byte, points []domain.Point) ([]byte, []byte, error) {
    if os.Getenv("USE_SAGEMAKER") == "true" {
        return s.extractionViaSageMaker(imageBytes, points)
    }
    return s.extractionViaDirectAPI(imageBytes, points)
}

func (s *ImageExtractionService) extractionViaSageMaker(imageBytes []byte, points []domain.Point) ([]byte, []byte, error) {
    // AWS SDK v2を使用してSageMakerエンドポイントを呼び出し
    // 実装はsagemaker_client.pyを参考にGoで実装
}
```

## テスト

### ローカルテスト

```bash
# SageMakerクライアントのテスト
python sagemaker_client.py --endpoint-name sam-climbing-endpoint --test-image test_image.png
```

### エンドポイントヘルスチェック

```bash
# デプロイスクリプトでテスト
./deploy_to_sagemaker.sh test
```

## 監視とログ

### CloudWatch監視

- エンドポイントメトリクス: `AWS/SageMaker` 名前空間
- ログ: `/aws/sagemaker/Endpoints/sam-climbing-endpoint`

### 主要メトリクス

- `Invocations` - 呼び出し数
- `ModelLatency` - モデル処理時間
- `OverheadLatency` - オーバーヘッド時間
- `Invocation4XXErrors` - クライアントエラー
- `Invocation5XXErrors` - サーバーエラー

## コスト最適化

### インスタンスタイプの選択

```bash
# 開発・テスト環境
ml.g4dn.xlarge   # GPU有り、中程度の性能

# 本番環境（高トラフィック）
ml.g4dn.2xlarge  # より高性能

# 本番環境（低トラフィック）
ml.m5.large      # CPU のみ（性能は落ちるが安価）
```

### 自動スケーリング設定

```python
# エンドポイント作成時に自動スケーリング設定
predictor.update_endpoint(
    initial_instance_count=1,
    instance_type="ml.g4dn.xlarge",
    # 自動スケーリング設定も可能
)
```

## トラブルシューティング

### よくある問題

1. **エンドポイント作成失敗**
   - IAMロールの権限確認
   - モデルデータのS3パス確認

2. **推論エラー**
   - CloudWatchログで詳細確認
   - `inference.py`のエラーハンドリング確認

3. **レスポンス遅延**
   - インスタンスタイプのアップグレード検討
   - モデル最適化の検討

### ログ確認

```bash
# CloudWatchログの確認
aws logs describe-log-groups --log-group-name-prefix "/aws/sagemaker/Endpoints"

# 最新ログの取得
aws logs get-log-events --log-group-name "/aws/sagemaker/Endpoints/sam-climbing-endpoint" --log-stream-name "latest-stream"
```

## クリーンアップ

```bash
# エンドポイントとモデルの削除
./deploy_to_sagemaker.sh delete
```

## 次のステップ

1. **A/Bテスト**: 複数のモデルバージョンのテスト
2. **マルチモデルエンドポイント**: 複数モデルの効率的な運用
3. **バッチ変換**: 大量データの一括処理
4. **モデル最適化**: TensorRT、量子化による高速化

## サポート

問題がある場合：

1. CloudWatchログの確認
2. `sagemaker_client.py`でのローカルテスト
3. AWS SageMakerドキュメントの参照