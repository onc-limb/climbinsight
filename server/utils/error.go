package utils

import (
	"log/slog"

	"github.com/gin-gonic/gin"
)

// ErrorResponse は API のエラーレスポンスの共通フォーマット
type ErrorResponse struct {
	Error string `json:"error"`
}

// RespondError はエラーをログに記録し、JSON形式でレスポンスを返す
func RespondError(c *gin.Context, status int, message string, err error) {
	// ログ出力（詳細エラー付き）
	slog.Error(message,
		slog.Int("status", status),
		slog.String("path", c.FullPath()),
		slog.String("method", c.Request.Method),
		slog.String("clientIP", c.ClientIP()),
		slog.Any("error", err),
	)

	// JSONレスポンスを返す
	c.AbortWithStatusJSON(status, ErrorResponse{
		Error: message,
	})
}
