package domain

type ITextGenerateService interface {
	Generate(grade, gym, style string, tryCount uint) (string, error)
}
