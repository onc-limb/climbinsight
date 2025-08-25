package infra

import (
	"archive/zip"
	"bytes"
	"climbinsight/server/internal/domain"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/sagemakerruntime"
)

type ImageEditService struct {
	sagemakerClient *sagemakerruntime.Client
	s3Client        *s3.Client
}

type SageMakerRequest struct {
	Points []domain.Point `json:"points"`
}

func NewImageEditService() *ImageEditService {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic(fmt.Sprintf("failed to load AWS config: %v", err))
	}

	sagemakerClient := sagemakerruntime.NewFromConfig(cfg)
	s3Client := s3.NewFromConfig(cfg)

	return &ImageEditService{
		sagemakerClient: sagemakerClient,
		s3Client:        s3Client,
	}
}

func (ies *ImageEditService) ExtractionAsync(image []byte, points []domain.Point, sessionName string) error {
	// Get S3 bucket name from environment variable
	bucketName := os.Getenv("AWS_S3_BUCKET_NAME")
	if bucketName == "" {
		return fmt.Errorf("AWS_S3_BUCKET_NAME environment variable is not set")
	}

	// Create request payload for SageMaker
	sagemakerReq := SageMakerRequest{
		Points: points,
	}

	// Marshal points to JSON
	pointsJSON, err := json.Marshal(sagemakerReq)
	if err != nil {
		return fmt.Errorf("failed to marshal points: %w", err)
	}

	// Create zip file with image binary and points JSON
	zipBody, err := createZipPayload(image, pointsJSON)
	if err != nil {
		return fmt.Errorf("failed to create zip payload: %w", err)
	}

	// Upload zip file to S3 with session name as file name
	s3Key := fmt.Sprintf("requests/%s.zip", sessionName)

	_, err = ies.s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      &bucketName,
		Key:         &s3Key,
		Body:        strings.NewReader(string(zipBody)),
		ContentType: &[]string{"application/zip"}[0],
		Metadata: map[string]string{
			"session-name": sessionName,
		},
	})

	if err != nil {
		return fmt.Errorf("failed to upload zip to S3: %w", err)
	}

	return nil
}

// createZipPayload creates a zip file containing the image binary and points JSON
func createZipPayload(imageBinary []byte, pointsJSON []byte) ([]byte, error) {
	// Create a buffer to hold the zip data
	var zipBuffer bytes.Buffer
	zipWriter := zip.NewWriter(&zipBuffer)

	// Add image binary to zip
	imageWriter, err := zipWriter.Create("image.bin")
	if err != nil {
		return nil, fmt.Errorf("failed to create image entry in zip: %w", err)
	}
	_, err = imageWriter.Write(imageBinary)
	if err != nil {
		return nil, fmt.Errorf("failed to write image data to zip: %w", err)
	}

	// Add points JSON to zip
	pointsWriter, err := zipWriter.Create("points.json")
	if err != nil {
		return nil, fmt.Errorf("failed to create points entry in zip: %w", err)
	}
	_, err = pointsWriter.Write(pointsJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to write points data to zip: %w", err)
	}

	// Close zip writer
	err = zipWriter.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to close zip writer: %w", err)
	}

	return zipBuffer.Bytes(), nil
}
