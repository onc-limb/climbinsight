package infra

import (
	"bytes"
	"climbinsight/server/internal/domain"
	"climbinsight/server/utils"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

type ImageEditService struct{}

type ProcessImageResponse struct {
	ResultImageBase64 string `json:"result_image_base64"`
	MaskImageBase64   string `json:"mask_image_base64"`
}

func NewImageEditService() *ImageEditService {
	return &ImageEditService{}
}

func (ies *ImageEditService) Extraction(image []byte, points []domain.Point) ([]byte, []byte, error) {
	// multipart/form-data 組み立て
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	// 画像ファイルを付ける
	filePart, err := writer.CreateFormFile("file", "image.png")
	if err != nil {
		return nil, nil, err
	}
	_, err = filePart.Write(image)
	if err != nil {
		return nil, nil, err
	}

	// 座標配列をJSON化して付ける
	pointsJSON, err := json.Marshal(points)
	if err != nil {
		return nil, nil, err
	}

	err = writer.WriteField("points", string(pointsJSON))
	if err != nil {
		return nil, nil, err
	}

	writer.Close()

	req, err := http.NewRequest("POST", os.Getenv("AI_SERVER_URL")+"/process", &buf)
	if err != nil {
		return nil, nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := utils.FetchWithRetry(req)
	if err != nil {
		return nil, nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, nil, fmt.Errorf("failed to process image: %s", resp.Status)
	}

	bodyByte, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, nil, err
	}

	var imageResp ProcessImageResponse
	err = json.Unmarshal(bodyByte, &imageResp)
	if err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
		return nil, nil, err
	}

	result, err := base64.StdEncoding.DecodeString(imageResp.ResultImageBase64)
	if err != nil {
		fmt.Println("Error decoding result image:", err)
		return nil, nil, err
	}
	mask, err := base64.StdEncoding.DecodeString(imageResp.MaskImageBase64)
	if err != nil {
		fmt.Println("Error decoding mask image:", err)
		return nil, nil, err
	}

	return result, mask, nil
}
