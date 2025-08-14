'use client'

import { useState, useEffect, ReactNode } from 'react'
import { getCurrentUser } from '@/lib/supabaseClient'

interface WithLoginedProps {
  children: ReactNode
  fallback: ReactNode
  loading?: ReactNode
}

export default function WithLogined({ children, fallback, loading }: WithLoginedProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await getCurrentUser()
        setIsLoggedIn(!!user)
      } catch (error) {
        console.error('認証状態の確認に失敗しました:', error)
        setIsLoggedIn(false)
      }
    }

    checkLoginStatus()
  }, [])

  if (isLoggedIn === null) {
    return <>{loading || <div className="text-center py-4">読み込み中...</div>}</>
  }

  return <>{isLoggedIn ? children : fallback}</>
}