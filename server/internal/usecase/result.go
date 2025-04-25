package usecase

import "climbinsight/server/internal/domain"

type ResultUsecase struct {
	sessionStoreService domain.ISessionStoreService
}

func NewResultUsecase(ss domain.ISessionStoreService) *ResultUsecase {
	return &ResultUsecase{sessionStoreService: ss}
}

func (ru *ResultUsecase) GetResult(sessionId string) (*domain.Result, error) {
	result, err := ru.sessionStoreService.GetResult(sessionId)
	if err != nil {
		return nil, err
	}
	return result, nil
}
