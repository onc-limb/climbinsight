package domain

type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type IImageEditService interface {
	Extraction([]byte, []Point) ([]byte, error)
}
