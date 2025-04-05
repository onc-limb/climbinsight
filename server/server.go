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
	as := infra.NewAIService(conn)

	ph := presentation.NewProcessHandler(as)

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

// func (client *Client) process(c *gin.Context) {
// 	// 画像ファイルを受け取る
// 	handler, err := c.FormFile("image")
// 	if err != nil {
// 		utils.RespondError(c, http.StatusBadRequest, "画像のアップロードに失敗しました", err)
// 		return
// 	}
// 	file, err := handler.Open()
// 	if err != nil {
// 		utils.RespondError(c, http.StatusInternalServerError, "ファイルが開けませんでした", err)
// 		return
// 	}
// 	defer file.Close()

// 	imageBytes, err := io.ReadAll(file)
// 	if err != nil {
// 		utils.RespondError(c, http.StatusInternalServerError, "ファイルの読み込みに失敗しました", err)
// 		return
// 	}
// 	imageBase64 := base64.StdEncoding.EncodeToString(imageBytes)
// 	mimeType := http.DetectContentType(imageBytes)
// 	imageDataURL := fmt.Sprintf("data:%s;base64,%s", mimeType, imageBase64)

// 	var content Contents
// 	if err := c.Bind(&content); err != nil {
// 		utils.RespondError(c, http.StatusBadRequest, "Invalid input", err)
// 		return
// 	}
// 	// リクエスト構築
// 	input := &pb.InputRequest{
// 		Input: string(imageBytes),
// 	}

// 	// タイムアウト付きコンテキスト
// 	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
// 	defer cancel()

// 	// RPC 呼び出し
// 	res, err := client.AiClient.Process(ctx, input)
// 	if err != nil {
// 		log.Fatalf("❌ 呼び出し失敗: %v", err)
// 	}

// 	// レスポンス出力
// 	c.JSON(http.StatusOK, gin.H{
// 		"imageData": imageDataURL,
// 		"content":   content.Grade + " : " + content.Gym + " : " + content.Style + " : " + strconv.Itoa(int(content.TryCount)) + ";",
// 	})
// }
