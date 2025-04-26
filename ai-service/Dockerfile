# ビルドステージ
FROM python:3.13 AS builder

# 作業ディレクトリを作成
WORKDIR /app

# 必要ファイルをコピー
COPY requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt

# 実行ステージ
FROM python:3.13
WORKDIR /app

RUN apt-get update && apt-get install -y libgl1 && apt-get clean

COPY /app /app
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages

# サーバーを起動するコマンド
CMD ["python", "server.py"]