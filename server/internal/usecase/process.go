package usecase

import (
	"bytes"
	"climbinsight/server/internal/domain"
	"fmt"
	"net/http"
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

// detectImageContentType detects the content type of image binary data
func detectImageContentType(data []byte) string {
	// Use http.DetectContentType for automatic detection
	contentType := http.DetectContentType(data)
	
	// Fallback to specific image type detection if http.DetectContentType fails
	switch {
	case len(data) >= 8 && data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47:
		return "image/png"
	case len(data) >= 3 && data[0] == 0xFF && data[1] == 0xD8 && data[2] == 0xFF:
		return "image/jpeg"
	case len(data) >= 6 && string(data[0:6]) == "GIF87a" || string(data[0:6]) == "GIF89a":
		return "image/gif"
	case len(data) >= 12 && string(data[8:12]) == "WEBP":
		return "image/webp"
	default:
		// Return the result from http.DetectContentType, or default to PNG
		if contentType != "application/octet-stream" {
			return contentType
		}
		return "image/png" // Default fallback
	}
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
	processedImage, mask_data, err := pu.imageEditService.Extraction(*file.Data, domainPoints)
	if err != nil {
		return err
	}

	var wg sync.WaitGroup

	// Detect content types for processed images
	maskContentType := detectImageContentType(mask_data)
	processedContentType := detectImageContentType(processedImage)

	//画像を保存
	maskName := fmt.Sprintf("mask/%s.%s", sessionId, filepath.Ext(file.FileName))
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := pu.imageStorageService.UploadImage(bytes.NewReader(mask_data), maskName, maskContentType); err != nil {
			fmt.Printf("Error uploading mask image: %v\n", err)
		}
	}()

	processedName := fmt.Sprintf("processed/%s.%s", sessionId, filepath.Ext(file.FileName))
	wg.Add(1) // 待機するゴルーチンの数をさらに1増やす
	go func() {
		defer wg.Done() // このゴルーチンが完了したら、待機数を1減らす
		if err := pu.imageStorageService.UploadImage(bytes.NewReader(processedImage), processedName, processedContentType); err != nil {
			fmt.Printf("Error uploading processed image: %v\n", err)
		}
	}()

	url, err := pu.imageStorageService.GeneratePresignedGetURL(processedName, processedContentType)
	if err != nil {
		return err
	}

	// URLを一時保存
	pu.sessionStoreService.SaveProcessedImage(sessionId, url)

	// レスポンス出力
	return nil
}
