protoc \
 -I ./proto \
 --go_out ./server/ai --go_opt=paths=source_relative \
 --go-grpc_out ./server/ai --go-grpc_opt=paths=source_relative \
 ./proto/ai.proto
