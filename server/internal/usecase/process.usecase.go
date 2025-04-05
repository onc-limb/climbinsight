package usecase

import (
	"climbinsight/server/internal/domain"
	"io"
	"mime/multipart"
)

type ProcessUsecase struct {
	imageEditService domain.IImageEditService
}

type Contents struct {
	Grade    string `form:"grade"`
	Gym      string `form:"gym"`
	Style    string `form:"style"`
	TryCount uint   `form:"tryCount"`
}

func NewProcessUsecase(ies domain.IImageEditService) *ProcessUsecase {
	return &ProcessUsecase{imageEditService: ies}
}

func (pu *ProcessUsecase) Process(file multipart.File, content Contents) (string, string, error) {

	imageBytes, err := io.ReadAll(file)
	if err != nil {
		return "", "", err
	}

	// AIサービスにリクエスト
	imageDataURL, err := pu.imageEditService.Extraction(imageBytes)
	if err != nil {
		return "", "", err
	}

	// 投稿文生成処理
	postText := "投稿文"

	// レスポンス出力
	return imageDataURL, postText, nil
}
