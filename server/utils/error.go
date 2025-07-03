package utils

import (
	"fmt"
	"log/slog"

	"github.com/gin-gonic/gin"
)

// ErrorResponse は API のエラーレスポンスの共通フォーマット
type ErrorResponse struct {
	Error string `json:"error"`
}

// RespondError はエラーをログに記録し、JSON形式でレスポンスを返す
func RespondError(c *gin.Context, status int, message string, err error) {
	path := c.FullPath()
	method := c.Request.Method
	clientIP := c.ClientIP()

	// ログ出力（詳細エラー付き）
	slog.Error(message,
		slog.Int("status", status),
		slog.String("path", path),
		slog.String("method", method),
		slog.String("clientIP", c.ClientIP()),
		slog.Any("error", err),
	)

	noticeMessage := fmt.Sprintf(`
		statis: %d
		path: %s
		method: %s
		clientIP: %s
		err: %s
		content: %s
	`, status, path, method, clientIP, err.Error(), message)

	NoticeToSlack("エラー", noticeMessage)

	// JSONレスポンスを返す
	c.AbortWithStatusJSON(status, ErrorResponse{
		Error: message,
	})
}
