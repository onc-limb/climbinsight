package infra

import (
	"context"
	"fmt"
	"os"

	"github.com/cohesion-org/deepseek-go"
)

const systemMessage = `あなたはInstagram投稿文とハッシュタグを生成するアシスタントです。
出力形式を厳密に守ってください。本文はカジュアルでテンション高めの口調にしてください。
出力には余計なコメントを付けず、指定された形式に完全に従ってください。
ハッシュタグには#{ジム名}、#{グレード}、#{スタイル}を入れてください。
ハッシュタグには必ず#climbinsight、#ボルダリングを入れてください。`

type generativeClient interface {
	CreateChatCompletion(
		ctx context.Context,
		request *deepseek.ChatCompletionRequest,
	) (*deepseek.ChatCompletionResponse, error)
}

type dummyClient struct{}

func (d dummyClient) CreateChatCompletion(
	ctx context.Context,
	request *deepseek.ChatCompletionRequest,
) (*deepseek.ChatCompletionResponse, error) {
	return &deepseek.ChatCompletionResponse{
		Choices: []deepseek.Choice{
			{
				Message: deepseek.Message{
					Content: "仮のテキストです",
				},
			},
		},
	}, nil
}

type textGenerateService struct {
	client generativeClient
}

func NewTextGenerateService() *textGenerateService {
	if os.Getenv("ENV") == "prd" {
		client := deepseek.NewClient(os.Getenv("DEEPSEEK_API_KEY"))
		return &textGenerateService{client: client}
	} else {
		return &textGenerateService{client: &dummyClient{}}
	}
}

func (tgs *textGenerateService) Generate(grade, gym, style string, tryCount uint) (string, error) {
	impression := "登れて嬉しかった"
	userMessage := fmt.Sprintf(`以下の情報を元にInstagramに投稿するための文章とハッシュタグを作ってください。

		ジム名: %s
		グレード: %s
		スタイル: %s
		トライ回数: %d
		感想: %s
		
		# 出力形式:
		<ここに投稿文>
		
		<ハッシュタグ>
		#タグ1 #タグ2 #タグ3 ...
		`, gym, grade, style, tryCount, impression)

	req := &deepseek.ChatCompletionRequest{
		Model: deepseek.DeepSeekChat,
		Messages: []deepseek.ChatCompletionMessage{
			{Role: deepseek.ChatMessageRoleSystem, Content: systemMessage},
			{Role: deepseek.ChatMessageRoleUser, Content: userMessage},
		},
	}
	ctx := context.Background()
	res, err := tgs.client.CreateChatCompletion(ctx, req)
	if err != nil {
		return "", err
	}
	return res.Choices[0].Message.Content, nil
}
