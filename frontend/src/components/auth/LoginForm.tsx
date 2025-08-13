'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/supabaseClient";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError("");
    
    try {
      const { data, error: signInError } = await signIn({ email, password });
      
      if (signInError) {
        setError("メールアドレスまたはパスワードが正しくありません");
        return;
      }
      
      if (data.user) {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("ログインに失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailLogin} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
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
          placeholder="パスワードを入力してください"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border-orange-200 focus:border-orange-400"
        />
      </div>

      <div className="text-right">
        <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
          パスワードを忘れましたか？
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700 h-12"
        disabled={isLoading}
      >
        {isLoading ? "ログイン中..." : "ログイン"}
      </Button>
    </form>
  );
}