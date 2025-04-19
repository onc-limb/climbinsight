package domain

import "io"

type IImageStorageService interface {
	UploadImage(io.Reader, string, string) error
	GeneratePresignedGetURL(string, string) (string, error)
}
