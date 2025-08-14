'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/supabaseClient";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("パスワードが一致しません");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signUp({
        email: email,
        password: password,
      });
      if (error) {
      alert(error.message);
      } else {
          router.push('/profile/edit');
      }
    } catch (e) {
      alert(`会員登録に失敗しました: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}