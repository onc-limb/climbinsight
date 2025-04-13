package infra

import (
	pb "climbinsight/server/ai"
	"context"
	"time"

	"google.golang.org/grpc"
)

type ImageEditService struct {
	client pb.AIServiceClient
}

func NewImageEditService(conn *grpc.ClientConn) *ImageEditService {
	return &ImageEditService{client: pb.NewAIServiceClient(conn)}
}

func (ies *ImageEditService) Extraction(image []byte) ([]byte, error) {
	// リクエスト構築
	input := &pb.InputRequest{
		Input: image,
	}

	// タイムアウト付きコンテキスト
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// RPC 呼び出し
	res, err := ies.client.Process(ctx, input)
	if err != nil {
		return nil, err
	}
	return res.ProcessedImage, nil
}
