# ビルドステージ
FROM python:3.13 AS builder

# 作業ディレクトリを作成
WORKDIR /app

# 必要ファイルをコピー
COPY requirements.txt .
RUN python -m venv /opt/venv && \
  /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# 実行ステージ
FROM python:3.13-slim
WORKDIR /app

COPY /app .
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN find /usr/local -depth \
  \( -name '__pycache__' -o -name '*.pyc' -o -name '*.pyo' -o -name '*.dist-info' -o -name '*.egg-info' \) \
  -exec rm -rf '{}' +

# サーバーを起動するコマンド
CMD ["sh", "-c", "hypercorn server:app --bind 0.0.0.0:${PORT:-8000} --bind [::]:${PORT:-8000} --workers 4"]