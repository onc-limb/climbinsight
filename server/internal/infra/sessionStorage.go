package infra

import (
	"climbinsight/server/internal/domain"
	"context"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type sessionStoreService struct {
	Client *redis.Client
}

func NewSessionStoreService() (*sessionStoreService, error) {
	redisURL := os.Getenv("REDIS_URL")

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

	return &sessionStoreService{Client: client}, nil
}

func (ss *sessionStoreService) SaveProcessedImage(sessionId string, imageUrl string) error {
	ctx := context.Background()
	key := "session:" + sessionId

	err := ss.Client.HSet(ctx, key, "url", imageUrl).Err()
	if err != nil {
		return err
	}

	return ss.Client.Expire(ctx, key, 1*time.Hour).Err()
}

func (ss *sessionStoreService) SaveGeneratedContent(sessionId string, content string) error {
	ctx := context.Background()
	key := "session:" + sessionId

	err := ss.Client.HSet(ctx, key, "content", content).Err()
	if err != nil {
		return err
	}

	return ss.Client.Expire(ctx, key, 1*time.Hour).Err()
}

func (ss *sessionStoreService) GetResult(sessionId string) (*domain.Result, error) {
	ctx := context.Background()
	key := "session:" + sessionId

	values, err := ss.Client.HMGet(ctx, key, "url", "content").Result()
	if err != nil {
		return nil, err
	}

	image, ok1 := values[0].(string)
	content, ok2 := values[1].(string)

	if !ok1 || !ok2 || image == "" || content == "" {
		return nil, nil
	}

	return &domain.Result{
		Image:   image,
		Content: content,
	}, nil
}
