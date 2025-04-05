package presentation

import (
	"climbinsight/server/internal/domain"
	"climbinsight/server/internal/usecase"
	"climbinsight/server/utils"
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
	var content usecase.Contents
	if err := c.Bind(&content); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid input", err)
		return
	}

	u := usecase.NewProcessUsecase(ph.services, ph.storage)
	imageDataURL, post, err := u.Process(fh, content)
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
