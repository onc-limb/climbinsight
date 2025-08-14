'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ArticleLikeButtonProps {
  initialLikes: number
  initialIsLiked: boolean
}

export default function ArticleLikeButton({ initialLikes, initialIsLiked }: ArticleLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(initialIsLiked)

  const handleLike = () => {
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
    setIsLiked(prev => !prev)
  }

  return (
    <div className="mb-8 pb-8 border-b border-gray-200">
      <Button
        onClick={handleLike}
        variant={isLiked ? "default" : "outline"}
        className={`${
          isLiked 
            ? "bg-orange-500 hover:bg-orange-600 text-white" 
            : "border-orange-500 text-orange-500 hover:bg-orange-50"
        }`}
      >
        {isLiked ? "♥" : "♡"} いいね ({likes})
      </Button>
    </div>
  )
}