package infra

import (
	"context"

	"github.com/cohesion-org/deepseek-go"
)

type TextGenerateService struct {
	client *deepseek.Client
}

func NewTextGenerateService(client *deepseek.Client) *TextGenerateService {
	return &TextGenerateService{client: client}
}

func (tgs *TextGenerateService) Generate(grade, gym, style string, tryCount uint) (string, error) {
	req := &deepseek.ChatCompletionRequest{
		Model: deepseek.DeepSeekChat,
		Messages: []deepseek.ChatCompletionMessage{
			{Role: deepseek.ChatMessageRoleSystem, Content: ""},
			{Role: deepseek.ChatMessageRoleUser, Content: ""},
		},
	}
	ctx := context.Background()
	res, err := tgs.client.CreateChatCompletion(ctx, req)
	if err != nil {
		return "", err
	}
	return res.Choices[0].Message.Content, nil
}
