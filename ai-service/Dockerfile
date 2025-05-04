# ビルドステージ
FROM python:3.13 AS builder

# 作業ディレクトリを作成
WORKDIR /app

# 必要ファイルをコピー
COPY requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt

# 実行ステージ
FROM python:3.13-slim
COPY /app /app
COPY --from=builder /usr/local/lib/python3.13 /usr/local/lib/python3.13

RUN apt-get update && apt-get install -y libgl1 && apt-get clean

RUN find /usr/local -depth \
  \( -name '__pycache__' -o -name '*.pyc' -o -name '*.pyo' \) \
  -exec rm -rf '{}' +

# サーバーを起動するコマンド
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
