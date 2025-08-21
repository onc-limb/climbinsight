package infra

import (
	"climbinsight/server/internal/domain"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sagemakerruntime"
)

type ImageEditService struct {
	sagemakerClient *sagemakerruntime.Client
}

type ProcessImageResponse struct {
	ResultImageBase64 string `json:"result_image_base64"`
	MaskImageBase64   string `json:"mask_image_base64"`
}

type SageMakerRequest struct {
	ImageBase64 string         `json:"image_base64"`
	Points      []domain.Point `json:"points"`
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

	// Convert image to base64
	imageBase64 := base64.StdEncoding.EncodeToString(image)

	// Create request payload for SageMaker
	sagemakerReq := SageMakerRequest{
		ImageBase64: imageBase64,
		Points:      points,
	}

	// Marshal request to JSON
	requestBody, err := json.Marshal(sagemakerReq)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create SageMaker InvokeEndpoint request
	input := &sagemakerruntime.InvokeEndpointInput{
		EndpointName: &endpointName,
		Body:         requestBody,
		ContentType:  &[]string{"application/json"}[0],
	}

	// Invoke SageMaker endpoint
	result, err := ies.sagemakerClient.InvokeEndpoint(context.TODO(), input)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to invoke SageMaker endpoint: %w", err)
	}

	// Parse response
	var imageResp ProcessImageResponse
	err = json.Unmarshal(result.Body, &imageResp)
	if err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
		return nil, nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	// Decode base64 images
	resultImage, err := base64.StdEncoding.DecodeString(imageResp.ResultImageBase64)
	if err != nil {
		fmt.Println("Error decoding result image:", err)
		return nil, nil, fmt.Errorf("failed to decode result image: %w", err)
	}

	maskImage, err := base64.StdEncoding.DecodeString(imageResp.MaskImageBase64)
	if err != nil {
		fmt.Println("Error decoding mask image:", err)
		return nil, nil, fmt.Errorf("failed to decode mask image: %w", err)
	}

	return resultImage, maskImage, nil
}
