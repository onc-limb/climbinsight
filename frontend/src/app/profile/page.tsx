"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, signOut } from "@/lib/supabaseClient";
import { User } from '@supabase/supabase-js';
import Image from "next/image";

interface ProfileData {
  displayName: string;
  iconImage?: string;
  height?: string;
  verticalReach?: string;
  horizontalReach?: string;
  homeGym?: string;
  climbingExperience?: string;
  introduction?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // todo: APIでデータを取得する
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "クライマー",
    height: "170",
    verticalReach: "210",
    horizontalReach: "170",
    homeGym: "B-PUMP 荻窪店",
    climbingExperience: "3",
    introduction: "クライミング初心者ですが、頑張って上達したいと思います！よろしくお願いします。"
  });

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        router.push("/login");
        return;
      }
      
      setUser(currentUser);
      // TODO: Load profile data from Supabase
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex-1 bg-gradient-to-br from-orange-50 to-white min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">認証中...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex-1 bg-gradient-to-br from-orange-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-orange-900">プロフィール</h1>
            <div className="flex gap-3">
              <Link href="/profile/edit">
                <Button 
                  variant="outline" 
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  編集
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-orange-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    {/* Profile Image */}
                    <div className="mb-4">
                      {profileData.iconImage ? (
                        <Image
                          src={profileData.iconImage}
                          alt="Profile"
                          height={112}
                          width={112}
                          className="h-28 w-28 rounded-full object-cover mx-auto"
                        />
                      ) : (
                        <div className="h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                          <svg
                            className="h-16 w-16 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Display Name */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {profileData.displayName}
                    </h2>
                    {/* Stats */}
                    <div className="space-y-3">
                      {profileData.climbingExperience && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">クライミング歴</span>
                          <Badge variant="secondary">{profileData.climbingExperience}年</Badge>
                        </div>
                      )}
                      {profileData.homeGym && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">ホームジム</span>
                          <span className="text-sm font-medium">{profileData.homeGym}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details Section */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Physical Stats */}
                <Card className="shadow-lg border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-orange-900">身体データ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {profileData.height && (
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-900">{profileData.height}</div>
                          <div className="text-sm text-gray-600">身長 (cm)</div>
                        </div>
                      )}
                      {profileData.verticalReach && (
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-900">{profileData.verticalReach}</div>
                          <div className="text-sm text-gray-600">縦リーチ (cm)</div>
                        </div>
                      )}
                      {profileData.horizontalReach && (
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-900">{profileData.horizontalReach}</div>
                          <div className="text-sm text-gray-600">横リーチ (cm)</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Introduction */}
                {profileData.introduction && (
                  <Card className="shadow-lg border-orange-200">
                    <CardHeader>
                      <CardTitle className="text-xl text-orange-900">自己紹介</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {profileData.introduction}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Activity Placeholder */}
                <Card className="shadow-lg border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-orange-900">最近の活動</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <p>まだ投稿がありません</p>
                      <p className="text-sm mt-2">クライミングログを投稿して記録を残しましょう！</p>
                      <Link href="/post" className="inline-block mt-4">
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          記事を投稿する
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}