package domain

type Point struct {
	X float64
	Y float64
}

type IImageEditService interface {
	Extraction([]byte, []Point) ([]byte, error)
}
