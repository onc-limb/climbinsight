package usecase

import (
	"bytes"
	"climbinsight/server/internal/domain"
	"fmt"
	"path/filepath"
)

type ProcessUsecase struct {
	imageEditService    domain.IImageEditService
	imageStorageService domain.IImageStorageService
	sessionStoreService domain.ISessionStoreService
}

type UploadFile struct {
	FileName    string
	ContentType string
	Data        *[]byte
}

type Point struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
}

func NewProcessUsecase(ies domain.IImageEditService, iss domain.IImageStorageService, sss domain.ISessionStoreService) *ProcessUsecase {
	return &ProcessUsecase{imageEditService: ies, imageStorageService: iss, sessionStoreService: sss}
}

func (pu *ProcessUsecase) Process(file *UploadFile, points []Point, sessionId string) error {
	// 画像を保存
	originName := fmt.Sprintf("original/%s.%s", sessionId, filepath.Ext(file.FileName))
	if err := pu.imageStorageService.UploadImage(bytes.NewReader(*file.Data), originName, file.ContentType); err != nil {
		return err
	}

	var domainPoints []domain.Point
	for _, p := range points {
		domainPoints = append(domainPoints, domain.Point{X: p.X, Y: p.Y})
	}
	// AIサービスにリクエスト
	processedImage, err := pu.imageEditService.Extraction(*file.Data, domainPoints)
	if err != nil {
		return err
	}

	//画像を保存
	processedName := fmt.Sprintf("processed/%s.%s", sessionId, filepath.Ext(file.FileName))
	if err := pu.imageStorageService.UploadImage(bytes.NewReader(processedImage), processedName, "image/png"); err != nil {
		return err
	}

	url, err := pu.imageStorageService.GeneratePresignedGetURL(processedName, file.ContentType)
	if err != nil {
		return err
	}

	// URLを一時保存
	pu.sessionStoreService.SaveProcessedImage(sessionId, url)

	// レスポンス出力
	return nil
}
