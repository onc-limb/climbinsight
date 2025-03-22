package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Request struct {
	Input string `json:"input"`
}

func main() {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "healthy",
		})
	})

	r.POST("/process", process)

	r.Run() // listen and serve on 0.0.0.0:8080
}

func process(c *gin.Context) {
	var req Request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"result": "ok",
	})
}
