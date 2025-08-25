package usecase

import (
	"bytes"
	"climbinsight/server/internal/domain"
	"fmt"
	"path/filepath"
	"sync"
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
	X float64 `json:"x"`
	Y float64 `json:"y"`
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
	err := pu.imageEditService.ExtractionAsync(*file.Data, domainPoints, sessionId)
	if err != nil {
		return err
	}

	var wg sync.WaitGroup

	//画像を保存
	maskName := fmt.Sprintf("mask/%s.%s", sessionId, filepath.Ext(file.FileName))
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := pu.imageStorageService.UploadImage(bytes.NewReader(mask_data), maskName, "image/png"); err != nil {
			fmt.Printf("Error uploading mask image: %v\n", err)
		}
	}()

	processedName := fmt.Sprintf("processed/%s.%s", sessionId, filepath.Ext(file.FileName))
	wg.Add(1) // 待機するゴルーチンの数をさらに1増やす
	go func() {
		defer wg.Done() // このゴルーチンが完了したら、待機数を1減らす
		if err := pu.imageStorageService.UploadImage(bytes.NewReader(processedImage), processedName, "image/png"); err != nil {
			fmt.Printf("Error uploading processed image: %v\n", err)
		}
	}()

	url, err := pu.imageStorageService.GeneratePresignedGetURL(processedName, file.ContentType)
	if err != nil {
		return err
	}

	// URLを一時保存
	pu.sessionStoreService.SaveProcessedImage(sessionId, url)

	// レスポンス出力
	return nil
}
