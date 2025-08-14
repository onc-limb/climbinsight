'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { testArticles } from '@/const/testarticle.const'
import type { Article } from '@/components/ArticleComponent'

interface DetailedArticle extends Article {
  content: string
  videoUrl?: string
  likes: number
  isLiked: boolean
  comments: Comment[]
}

interface Comment {
  id: number
  author: string
  content: string
  postedDate: string
}

export default function ArticleDetailPage() {
  const params = useParams()
  const id = parseInt(params.id as string, 10)
  
  const [article, setArticle] = useState<DetailedArticle | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [newComment, setNewComment] = useState('')
  
  useEffect(() => {
    const baseArticle = testArticles.find(a => a.id === id)
    if (baseArticle) {
      const detailedArticle: DetailedArticle = {
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

非常にやりがいのある課題でした。天候や岩の状態によって難易度が変わるので、複数回チャレンジすることをお勧めします。
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
      setArticle(detailedArticle)
    }
    
    setIsLoggedIn(Math.random() > 0.5)
  }, [id])

  const handleLike = () => {
    if (!article) return
    setArticle(prev => prev ? {
      ...prev,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      isLiked: !prev.isLiked
    } : null)
  }

  const handleAddComment = () => {
    if (!article || !newComment.trim()) return
    
    const comment: Comment = {
      id: article.comments.length + 1,
      author: 'あなた',
      content: newComment,
      postedDate: new Date().toISOString().split('T')[0]
    }
    
    setArticle(prev => prev ? {
      ...prev,
      comments: [...prev.comments, comment]
    } : null)
    setNewComment('')
  }

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

        {/* Like Button */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <Button
            onClick={handleLike}
            variant={article.isLiked ? "default" : "outline"}
            className={`${
              article.isLiked 
                ? "bg-orange-500 hover:bg-orange-600 text-white" 
                : "border-orange-500 text-orange-500 hover:bg-orange-50"
            }`}
          >
            {article.isLiked ? "♥" : "♡"} いいね ({article.likes})
          </Button>
        </div>

        {/* Comments Section */}
        {isLoggedIn && (
          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-6">
              コメント ({article.comments.length})
            </h2>

            {/* Add Comment Form */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">コメントを投稿</h3>
              <Textarea
                placeholder="コメントを入力してください..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-4"
              />
              <Button onClick={handleAddComment} className="bg-orange-500 hover:bg-orange-600">
                コメントを投稿
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {article.comments.map((comment) => (
                <div key={comment.id} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-orange-900">{comment.author}</h4>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.postedDate)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isLoggedIn && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              コメントを投稿するには<Button variant="link" className="text-orange-500 p-0">ログイン</Button>してください。
            </p>
          </div>
        )}
      </article>
    </main>
  )
}