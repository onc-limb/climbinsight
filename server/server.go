package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
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
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("❌ 環境変数取得に失敗: %v", err)
	}
	conn, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("❌ 接続に失敗: %v", err)
	}
	defer conn.Close()

	// AIサービスの作成
	ies := infra.NewImageEditService(conn)

	tgs := infra.NewTextGenerateService()

	sh, _ := infra.NewStorageHandler()

	ph := presentation.NewProcessHandler(ies, tgs, sh)

	r := gin.Default()

	// fixme: デプロイ前に詳細を設定する
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{os.Getenv("ALLOWED_ORIGIN")},
		AllowMethods:     []string{"GET", "POST", "OPTION"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: false,
		MaxAge:           24 * time.Hour,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "healthy",
		})
	})

	r.POST("/process", ph.Process)

	r.Run(":8080")
}
