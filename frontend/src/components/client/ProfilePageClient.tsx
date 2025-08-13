'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser, signOut } from "@/lib/supabaseClient";
import { User } from '@supabase/supabase-js';
import ProfileCard from "../profile/ProfileCard";
import PhysicalStats from "../profile/PhysicalStats";
import Introduction from "../profile/Introduction";
import RecentActivity from "../profile/RecentActivity";

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

export default function ProfilePageClient() {
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

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">認証中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
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
            <Button 
              variant="outline" 
              className="border-gray-400 text-gray-600 hover:bg-gray-50"
              onClick={handleSignOut}
            >
              ログアウト
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard 
              profileData={profileData} 
              userEmail={user.email || ''} 
            />
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Physical Stats */}
              <PhysicalStats 
                height={profileData.height}
                verticalReach={profileData.verticalReach}
                horizontalReach={profileData.horizontalReach}
              />

              {/* Introduction */}
              <Introduction introduction={profileData.introduction} />

              {/* Recent Activity */}
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}