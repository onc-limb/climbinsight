"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfileEditPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [iconImage, setIconImage] = useState<File | null>(null);
  const [height, setHeight] = useState("");
  const [verticalReach, setVerticalReach] = useState("");
  const [horizontalReach, setHorizontalReach] = useState("");
  const [homeGym, setHomeGym] = useState("");
  const [climbingExperience, setClimbingExperience] = useState("");
  const [introduction, setIntroduction] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/");
        return;
      }
      
      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement profile save to Supabase
      console.log("Profile data:", {
        displayName,
        iconImage,
        height,
        verticalReach,
        horizontalReach,
        homeGym,
        climbingExperience,
        introduction,
      });
      
      // For now, just show success and redirect
      alert("プロフィールを保存しました");
      router.push("/profile");
    } catch (error) {
      console.error("Profile save error:", error);
      alert("プロフィールの保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>認証中...</div>;
  }

  return (
    <main className="flex-1 bg-gradient-to-br from-orange-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-orange-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-orange-900">プロフィール編集</CardTitle>
              <CardDescription>
                あなたのクライミングプロフィールを設定してください
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">表示名 <span className="text-red-500">*</span></Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="表示名を入力してください"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iconImage">アイコン画像</Label>
                  <Input
                    id="iconImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">身長 (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="border-orange-200 focus:border-orange-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verticalReach">縦リーチ (cm)</Label>
                    <Input
                      id="verticalReach"
                      type="number"
                      placeholder="210"
                      value={verticalReach}
                      onChange={(e) => setVerticalReach(e.target.value)}
                      className="border-orange-200 focus:border-orange-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horizontalReach">横リーチ (cm)</Label>
                    <Input
                      id="horizontalReach"
                      type="number"
                      placeholder="170"
                      value={horizontalReach}
                      onChange={(e) => setHorizontalReach(e.target.value)}
                      className="border-orange-200 focus:border-orange-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeGym">ホームジム</Label>
                    <Input
                      id="homeGym"
                      type="text"
                      placeholder="クライミングジム名"
                      value={homeGym}
                      onChange={(e) => setHomeGym(e.target.value)}
                      className="border-orange-200 focus:border-orange-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="climbingExperience">クライミング歴</Label>
                  <Input
                    id="climbingExperience"
                    type="text"
                    placeholder="例: 3年"
                    value={climbingExperience}
                    onChange={(e) => setClimbingExperience(e.target.value)}
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="introduction">自己紹介</Label>
                  <Textarea
                    id="introduction"
                    placeholder="自己紹介を入力してください"
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    className="border-orange-200 focus:border-orange-400 min-h-[100px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push("/profile")}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "保存中..." : "プロフィールを保存"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}