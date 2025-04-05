package usecase

import (
	"climbinsight/server/internal/domain"
	"io"
	"mime/multipart"
)

type ProcessUsecase struct {
	aiService domain.IAiService
}

type Contents struct {
	Grade    string `form:"grade"`
	Gym      string `form:"gym"`
	Style    string `form:"style"`
	TryCount uint   `form:"tryCount"`
}

func NewProcessUsecase(as domain.IAiService) *ProcessUsecase {
	return &ProcessUsecase{aiService: as}
}

func (pu *ProcessUsecase) Process(file multipart.File, content Contents) (string, string, error) {

	imageBytes, err := io.ReadAll(file)
	if err != nil {
		return "", "", err
	}

	// 画像URL作成
	// imageBase64 := base64.StdEncoding.EncodeToString(imageBytes)
	// mimeType := http.DetectContentType(imageBytes)
	// imageDataURL := fmt.Sprintf("data:%s;base64,%s", mimeType, imageBase64)

	// AIサービスにリクエスト
	imageDataURL, err := pu.aiService.ImageExtraction(imageBytes)
	if err != nil {
		return "", "", err
	}

	// 投稿文生成処理
	postText := "投稿文"

	// レスポンス出力
	return imageDataURL, postText, nil
}
