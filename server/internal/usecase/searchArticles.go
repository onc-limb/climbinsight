package usecase

import (
	"climbinsight/server/internal/domain"
)

type SearchArticlesUsecase struct {
	articleQueryService domain.IArticleQueryService
}

type Conditions struct {
	Type     string
	Place    string
	Problem  string
	Category string
	Keyword  string
}

func NewSearchArticlesUsecase(aqs domain.IArticleQueryService) *SearchArticlesUsecase {
	return &SearchArticlesUsecase{articleQueryService: aqs}
}

func (sau *SearchArticlesUsecase) Exec(conditions Conditions) ([]domain.ArticleOverviewReadModel, error) {
	if conditions.Type == string(domain.Gym) {
		result, err := sau.articleQueryService.FindGymArticles(conditions.Place, conditions.Keyword)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	if conditions.Type == string(domain.Outdoor) {
		result, err := sau.articleQueryService.FindOutdoorArticles(conditions.Place, conditions.Problem, conditions.Keyword)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	if conditions.Type == string(domain.Poem) {
		result, err := sau.articleQueryService.FindPoemArticles(conditions.Category, conditions.Keyword)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	result, err := sau.articleQueryService.FindArticles(conditions.Keyword)
	if err != nil {
		return nil, err
	}
	return result, nil
}
