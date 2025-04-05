package infra

import (
	pb "climbinsight/server/ai"
	"context"
	"encoding/base64"
	"fmt"
	"net/http"
	"time"

	"google.golang.org/grpc"
)

type ImageEditService struct {
	client pb.AIServiceClient
}

func NewImageEditService(conn *grpc.ClientConn) *ImageEditService {
	return &ImageEditService{client: pb.NewAIServiceClient(conn)}
}

func (ies *ImageEditService) Extraction(image []byte) (string, error) {
	// リクエスト構築
	imageBase64 := base64.StdEncoding.EncodeToString(image)
	mimeType := http.DetectContentType(image)
	imageDataURL := fmt.Sprintf("data:%s;base64,%s", mimeType, imageBase64)
	input := &pb.InputRequest{
		Input: imageDataURL,
	}

	// タイムアウト付きコンテキスト
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// RPC 呼び出し
	_, err := ies.client.Process(ctx, input)
	if err != nil {
		return "", err
	}
	return imageDataURL, nil
}
