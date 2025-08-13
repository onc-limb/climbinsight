'use client'

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser, signOut } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthButtonsProps {
  isMobile?: boolean;
  onMobileMenuClose?: () => void;
}

export default function AuthButtons({ isMobile = false, onMobileMenuClose }: AuthButtonsProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    checkUser();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    if (onMobileMenuClose) onMobileMenuClose();
  };

  const baseClasses = isMobile ? "w-full" : "";
  const containerClasses = isMobile ? "px-3 py-2 space-y-2" : "hidden md:flex space-x-4 w-auto";

  return (
    <div className={containerClasses} style={!isMobile ? { minWidth: '200px' } : undefined}>
      {user ? (
        <>
          <Link href="/profile" onClick={onMobileMenuClose}>
            <Button 
              variant="outline" 
              className={`border-orange-600 text-orange-600 hover:bg-orange-50 ${baseClasses}`}
            >
              プロフィール
            </Button>
          </Link>
          <Link href="/post" onClick={onMobileMenuClose}>
            <Button className={`bg-orange-600 text-white hover:bg-orange-700 ${baseClasses}`}>
              記事投稿
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className={`border-gray-400 text-gray-600 hover:bg-gray-50 ${baseClasses}`}
            onClick={handleSignOut}
          >
            ログアウト
          </Button>
        </>
      ) : (
        <>
          <Link href="/login" onClick={onMobileMenuClose}>
            <Button 
              variant="outline" 
              className={`border-orange-600 text-orange-600 hover:bg-orange-50 ${baseClasses}`}
            >
              ログイン
            </Button>
          </Link>
          <Link href="/signup" onClick={onMobileMenuClose}>
            <Button className={`bg-orange-600 text-white hover:bg-orange-700 ${baseClasses}`}>
              会員登録
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}