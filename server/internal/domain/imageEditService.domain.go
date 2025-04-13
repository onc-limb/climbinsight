package domain

type IImageEditService interface {
	Extraction([]byte, string) (string, error)
}
