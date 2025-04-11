package main

import (
	"log"
	"os"
	"time"

	"github.com/cohesion-org/deepseek-go"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	pb "climbinsight/server/ai"
	"climbinsight/server/internal/domain"
	"climbinsight/server/internal/infra"
	"climbinsight/server/internal/presentation"
)

type Client struct {
	AiClient pb.AIServiceClient
}

type dummyService struct{}

func (d dummyService) Generate(grade, gym, style string, tryCount uint) (string, error) {
	return "ローカル環境で実行しました。", nil
}

func init() {
	if os.Getenv("ENV") == "" {
		if err := godotenv.Load(".env"); err != nil {
			log.Fatalf("❌ 環境変数取得に失敗: %v", err)
		}
	}
}

func main() {
	conn, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("❌ 接続に失敗: %v", err)
	}
	defer conn.Close()

	// AIサービスの作成
	ies := infra.NewImageEditService(conn)

	// 生成AIサービスの作成
	var tgs any
	if os.Getenv("ENV") == "prd" {
		tgs = infra.NewTextGenerateService(deepseek.NewClient(os.Getenv("DEEPSEEK_API_KEY")))
	} else {
		tgs = dummyService{}
	}

	sh, _ := infra.NewStorageHandler()

	ph := presentation.NewProcessHandler(ies, tgs.(domain.ITextGenerateService), sh)

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
