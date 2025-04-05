package usecase

import (
	"climbinsight/server/internal/domain"
	"io"
	"mime/multipart"
)

type ProcessUsecase struct {
	services Services
	storage  domain.IStorageHandler
}

type Services struct {
	ImageEditService    domain.IImageEditService
	TextGenerateService domain.ITextGenerateService
}

type Contents struct {
	Grade    string `form:"grade"`
	Gym      string `form:"gym"`
	Style    string `form:"style"`
	TryCount uint   `form:"tryCount"`
}

func NewProcessUsecase(srv Services, sh domain.IStorageHandler) *ProcessUsecase {
	return &ProcessUsecase{services: srv, storage: sh}
}

func (pu *ProcessUsecase) Process(file multipart.File, content Contents) (string, string, error) {

	imageBytes, err := io.ReadAll(file)
	if err != nil {
		return "", "", err
	}

	// AIサービスにリクエスト
	imageDataURL, err := pu.services.ImageEditService.Extraction(imageBytes)
	if err != nil {
		return "", "", err
	}

	// 画像を保存
	pu.storage.UploadImage(file, "file_name", "image/jpeg")

	// 投稿文生成処理\
	postText, err := pu.services.TextGenerateService.Generate(content.Grade)
	if err != nil {
		return "", "", err
	}

	// レスポンス出力
	return imageDataURL, postText, nil
}
