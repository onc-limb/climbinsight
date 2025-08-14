import Introduction from "@/components/profile/Introduction";
import PhysicalStats from "@/components/profile/PhysicalStats";
import ProfileCard from "@/components/profile/ProfileCard";
import RecentActivity from "@/components/profile/RecentActivity";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfilePage() {
  // todo: APIから取得する
  const profileData = {
      displayName: "クライマー",
      height: "170",
      verticalReach: "210",
      horizontalReach: "170",
      homeGym: "B-PUMP 荻窪店",
      climbingExperience: "3",
      introduction: "クライミング初心者ですが、頑張って上達したいと思います！よろしくお願いします。"
    };
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
            <ProfileCard 
              profileData={profileData} 
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
    </main>
  );
}