package domain

type ITextGenerateService interface {
	Generate(string) (string, error)
}
