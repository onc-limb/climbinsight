package infra

import (
	"context"
	"fmt"
	"log"
	"mime/multipart"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
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

	cfg, err := config.LoadDefaultConfig(context.Background(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		fmt.Println("Couldn't load default configuration. Have you set up your AWS account?")
		fmt.Println(err)
		return nil, err
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
		o.BaseEndpoint = aws.String(endpoint)
	})

	return &StorageHandler{
		Client:     client,
		BucketName: os.Getenv("STORAGE_BUCKET_NAME"),
	}, nil
}

// UploadImage は画像ファイルをS3互換バケットにアップロードします
func (sh *StorageHandler) UploadImage(file *multipart.File, fileName string, contentType string) error {
	(*file).Seek(0, 0)
	_, err := sh.Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(sh.BucketName),
		Key:         aws.String(fileName),
		Body:        *file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		log.Printf("Upload failed: %v\n", err)
		return err
	}

	fmt.Printf("✅ Upload succeeded: %s/%s\n", sh.BucketName, fileName)
	return nil
}
