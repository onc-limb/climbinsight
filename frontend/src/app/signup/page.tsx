"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("パスワードが一致しません");
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Supabase auth implementation
      console.log("Email signup:", { email, password });
      alert("会員登録機能は実装中です");
    } catch (error) {
      console.error("Signup error:", error);
      alert("会員登録に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      // TODO: Google auth implementation
      console.log("Google signup");
      alert("Google認証は実装中です");
    } catch (error) {
      console.error("Google signup error:", error);
      alert("Google認証に失敗しました");
    }
  };

  const handleLineSignup = async () => {
    try {
      // TODO: LINE auth implementation
      console.log("LINE signup");
      alert("LINE認証は実装中です");
    } catch (error) {
      console.error("LINE signup error:", error);
      alert("LINE認証に失敗しました");
    }
  };

  return (
    <main className="flex-1 bg-gradient-to-br from-orange-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-900 mb-2">会員登録</h1>
            <p className="text-gray-600">ClimbInsightでクライミング記録を始めよう</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-orange-200 p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-orange-900 mb-2">アカウント作成</h2>
              <p className="text-gray-600">
                下記の方法でアカウントを作成できます
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-gray-300 hover:bg-gray-50"
                  onClick={handleGoogleSignup}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Googleで会員登録
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-green-500 text-green-600 hover:bg-green-50"
                  onClick={handleLineSignup}
                >
                  <svg className="w-5 h-5 mr-2" fill="#00C300" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.628-.629.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  LINEで会員登録
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-sm text-gray-500">または</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="8文字以上で入力してください"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="もう一度パスワードを入力してください"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "作成中..." : "アカウントを作成"}
                </Button>
              </form>
            </div>

            <div className="mt-6 space-y-4">
              <div className="text-center text-sm text-gray-600">
                <p>
                  アカウント作成により、
                  <Link href="/terms" className="text-orange-600 hover:underline">利用規約</Link>
                  および
                  <Link href="/privacy-policy" className="text-orange-600 hover:underline">プライバシーポリシー</Link>
                  に同意したものとみなします。
                </p>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  すでにアカウントをお持ちですか？{" "}
                  <Link href="/login" className="text-orange-600 hover:underline font-medium">
                    ログインはこちら
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}