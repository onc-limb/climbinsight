package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"climbinsight/server/ai"
	pb "climbinsight/server/ai"
)

type Request struct {
	Input string `json:"input"`
}

type AIServiceClient interface {
	Process(ctx context.Context, req *ai.InputRequest) (*ai.OutputResponse, error)
}

func main() {
	conn, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("❌ 接続に失敗: %v", err)
	}
	defer conn.Close()

	// クライアントの作成
	client := pb.NewAIServiceClient(conn)

	// リクエスト構築
	req := &pb.InputRequest{
		Input: "Hello from Go!",
	}

	// タイムアウト付きコンテキスト
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// RPC 呼び出し
	res, err := client.Process(ctx, req)
	if err != nil {
		log.Fatalf("❌ 呼び出し失敗: %v", err)
	}

	// レスポンス出力
	log.Printf("✅ AI応答: %s", res.Output)

	r := gin.Default()

	// fixme: デプロイ前に詳細を設定する
	r.Use(cors.Default())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "healthy",
		})
	})

	r.POST("/process", process)

	r.Run(":8080")
}

func process(c *gin.Context) {
	var req Request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"result": "ok",
	})
}
