package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	pb "climbinsight/server/ai"
	"climbinsight/server/internal/infra"
	"climbinsight/server/internal/presentation"
)

type Client struct {
	AiClient pb.AIServiceClient
}

func main() {
	conn, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("❌ 接続に失敗: %v", err)
	}
	defer conn.Close()

	// AIサービスの作成
	ies := infra.NewImageEditService(conn)

	ph := presentation.NewProcessHandler(ies)

	r := gin.Default()

	// fixme: デプロイ前に詳細を設定する
	r.Use(cors.Default())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "healthy",
		})
	})

	r.POST("/process", ph.Process)

	r.Run(":8080")
}
