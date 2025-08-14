package domain

import "time"

type ArticleType string

const (
	Poem    ArticleType = "porm"
	Gym     ArticleType = "gym"
	Outdoor ArticleType = "outdoor"
)

type ArticleOverviewReadModel struct {
	Id        string
	Title     string
	Overview  string
	ImagePath string
	Tags      []string
	PublishAt time.Time
}

type IArticleQueryService interface {
	FindGymArticles(place string, keyword string) ([]ArticleOverviewReadModel, error)
	FindOutdoorArticles(place string, problem string, keyword string) ([]ArticleOverviewReadModel, error)
	FindPoemArticles(category string, keyword string) ([]ArticleOverviewReadModel, error)
	FindArticles(keyword string) ([]ArticleOverviewReadModel, error)
}
