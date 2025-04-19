package presentation

import (
	"climbinsight/server/internal/usecase"
	"climbinsight/server/utils"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	generateUsecase *usecase.GenerateUsecase
	processUsecase  *usecase.ProcessUsecase
}

func NewHandler(gu *usecase.GenerateUsecase, pu *usecase.ProcessUsecase) *Handler {
	return &Handler{generateUsecase: gu, processUsecase: pu}
}

func (h *Handler) Process(c *gin.Context) {
	sessionId := "session"
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

	// 画像の座標を取得
	pointsJson := c.PostForm("points")
	var points []usecase.Point
	if err := json.Unmarshal([]byte(pointsJson), &points); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "pointの読み込みに失敗しました", err)
		return
	}

	if err := h.processUsecase.Process(uploadFile, points, sessionId); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "画像抽出に失敗しました", err)
		return
	}
	// レスポンス出力
	c.JSON(http.StatusOK, gin.H{
		"message": "image is accepted.",
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

func (h *Handler) Generate(c *gin.Context) {
	sessionId := "session"
	var content usecase.Contents
	if err := c.Bind(&content); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "コンテントの読み込みに失敗しました", err)
		return
	}

	if err := h.generateUsecase.Generate(content, sessionId); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "コンテントの保存に失敗しました", err)
		return
	}

	// レスポンス出力
	c.JSON(http.StatusOK, gin.H{
		"message": "content is accepted.",
	})

}

func (h *Handler) GetResult(c *gin.Context) {

}
