package infra

import (
	pb "climbinsight/server/ai"
	"climbinsight/server/internal/domain"
	"context"
	"encoding/base64"
	"fmt"
	"net/http"
	"time"

	"google.golang.org/grpc"
)

type AiService struct {
	client domain.AiClient
}

func NewAIService(conn *grpc.ClientConn) *AiService {
	return &AiService{client: pb.NewAIServiceClient(conn)}
}

func (as *AiService) ImageExtraction(image []byte) (string, error) {
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
	_, err := as.client.Process(ctx, input)
	if err != nil {
		return "", err
	}
	return imageDataURL, nil
}
