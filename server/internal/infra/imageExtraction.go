package infra

import (
	"archive/zip"
	"bytes"
	"climbinsight/server/internal/domain"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sagemakerruntime"
)

type ImageEditService struct {
	sagemakerClient *sagemakerruntime.Client
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

	return &ImageEditService{
		sagemakerClient: sagemakerClient,
	}
}

func (ies *ImageEditService) Extraction(image []byte, points []domain.Point) ([]byte, []byte, error) {
	// Get SageMaker endpoint URL from environment variable
	endpointName := os.Getenv("AWS_SAGEMAKER_ENDPOINT_NAME")
	if endpointName == "" {
		return nil, nil, fmt.Errorf("AWS_SAGEMAKER_ENDPOINT environment variable is not set")
	}

	// Create request payload for SageMaker
	sagemakerReq := SageMakerRequest{
		Points: points,
	}

	// Marshal points to JSON
	pointsJSON, err := json.Marshal(sagemakerReq)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to marshal points: %w", err)
	}

	// Create zip file with image binary and points JSON
	zipBody, err := createZipPayload(image, pointsJSON)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create zip payload: %w", err)
	}

	// Create SageMaker InvokeEndpoint request
	input := &sagemakerruntime.InvokeEndpointInput{
		EndpointName: &endpointName,
		Body:         zipBody,
		ContentType:  &[]string{"application/zip"}[0],
	}

	// Invoke SageMaker endpoint
	result, err := ies.sagemakerClient.InvokeEndpoint(context.TODO(), input)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to invoke SageMaker endpoint: %w", err)
	}

	// Extract images from zip response
	resultImage, maskImage, err := extractImagesFromZip(result.Body)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to extract images from zip response: %w", err)
	}

	return resultImage, maskImage, nil
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

// extractImagesFromZip extracts result and mask images from zip response
func extractImagesFromZip(zipData []byte) ([]byte, []byte, error) {
	// Create a reader from the zip data
	zipReader, err := zip.NewReader(bytes.NewReader(zipData), int64(len(zipData)))
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create zip reader: %w", err)
	}

	var resultImage, maskImage []byte

	// Read files from zip
	for _, file := range zipReader.File {
		rc, err := file.Open()
		if err != nil {
			return nil, nil, fmt.Errorf("failed to open file %s in zip: %w", file.Name, err)
		}

		data, err := io.ReadAll(rc)
		rc.Close()
		if err != nil {
			return nil, nil, fmt.Errorf("failed to read file %s from zip: %w", file.Name, err)
		}

		switch file.Name {
		case "result_image.bin":
			resultImage = data
		case "mask_image.bin":
			maskImage = data
		}
	}

	if resultImage == nil {
		return nil, nil, fmt.Errorf("result_image.bin not found in zip response")
	}
	if maskImage == nil {
		return nil, nil, fmt.Errorf("mask_image.bin not found in zip response")
	}

	return resultImage, maskImage, nil
}
