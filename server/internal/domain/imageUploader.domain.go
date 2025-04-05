package domain

import "mime/multipart"

type IStorageHandler interface {
	UploadImage(multipart.File, string, string) error
}
