package domain

import "io"

type IStorageHandler interface {
	UploadImage(io.Reader, string, string) error
	GeneratePresignedGetURL(string, string) (string, error)
}
