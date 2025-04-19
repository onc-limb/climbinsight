package domain

type ITmpStorage interface {
	SaveProcessedImage(sessionId string, imageUrl string) error
	SaveGeneratedContent(sessionId string, content string) error
}
