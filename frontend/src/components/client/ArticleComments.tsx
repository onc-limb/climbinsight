'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export interface Comment {
  id: number
  author: string
  content: string
  postedDate: string
}

interface ArticleCommentsProps {
  initialComments: Comment[]
  isLoggedIn: boolean
}

export default function ArticleComments({ initialComments, isLoggedIn }: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')

  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    const comment: Comment = {
      id: comments.length + 1,
      author: 'あなた',
      content: newComment,
      postedDate: new Date().toISOString().split('T')[0]
    }
    
    setComments(prev => [...prev, comment])
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

  if (!isLoggedIn) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          コメントを投稿するには<Button variant="link" className="text-orange-500 p-0">ログイン</Button>してください。
        </p>
      </div>
    )
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-orange-900 mb-6">
        コメント ({comments.length})
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
        {comments.map((comment) => (
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
  )
}