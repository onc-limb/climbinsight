package infra

import (
	"context"
	"fmt"
	"log"
	"mime/multipart"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type StorageHandler struct {
	Client     *s3.Client
	BucketName string
}

// NewS3Uploader は MinIO または R2 へのアップローダーを初期化します
func NewStorageHandler() (*StorageHandler, error) {
	endpoint := os.Getenv("STORAGE_ENDPOINT")
	accessKey := os.Getenv("STORAGE_ACCESS_KEY")
	secretKey := os.Getenv("STORAGE_SECRET_KEY")
	region := os.Getenv("STORAGE_REGION")

	cfg := aws.Config{
		Region:      region,
		Credentials: aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		EndpointResolverWithOptions: aws.EndpointResolverWithOptionsFunc(
			func(service, region string, options ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{
					URL:           endpoint,
					SigningRegion: region,
				}, nil
			}),
	}

	client := s3.NewFromConfig(cfg)

	return &StorageHandler{
		Client:     client,
		BucketName: os.Getenv("STORAGE_BUCKET_NAME"),
	}, nil
}

// UploadImage は画像ファイルをS3互換バケットにアップロードします
func (u *StorageHandler) UploadImage(file multipart.File, fileName string, contentType string) error {
	defer file.Close()

	_, err := u.Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(u.BucketName),
		Key:         aws.String(fileName),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		log.Printf("Upload failed: %v\n", err)
		return err
	}

	fmt.Printf("✅ Upload succeeded: %s/%s\n", u.BucketName, fileName)
	return nil
}
