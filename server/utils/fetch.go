package utils

import (
	"net/http"
	"time"
)

const (
	maxRetries    = 10
	retryInterval = 2 * time.Second
)

func FetchWithRetry(req *http.Request) (*http.Response, error) {

	// リクエスト送信
	client := &http.Client{}
	var resp *http.Response
	var err error
	for i := range maxRetries {
		resp, err = client.Do(req)
		if err == nil && resp.StatusCode == http.StatusOK {
			return resp, nil
		}
		if resp != nil {
			resp.Body.Close()
		}
		if i < maxRetries-1 {
			// 少し待つ
			time.Sleep(time.Duration(retryInterval))
		}
	}
	if err != nil {
		return nil, err
	}
	return resp, nil
}
