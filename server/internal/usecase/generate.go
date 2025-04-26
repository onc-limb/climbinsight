package usecase

import (
	"climbinsight/server/internal/domain"
	"fmt"
)

type GenerateUsecase struct {
	textGenerateService domain.ITextGenerateService
	sessionStoreService domain.ISessionStoreService
}

type Contents struct {
	Grade    string `form:"grade"`
	Gym      string `form:"gym"`
	Style    string `form:"style"`
	TryCount uint   `form:"tryCount"`
}

func NewGenerateUsecase(tgs domain.ITextGenerateService, sss domain.ISessionStoreService) *GenerateUsecase {
	return &GenerateUsecase{textGenerateService: tgs, sessionStoreService: sss}
}

func (gu *GenerateUsecase) Generate(content Contents, sessionId string, isGenerate bool) error {
	postText := fmt.Sprintf("#climbinsight #%s #%s #%s", content.Gym, content.Grade, content.Style)
	var err error
	// 投稿文生成処理
	if isGenerate {
		postText, err = gu.textGenerateService.Generate(content.Grade, content.Gym, content.Style, content.TryCount)
		if err != nil {
			return err
		}
	}

	if err := gu.sessionStoreService.SaveGeneratedContent(sessionId, postText); err != nil {
		return err
	}

	// レスポンス出力
	return nil
}
