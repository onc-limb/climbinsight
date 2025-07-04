package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type SlackPayload struct {
	Text string `json:"text"`
}

func NoticeToSlack(category string, message string) {
	url := os.Getenv("SLACK_WEBHOOK_URL")
	ownerID := os.Getenv("SLACK_OWNER_ID")

	formatMessage := fmt.Sprintf(`
		<@%s>
		Category: %s
		Contents: %s
	`, ownerID, category, message)

	payload := SlackPayload{
		Text: formatMessage,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		log.Println(err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		log.Println(err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		log.Println("Slackへの通知が成功しました！")
	} else {
		// エラーレスポンスの内容を読み込む
		buf := new(bytes.Buffer)
		buf.ReadFrom(resp.Body)
		log.Printf("Slackへの通知が失敗しました。ステータスコード: %d, レスポンス: %s", resp.StatusCode, buf.String())
	}
}
