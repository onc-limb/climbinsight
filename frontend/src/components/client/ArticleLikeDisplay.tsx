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
      <p className="text-sm text-gray-500 mt-2">
        いいねするには
        <Button variant="link" className="text-orange-500 p-0 mx-1 text-sm">
          ログイン
        </Button>
        してください
      </p>
    </div>
  )
}