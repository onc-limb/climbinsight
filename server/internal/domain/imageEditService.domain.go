package domain

type IImageEditService interface {
	Extraction([]byte) ([]byte, error)
}
