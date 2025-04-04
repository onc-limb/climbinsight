package main

import (
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	pb "climbinsight/server/ai"
)

type Contents struct {
	Grade    string `form:"grade"`
	Gym      string `form:"gym"`
	Style    string `form:"style"`
	TryCount uint   `form:"tryCount"`
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
	// 画像ファイルを受け取る
	handler, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "画像のアップロードに失敗しました"})
		return
	}
	file, err := handler.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ファイルが開けませんでした"})
		return
	}
	defer file.Close()

	imageBytes, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ファイルの読み込みに失敗しました"})
		return
	}
	imageBase64 := base64.StdEncoding.EncodeToString(imageBytes)
	mimeType := http.DetectContentType(imageBytes)
	imageDataURL := fmt.Sprintf("data:%s;base64,%s", mimeType, imageBase64)

	var content Contents
	if err := c.Bind(&content); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	// リクエスト構築
	// input := &pb.InputRequest{
	// 	Input: string(imageBytes),
	// }

	// // タイムアウト付きコンテキスト
	// ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	// defer cancel()

	// // RPC 呼び出し
	// res, err := client.AiClient.Process(ctx, input)
	// if err != nil {
	// 	log.Fatalf("❌ 呼び出し失敗: %v", err)
	// }

	// レスポンス出力
	c.JSON(http.StatusOK, gin.H{
		"imageData": imageDataURL,
		"content":   content.Grade + " : " + content.Gym + " : " + content.Style + " : " + strconv.Itoa(int(content.TryCount)) + ";",
	})
}
