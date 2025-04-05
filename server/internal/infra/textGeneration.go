package infra

type TextGenerateService struct {
}

func NewTextGenerateService() *TextGenerateService {
	return &TextGenerateService{}
}

func (tgs *TextGenerateService) Generate(text string) (string, error) {
	return text, nil
}
