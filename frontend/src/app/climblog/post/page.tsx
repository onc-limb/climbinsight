'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

type ClimbingType = 'gym' | 'outdoor' | 'other'
type MediaType = 'image' | 'video' | 'youtube'

interface PostData {
  title: string
  mediaType: MediaType
  mediaFile?: File
  youtubeUrl?: string
  tags: string[]
  climbingType: ClimbingType
  gymName?: string
  areaName?: string
  rockName?: string
  routeName?: string
  grade?: string
  category?: string
  createArticle: boolean
  content: string
}

export default function PostPage() {
  const router = useRouter()
  const [postData, setPostData] = useState<PostData>({
    title: '',
    mediaType: 'image',
    tags: [],
    climbingType: 'gym',
    createArticle: false,
    content: ''
  })
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTag = () => {
    if (tagInput.trim() && !postData.tags.includes(tagInput.trim())) {
      setPostData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPostData(prev => ({ ...prev, mediaFile: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: APIに投稿データを送信
      console.log('投稿データ:', postData)
      
      // 仮の処理時間
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 投稿完了後、記事一覧に戻る
      router.push('/climblog')
    } catch (error) {
      console.error('投稿に失敗しました:', error)
      alert('投稿に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    const hasTitle = postData.title.trim() !== ''
    const hasMedia = postData.mediaType === 'youtube' 
      ? postData.youtubeUrl?.trim() !== ''
      : postData.mediaFile !== undefined
    
    let hasRequiredLocationInfo = false
    switch (postData.climbingType) {
      case 'gym':
        hasRequiredLocationInfo = postData.gymName?.trim() !== ''
        break
      case 'outdoor':
        hasRequiredLocationInfo = postData.areaName?.trim() !== ''
        break
      case 'other':
        hasRequiredLocationInfo = postData.category?.trim() !== ''
        break
    }

    return hasTitle && hasMedia && hasRequiredLocationInfo
  }

  return (
    <main className="flex-1 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-900 mb-2">記事を投稿</h1>
          <p className="text-gray-600">クライミングの記録を共有しましょう</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* タイトル */}
              <div className="space-y-2">
                <Label htmlFor="title">タイトル <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="記事のタイトルを入力してください"
                  value={postData.title}
                  onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* メディア */}
              <div className="space-y-2">
                <Label>メディア <span className="text-red-500">*</span></Label>
                <Select 
                  value={postData.mediaType} 
                  onValueChange={(value: MediaType) => 
                    setPostData(prev => ({ ...prev, mediaType: value, mediaFile: undefined, youtubeUrl: '' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">画像</SelectItem>
                    <SelectItem value="video">動画</SelectItem>
                    <SelectItem value="youtube">YouTube URL</SelectItem>
                  </SelectContent>
                </Select>

                {postData.mediaType === 'youtube' ? (
                  <Input
                    placeholder="YouTubeのURLを入力してください"
                    value={postData.youtubeUrl || ''}
                    onChange={(e) => setPostData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  />
                ) : (
                  <Input
                    type="file"
                    accept={postData.mediaType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileChange}
                  />
                )}
              </div>

              {/* タグ */}
              <div className="space-y-2">
                <Label htmlFor="tags">タグ</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="タグを入力してください"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    追加
                  </Button>
                </div>
                {postData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {postData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* 場所・詳細情報 */}
          <Card>
            <CardHeader>
              <CardTitle>場所・詳細情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* クライミングタイプ */}
              <div className="space-y-2">
                <Label>クライミングタイプ</Label>
                <Select 
                  value={postData.climbingType} 
                  onValueChange={(value: ClimbingType) => 
                    setPostData(prev => ({ 
                      ...prev, 
                      climbingType: value,
                      gymName: '',
                      areaName: '',
                      rockName: '',
                      routeName: '',
                      category: ''
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">ジム</SelectItem>
                    <SelectItem value="outdoor">外岩</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ジム情報 */}
              {postData.climbingType === 'gym' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="gymName">ジム名 <span className="text-red-500">*</span></Label>
                    <Input
                      id="gymName"
                      placeholder="ジム名を入力してください"
                      value={postData.gymName || ''}
                      onChange={(e) => setPostData(prev => ({ ...prev, gymName: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {/* 外岩情報 */}
              {postData.climbingType === 'outdoor' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="areaName">エリア名 <span className="text-red-500">*</span></Label>
                    <Input
                      id="areaName"
                      placeholder="エリア名を入力してください"
                      value={postData.areaName || ''}
                      onChange={(e) => setPostData(prev => ({ ...prev, areaName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rockName">岩名</Label>
                    <Input
                      id="rockName"
                      placeholder="岩名を入力してください"
                      value={postData.rockName || ''}
                      onChange={(e) => setPostData(prev => ({ ...prev, rockName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routeName">課題名</Label>
                    <Input
                      id="routeName"
                      placeholder="課題名を入力してください"
                      value={postData.routeName || ''}
                      onChange={(e) => setPostData(prev => ({ ...prev, routeName: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {/* その他情報 */}
              {postData.climbingType === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリー <span className="text-red-500">*</span></Label>
                  <Input
                    id="category"
                    placeholder="カテゴリーを入力してください"
                    value={postData.category || ''}
                    onChange={(e) => setPostData(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              )}

              {/* グレード */}
              {(postData.climbingType === 'gym' || postData.climbingType === 'outdoor') && (
                <div className="space-y-2">
                  <Label htmlFor="grade">グレード</Label>
                  <Input
                    id="grade"
                    placeholder="グレードを入力してください"
                    value={postData.grade || ''}
                    onChange={(e) => setPostData(prev => ({ ...prev, grade: e.target.value }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 記事セクション */}
          <Card>
            <CardHeader>
              <CardTitle>記事</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="createArticle"
                  checked={postData.createArticle}
                  onCheckedChange={(checked) => 
                    setPostData(prev => ({ 
                      ...prev, 
                      createArticle: checked as boolean,
                      content: checked ? prev.content : '' 
                    }))
                  }
                />
                <Label htmlFor="createArticle">記事を作成する</Label>
              </div>
              
              {postData.createArticle && (
                <div className="space-y-2">
                  <Label htmlFor="content">記事内容</Label>
                  <Textarea
                    id="content"
                    placeholder="記事の詳細内容を入力してください...\n\n例：\n・今日のクライミングの感想\n・攻略のコツやテクニック\n・使用した装備\n・次回の課題"
                    value={postData.content}
                    onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                    rows={12}
                    className="min-h-[300px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 投稿ボタン */}
          <div className="flex gap-4 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? '投稿中...' : '投稿する'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}