# ビルドステージ
FROM golang:1.24.2 AS builder

# ワークディレクトリの設定
WORKDIR /app

# ソースコードのコピー
COPY . .

# 依存関係解決
RUN go mod download

# ビルド
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main .

# 実行ステージ
FROM alpine:3.21.3

# ポートの公開
EXPOSE 8080

WORKDIR /app

# ビルドステージから実行ファイルをコピー
COPY --from=builder /app/main ./main

# 実行
CMD ["./main"]

