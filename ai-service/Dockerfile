# ビルドステージ
FROM python:3.13 AS builder

# 作業ディレクトリを作成
WORKDIR /app

# 必要ファイルをコピー
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 実行ステージ
FROM python:3.13-slim
WORKDIR /app

COPY /app .
COPY --from=builder /usr/local /usr/local

RUN find /usr/local -depth \
  \( -name '__pycache__' -o -name '*.pyc' -o -name '*.pyo' \) \
  -exec rm -rf '{}' +

# サーバーを起動するコマンド
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
