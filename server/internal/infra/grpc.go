package infra

import (
	"context"
	"log"
	"os"
	"time"

	pb "climbinsight/server/ai"

	"google.golang.org/grpc"
	"google.golang.org/grpc/connectivity"
	"google.golang.org/grpc/credentials/insecure"
)

const maxMsgSize = 20 * 1024 * 1024 // 20MB

var (
	GRPCConn *grpc.ClientConn
	aiClient pb.AIServiceClient
)

func ConnectGRPCInBackground() {
	go func() {
		for {
			if GRPCConn == nil || GRPCConn.GetState() == connectivity.Shutdown {
				log.Println("🔄 gRPC未接続 or シャットダウン状態。接続を試みます...")
				connect()
			}

			if GRPCConn != nil {
				state := GRPCConn.GetState()
				GRPCConn.WaitForStateChange(context.Background(), state)
				log.Printf("⚡ gRPCコネクション状態変化: %s -> %s", state.String(), GRPCConn.GetState().String())
			}

			// ちょっと休憩（無限ループ高速回り防止）
			time.Sleep(5 * time.Second)
		}
	}()
}

func connect() {
	for {
		// gRPCコネクション作成
		conn, err := grpc.NewClient(os.Getenv("AI_SERVER_URL"),
			grpc.WithTransportCredentials(insecure.NewCredentials()),
			grpc.WithDefaultCallOptions(
				grpc.MaxCallRecvMsgSize(maxMsgSize),
				grpc.MaxCallSendMsgSize(maxMsgSize),
			))
		if err == nil {
			if GRPCConn != nil {
				log.Println("🔌 古いgRPC接続をクローズします")
				GRPCConn.Close()
			}
			GRPCConn = conn
			aiClient = pb.NewAIServiceClient(GRPCConn)
			log.Println("✅ gRPC接続成功")
			return
		}
		log.Printf("❌ gRPC接続失敗: %v。5秒後再試行...", err)
		time.Sleep(5 * time.Second)
	}
}
