# ビルドステージ
FROM python:3.13

# 作業ディレクトリを作成
WORKDIR /app

# 必要ファイルをコピー
COPY requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt

COPY /app /app

RUN apt-get update && apt-get install -y libgl1 && apt-get clean

# サーバーを起動するコマンド
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
