package domain

type Result struct {
	Image   string
	Content string
}

type ISessionStoreService interface {
	SaveProcessedImage(sessionId string, imageUrl string) error
	SaveGeneratedContent(sessionId string, content string) error
	GetResult(sessionId string) (*Result, error)
}
