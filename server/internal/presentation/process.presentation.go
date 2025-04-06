package presentation

import (
	"climbinsight/server/internal/domain"
	"climbinsight/server/internal/usecase"
	"climbinsight/server/utils"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProcessHandler struct {
	services usecase.Services
	storage  domain.IStorageHandler
}

func NewProcessHandler(ies domain.IImageEditService, tgs domain.ITextGenerateService, sh domain.IStorageHandler) *ProcessHandler {
	return &ProcessHandler{services: usecase.Services{ImageEditService: ies, TextGenerateService: tgs}, storage: sh}
}

func (ph *ProcessHandler) Process(c *gin.Context) {
	// 画像ファイルを受け取る
	fh, err := c.FormFile("image")
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "画像のアップロードに失敗しました", err)
		return
	}

	uploadFile, err := preseUpdateFile(fh)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "画像の読み込みに失敗しました", err)
		return
	}

	var content usecase.Contents
	if err := c.Bind(&content); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "コンテントの読み込みに失敗しました", err)
		return
	}

	u := usecase.NewProcessUsecase(ph.services, ph.storage)
	imageDataURL, post, err := u.Process(uploadFile, content)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "画像抽出に失敗しました", err)
		return
	}
	// レスポンス出力
	c.JSON(http.StatusOK, gin.H{
		"imageData": imageDataURL,
		"content":   post,
	})
}

func preseUpdateFile(fh *multipart.FileHeader) (*usecase.UploadFile, error) {
	file, err := fh.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()

	imageBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	return &usecase.UploadFile{
		FileName:    fh.Filename,
		ContentType: fh.Header.Get("Content-Type"),
		Data:        &imageBytes,
	}, nil
}
