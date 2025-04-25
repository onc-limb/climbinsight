package domain

type Point struct {
	X float32
	Y float32
}

type IImageEditService interface {
	Extraction([]byte, []Point) ([]byte, error)
}
