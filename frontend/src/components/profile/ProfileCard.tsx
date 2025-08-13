import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProfileData {
  displayName: string;
  iconImage?: string;
  homeGym?: string;
  climbingExperience?: string;
}

interface ProfileCardProps {
  profileData: ProfileData;
  userEmail: string;
}

export default function ProfileCard({ profileData, userEmail }: ProfileCardProps) {
  return (
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
          
          {/* Email */}
          <p className="text-gray-600 mb-4">{userEmail}</p>
          
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
  );
}