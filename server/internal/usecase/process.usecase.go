package usecase

import (
	"bytes"
	"climbinsight/server/internal/domain"
	"fmt"
	"path/filepath"

	"github.com/google/uuid"
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

type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

func NewProcessUsecase(srv Services, sh domain.IStorageHandler) *ProcessUsecase {
	return &ProcessUsecase{services: srv, storage: sh}
}

func (pu *ProcessUsecase) Process(file *UploadFile, points []Point, content Contents) (string, string, error) {
	imageId := uuid.New().String()
	// 画像を保存
	originName := fmt.Sprintf("original/%s.%s", imageId, filepath.Ext(file.FileName))
	if err := pu.storage.UploadImage(bytes.NewReader(*file.Data), originName, file.ContentType); err != nil {
		return "", "", err
	}

	var domainPoints []domain.Point
	for _, p := range points {
		domainPoints = append(domainPoints, domain.Point{X: p.X, Y: p.Y})
	}
	// AIサービスにリクエスト
	processedImage, err := pu.services.ImageEditService.Extraction(*file.Data, domainPoints)
	if err != nil {
		return "", "", err
	}

	//画像を保存
	processedName := fmt.Sprintf("processed/%s.%s", imageId, filepath.Ext(file.FileName))
	if err := pu.storage.UploadImage(bytes.NewReader(processedImage), processedName, "image/png"); err != nil {
		return "", "", err
	}

	url, err := pu.storage.GeneratePresignedGetURL(processedName, file.ContentType)
	if err != nil {
		return "", "", err
	}

	// 投稿文生成処理
	postText, err := pu.services.TextGenerateService.Generate(content.Grade, content.Gym, content.Style, content.TryCount)
	if err != nil {
		return "", "", err
	}

	// レスポンス出力
	return url, postText, nil
}
