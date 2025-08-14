import ArticleComponent, { Article } from "@/components/ArticleComponent";

export default async function RecommendedArticles() {
  const res = await fetch(`${process.env.API_URL}/articles`)
  const data = await res.json()
  
  // /apiに隠蔽したい
  const articles: Article[] = data.articles.map((article) => ({
    id: article.Id,
    title: article.Title,
    coverImage: article.ImagePath,
    tags: article.Tags,
    postedDate: article.PublishAt,
    description: article.Overview
  }))

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-orange-900 mb-12">
          おすすめの記事
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {articles.map((article) => (
            <ArticleComponent
              key={article.id}
              article={article}
            />
          ))}
        </div>
      </div>
    </section>
  );
}