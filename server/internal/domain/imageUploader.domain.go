package domain

import "mime/multipart"

type IStorageHandler interface {
	UploadImage(file multipart.File, fileName string, contentType string) error
}
