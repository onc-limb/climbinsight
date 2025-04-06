package usecase

import (
	"bytes"
	"climbinsight/server/internal/domain"
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

type UploadFile struct {
	FileName    string
	ContentType string
	Data        *[]byte
}

func NewProcessUsecase(srv Services, sh domain.IStorageHandler) *ProcessUsecase {
	return &ProcessUsecase{services: srv, storage: sh}
}

func (pu *ProcessUsecase) Process(file *UploadFile, content Contents) (string, string, error) {

	// AIサービスにリクエスト
	imageDataURL, err := pu.services.ImageEditService.Extraction(*file.Data)
	if err != nil {
		return "", "", err
	}

	// 画像を保存
	pu.storage.UploadImage(bytes.NewReader(*file.Data), file.FileName, file.ContentType)

	// 投稿文生成処理\
	postText, err := pu.services.TextGenerateService.Generate(content.Grade)
	if err != nil {
		return "", "", err
	}

	// レスポンス出力
	return imageDataURL, postText, nil
}
