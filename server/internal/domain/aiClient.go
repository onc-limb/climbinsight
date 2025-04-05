package domain

import (
	pb "climbinsight/server/ai"
	"context"

	"google.golang.org/grpc"
)

type AiClient interface {
	Process(context.Context, *pb.InputRequest, ...grpc.CallOption) (*pb.OutputResponse, error)
}

type IAiService interface {
	ImageExtraction([]byte) (string, error)
}
