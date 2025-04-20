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
	"climbinsight/server/internal/usecase"
)

const maxMsgSize = 20 * 1024 * 1024 // 20MB

type Client struct {
	AiClient pb.AIServiceClient
}

func init() {
	if os.Getenv("ENV") == "" {
		if err := godotenv.Load(".env"); err != nil {
			log.Fatalf("❌ 環境変数取得に失敗: %v", err)
		}
	}
}

func main() {
	// gRPCコネクション作成
	conn, err := grpc.NewClient("localhost:50051",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithDefaultCallOptions(
			grpc.MaxCallRecvMsgSize(maxMsgSize),
			grpc.MaxCallSendMsgSize(maxMsgSize),
		))
	if err != nil {
		log.Fatalf("❌ 接続に失敗: %v", err)
	}
	defer conn.Close()

	// サービス群作成
	ies := infra.NewImageEditService(conn)
	tgs := infra.NewTextGenerateService()
	sh, _ := infra.NewimageStorageService()
	ts, _ := infra.NewSessionStoreService()

	// ユースケース群作成
	gu := usecase.NewGenerateUsecase(tgs, ts)
	pu := usecase.NewProcessUsecase(ies, sh, ts)
	ru := usecase.NewResultUsecase(ts)

	h := presentation.NewHandler(gu, pu, ru)

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

	r.GET("/result", h.GetResult)

	images := r.Group("/images")
	images.POST("/process", h.Process)

	contents := r.Group("/contents")
	contents.POST("/generate", h.Generate)

	r.Run(":8080")
}
