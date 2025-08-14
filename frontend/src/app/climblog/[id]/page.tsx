import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { testArticles } from '@/const/testarticle.const'
import type { Article } from '@/components/ArticleComponent'
import ArticleLikeButton from '@/components/client/ArticleLikeButton'
import ArticleComments, { type Comment } from '@/components/client/ArticleComments'

interface DetailedArticle extends Article {
  content: string
  videoUrl?: string
  likes: number
  isLiked: boolean
  comments: Comment[]
}

// サーバーサイドで記事データを取得する関数
function getArticleData(id: number): DetailedArticle | null {
  const baseArticle = testArticles.find(a => a.id === id)
  if (!baseArticle) return null
  
  return {
    ...baseArticle,
    content: `
## はじめに

${baseArticle.description}

## アプローチ

小川山への車でのアクセスは、中央自動車道須玉ICから約30分です。金峰山荘の駐車場を利用できます。

## 課題の詳細

### 核心部分

この課題の核心は中間部のクラックセクションです。ここではフィンガーサイズのカムが有効で、特に#0.5-#1のカムを多めに持参することをお勧めします。

### 攻略のコツ

1. **スタート部分**: 良いホールドを使ってリズムよく登る
2. **中間部**: 体重を足に預けてバランスを保つ
3. **フィニッシュ**: 最後まで集中力を切らさない

## 装備リスト

- ハーネス
- ヘルメット
- クライミングシューズ
- カム（#0.5-#3）
- ナッツ（#4-#11）
- クイックドロー 12本

## まとめ

非常にやりがいのある課題でした。天候や岩の状態によって難易度が変わるので、複数回チャレンジすることをお勧めします.
    `,
    videoUrl: id === 1 ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : undefined,
    likes: Math.floor(Math.random() * 100),
    isLiked: false,
    comments: [
      {
        id: 1,
        author: 'クライマーA',
        content: '素晴らしい記録ですね！参考になります。',
        postedDate: '2024-03-16'
      },
      {
        id: 2,
        author: 'ボルダラーB',
        content: '私も同じ課題に挑戦しています。アドバイスありがとうございます！',
        postedDate: '2024-03-17'
      }
    ]
  }
}

// ログイン状態をチェックする関数（実際の実装では認証サービスを使用）
function checkLoginStatus(): boolean {
  // TODO: 実際の認証ロジックを実装
  return Math.random() > 0.5
}

export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  const article = getArticleData(id)
  const isLoggedIn = checkLoginStatus()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!article) {
    return (
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-500">記事が見つかりません。</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 py-8">
      <article className="max-w-4xl mx-auto px-4">
        {/* Title */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-900 mb-4">
            {article.title}
          </h1>
          <div className="text-sm text-gray-500 mb-4">
            投稿日: {formatDate(article.postedDate)}
          </div>
        </header>

        {/* Media */}
        {(article.videoUrl || article.coverImage) && (
          <div className="mb-8">
            {article.videoUrl ? (
              <div className="aspect-video">
                <iframe
                  src={article.videoUrl}
                  title={article.title}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            ) : article.coverImage ? (
              <div className="relative aspect-video">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ) : null}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <div 
            className="whitespace-pre-wrap text-gray-700 leading-relaxed"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {article.content}
          </div>
        </div>

        {/* Like Button - Client Component */}
        <ArticleLikeButton 
          initialLikes={article.likes}
          initialIsLiked={article.isLiked}
        />

        {/* Comments Section - Client Component */}
        <ArticleComments 
          initialComments={article.comments}
          isLoggedIn={isLoggedIn}
        />
      </article>
    </main>
  )
}