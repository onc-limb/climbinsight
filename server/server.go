package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	pb "climbinsight/server/ai"
)

type Request struct {
	Input string `json:"input"`
}

type Client struct {
	AiClient pb.AIServiceClient
}

func main() {
	conn, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("❌ 接続に失敗: %v", err)
	}
	defer conn.Close()

	// クライアントの作成
	client := &Client{
		AiClient: pb.NewAIServiceClient(conn),
	}

	r := gin.Default()

	// fixme: デプロイ前に詳細を設定する
	r.Use(cors.Default())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "healthy",
		})
	})

	r.POST("/process", client.process)

	r.Run(":8080")
}

func (client *Client) process(c *gin.Context) {
	var req Request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	// リクエスト構築
	input := &pb.InputRequest{
		Input: req.Input,
	}

	// タイムアウト付きコンテキスト
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// RPC 呼び出し
	res, err := client.AiClient.Process(ctx, input)
	if err != nil {
		log.Fatalf("❌ 呼び出し失敗: %v", err)
	}

	// レスポンス出力
	c.JSON(http.StatusOK, gin.H{
		"result": fmt.Sprintf(`✅ AI応答: %s`, res.Output),
	})
}
