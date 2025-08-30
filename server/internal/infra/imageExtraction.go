package infra

import (
	"archive/zip"
	"bytes"
	"climbinsight/server/internal/domain"
	"climbinsight/server/utils"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type ImageEditService struct{}

func NewImageEditService() *ImageEditService {
	return &ImageEditService{}
}

func (ies *ImageEditService) Extraction(image []byte, points []domain.Point) ([]byte, []byte, error) {
	// Marshal points to JSON
	pointsData := struct {
		Points []domain.Point `json:"points"`
	}{
		Points: points,
	}
	pointsJSON, err := json.Marshal(pointsData)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to marshal points: %w", err)
	}

	// Create zip payload with image binary and points JSON
	zipBody, err := createZipPayload(image, pointsJSON)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create zip payload: %w", err)
	}

	// Send zip request to AI server
	req, err := http.NewRequest("POST", os.Getenv("AI_SERVER_URL")+"/process", bytes.NewReader(zipBody))
	if err != nil {
		return nil, nil, err
	}
	req.Header.Set("Content-Type", "application/zip")

	resp, err := utils.FetchWithRetry(req)
	if err != nil {
		return nil, nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, nil, fmt.Errorf("failed to process image: %s", resp.Status)
	}

	// Read zip response
	zipResponseData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, nil, err
	}

	// Extract result and mask images from zip response
	resultImage, maskImage, err := extractImagesFromZip(zipResponseData)
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
