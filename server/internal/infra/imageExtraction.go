package infra

import (
	"bytes"
	"climbinsight/server/internal/domain"
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
	MimeType  string `json:"mime_type"`
	ImageByte string `json:"image_byte"`
}

func NewImageEditService() *ImageEditService {
	return &ImageEditService{}
}

func (ies *ImageEditService) Extraction(image []byte, points []domain.Point) ([]byte, error) {
	// multipart/form-data 組み立て
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	// 画像ファイルを付ける
	filePart, err := writer.CreateFormFile("file", "image.png")
	if err != nil {
		return nil, err
	}
	_, err = filePart.Write(image)
	if err != nil {
		return nil, err
	}

	// 座標配列をJSON化して付ける
	pointsJSON, err := json.Marshal(points)
	if err != nil {
		return nil, err
	}

	err = writer.WriteField("points", string(pointsJSON))
	if err != nil {
		return nil, err
	}

	writer.Close()

	// リクエスト構築
	req, err := http.NewRequest("POST", os.Getenv("AI_LAMBDA_URL"), &buf)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// // AWS認証情報を設定
	// awsAccessKeyID := os.Getenv("AWS_ACCESS_KEY_ID")
	// awsSecretAccessKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
	// awsRegion := os.Getenv("AWS_REGION")

	// _, err = config.LoadDefaultConfig(context.TODO(),
	// 	config.WithRegion(awsRegion),
	// 	config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
	// 		awsAccessKeyID,
	// 		awsSecretAccessKey,
	// 		"")),
	// )

	// if err != nil {
	// 	log.Fatalf("Error loading AWS config: %v", err)
	// }

	// // 署名バージョン4のSignerを作成
	// signer := v4.NewSigner()

	// // リクエストに署名
	// err = signer.SignHTTP(context.TODO(), aws.Credentials{
	// 	AccessKeyID:     awsAccessKeyID,
	// 	SecretAccessKey: awsSecretAccessKey,
	// }, req, "lambda", awsRegion, "lambda", time.Now())
	// if err != nil {
	// 	log.Fatalf("Error signing request: %v", err)
	// }

	// リクエスト送信
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to process image: %s", resp.Status)
	}

	// レスポンス読み取り
	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	imageByte, err := base64.StdEncoding.DecodeString(string(b))
	if err != nil {
		return nil, err
	}

	return imageByte, nil
}
