'use client'

import { Button } from '@/components/ui/button'

interface ArticleLikeDisplayProps {
  likes: number
}

export default function ArticleLikeDisplay({ likes }: ArticleLikeDisplayProps) {
  return (
    <div className="mb-8 pb-8 border-b border-gray-200">
      <Button
        variant="outline"
        disabled
        className="border-orange-500 text-orange-500 cursor-default opacity-70"
      >
        ♡ いいね ({likes})
      </Button>
    </div>
  )
}