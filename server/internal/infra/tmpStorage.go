package infra

import (
	"context"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type TmpStorage struct {
	Client *redis.Client
}

func NewTmpStorage() (*TmpStorage, error) {
	redisURL := os.Getenv("REDIS_URL") // 例: "redis://localhost:6379" または Upstash の rediss://...

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		panic("failed to parse Redis URL: " + err.Error())
	}

	client := redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		panic("failed to connect to Redis: " + err.Error())
	}

	return &TmpStorage{Client: client}, nil
}

func (t *TmpStorage) SaveProcessedImage(sessionId string, imageUrl string) error {
	ctx := context.Background()
	key := "session:" + sessionId

	// Hashに画像URLだけ先に追加
	err := t.Client.HSet(ctx, key, "url", imageUrl).Err()
	if err != nil {
		return err
	}

	// TTL（例: 1時間）を設定
	return t.Client.Expire(ctx, key, 1*time.Hour).Err()
}

func (t *TmpStorage) SaveGeneratedContent(sessionId string, content string) error {
	ctx := context.Background()
	key := "session:" + sessionId

	// Hashに画像URLだけ先に追加
	err := t.Client.HSet(ctx, key, "content", content).Err()
	if err != nil {
		return err
	}

	// TTL（例: 1時間）を設定
	return t.Client.Expire(ctx, key, 1*time.Hour).Err()
}
