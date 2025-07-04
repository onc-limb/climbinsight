package presentation

import (
	"climbinsight/server/internal/usecase"
	"climbinsight/server/utils"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	generateUsecase *usecase.GenerateUsecase
	processUsecase  *usecase.ProcessUsecase
	resultUsecase   *usecase.ResultUsecase
}

func NewHandler(gu *usecase.GenerateUsecase, pu *usecase.ProcessUsecase, ru *usecase.ResultUsecase) *Handler {
	return &Handler{generateUsecase: gu, processUsecase: pu, resultUsecase: ru}
}

func (h *Handler) Process(c *gin.Context) {
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
	uuid := uuid.New().String()

	go func(uploadFile *usecase.UploadFile, points []usecase.Point, uuid string) {
		if err := h.processUsecase.Process(uploadFile, points, uuid); err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "画像抽出に失敗しました", err)
			return
		}
	}(uploadFile, points, uuid)
	// レスポンス出力
	c.JSON(http.StatusOK, gin.H{
		"session": uuid,
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

type ContentRequest struct {
	SessionId  string `json:"sessionId"`
	Grade      string `json:"grade"`
	Gym        string `json:"gym"`
	Style      string `json:"style"`
	TryCount   uint   `json:"tryCount"`
	IsGenerate bool   `json:"isGenerate"`
}

func (h *Handler) Generate(c *gin.Context) {
	var req ContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "リクエストの読み込みに失敗しました", err)
		return
	}

	fmt.Print(req)

	content := usecase.Contents{
		Grade:    req.Grade,
		Gym:      req.Gym,
		Style:    req.Style,
		TryCount: uint(req.TryCount),
	}

	go func(content usecase.Contents, sessionId string, isGenerate bool) {
		if err := h.generateUsecase.Generate(content, sessionId, isGenerate); err != nil {
			utils.RespondError(c, http.StatusBadRequest, "コンテントの保存に失敗しました", err)
			return
		}
	}(content, req.SessionId, req.IsGenerate)

	// レスポンス出力
	c.JSON(http.StatusOK, gin.H{
		"message": "content is accepted.",
	})

}

func (h *Handler) GetResult(c *gin.Context) {
	sessionID := c.Query("session")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "sessionId is required"})
		return
	}

	ctx := context.Background()

	// SSE用のヘッダー
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Flush()

	// タイムアウト付きContext（30秒など）
	timeoutCtx, cancel := context.WithTimeout(ctx, 5*time.Minute)
	defer cancel()

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-timeoutCtx.Done():
			// タイムアウト時に終了
			fmt.Fprintf(c.Writer, "event: timeout\ndata: {\"error\": \"timeout\"}\n\n")
			c.Writer.Flush()
			return

		case <-ticker.C:
			// Redisからデータを取得
			data, err := h.resultUsecase.GetResult(sessionID)
			if err != nil {
				log.Println("Redis error:", err)
				return
			}

			// 条件チェック
			if data != nil {
				// 揃ったらレスポンスを返して終了
				jsonData, _ := json.Marshal(map[string]string{
					"image":    data.Image,
					"contents": data.Content,
				})
				fmt.Fprintf(c.Writer, "data: %s\n\n", jsonData)
				c.Writer.Flush()
				return
			}
		}
	}
}

type InqueryBody struct {
	Category string `json:"category"`
	Email    string `json:"email"`
	Message  string `json:"message"`
}

func (h *Handler) SendInquery(c *gin.Context) {
	var req InqueryBody
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "リクエストの読み込みに失敗しました", err)
		return
	}

	formatMessage := fmt.Sprintf(`
		問い合わせの種類: %s
		連絡先: %s
		問い合わせ内容: %s
	`, req.Category, req.Email, req.Message)

	utils.NoticeToSlack("お問い合わせ", formatMessage)

	c.Status(http.StatusNoContent)
}
