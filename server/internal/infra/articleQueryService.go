package infra

import (
	"climbinsight/server/internal/domain"
	"time"
)

type articleQueryService struct{}

func NewArticleQueryService() *articleQueryService {
	return &articleQueryService{}
}

func (aqs *articleQueryService) FindGymArticles(place string, keyword string) ([]domain.ArticleOverviewReadModel, error) {
	// article Tableとgym_article Tableをjoinして取得

	result := []domain.ArticleOverviewReadModel{{
		Id:        "1234",
		Title:     "荻パン3級",
		Overview:  "荻パンで登った3級の動画",
		ImagePath: "",
		Tags:      []string{"B-PUMP荻窪"},
		PublishAt: time.Now(),
	}, {
		Id:        "abcd",
		Title:     "basecamp入間の課題",
		Overview:  "入間で登った2級の動画",
		ImagePath: "",
		Tags:      []string{"BaseCamp入間"},
		PublishAt: time.Now().Add(1),
	}}

	return result, nil
}

func (aqs *articleQueryService) FindOutdoorArticles(place string, problem string, keyword string) ([]domain.ArticleOverviewReadModel, error) {
	// article Tableとoutdoor_article Tableをjoinして取得

	result := []domain.ArticleOverviewReadModel{{
		Id:        "5678",
		Title:     "御岳の忍者返し",
		Overview:  "",
		ImagePath: "",
		Tags:      []string{"御岳ボルダー", "忍者返し"},
		PublishAt: time.Now(),
	}, {
		Id:        "efgh",
		Title:     "瑞垣の岩場",
		Overview:  "瑞垣で登った2級の動画",
		ImagePath: "",
		Tags:      []string{"瑞垣ボルダー", "泉の家"},
		PublishAt: time.Now().Add(1),
	}}

	return result, nil
}

func (aqs *articleQueryService) FindPoemArticles(category string, keyword string) ([]domain.ArticleOverviewReadModel, error) {
	// article Tableとoutdoor_article Tableをjoinして取得

	result := []domain.ArticleOverviewReadModel{{
		Id:        "9012",
		Title:     "御岳の忍者返し",
		Overview:  "",
		ImagePath: "",
		Tags:      []string{"御岳ボルダー", "忍者返し"},
		PublishAt: time.Now(),
	}, {
		Id:        "ijkl",
		Title:     "瑞垣の岩場",
		Overview:  "瑞垣で登った2級の動画",
		ImagePath: "",
		Tags:      []string{"瑞垣ボルダー", "泉の家"},
		PublishAt: time.Now().Add(1),
	}}

	return result, nil
}

func (aqs *articleQueryService) FindArticles(keyword string) ([]domain.ArticleOverviewReadModel, error) {
	// article Tableとoutdoor_article Tableをjoinして取得

	result := []domain.ArticleOverviewReadModel{{
		Id:        "3456",
		Title:     "御岳の忍者返し",
		Overview:  "",
		ImagePath: "",
		Tags:      []string{"御岳ボルダー", "忍者返し"},
		PublishAt: time.Now(),
	}, {
		Id:        "mnop",
		Title:     "瑞垣の岩場",
		Overview:  "瑞垣で登った2級の動画",
		ImagePath: "",
		Tags:      []string{"瑞垣ボルダー", "泉の家"},
		PublishAt: time.Now().Add(1),
	}}

	return result, nil
}
