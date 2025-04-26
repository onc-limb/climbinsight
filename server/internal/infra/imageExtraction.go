package infra

import (
	pb "climbinsight/server/ai"
	"climbinsight/server/internal/domain"
	"context"
	"fmt"
	"time"
)

type ImageEditService struct{}

func NewImageEditService() *ImageEditService {
	return &ImageEditService{}
}

func (ies *ImageEditService) Extraction(image []byte, points []domain.Point) ([]byte, error) {
	var ps []*pb.Point
	for _, p := range points {
		ps = append(ps, &pb.Point{X: p.X, Y: p.Y})
	}

	fmt.Println("point: ", ps)
	// リクエスト構築
	input := &pb.InputRequest{
		Image:  image,
		Points: ps,
	}

	// タイムアウト付きコンテキスト
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	// RPC 呼び出し
	res, err := aiClient.Process(ctx, input)
	if err != nil {
		return nil, err
	}
	return res.ProcessedImage, nil
}
