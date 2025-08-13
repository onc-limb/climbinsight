import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PhysicalStatsProps {
  height?: string;
  verticalReach?: string;
  horizontalReach?: string;
}

export default function PhysicalStats({ height, verticalReach, horizontalReach }: PhysicalStatsProps) {
  return (
    <Card className="shadow-lg border-orange-200">
      <CardHeader>
        <CardTitle className="text-xl text-orange-900">身体データ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {height && (
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">{height}</div>
              <div className="text-sm text-gray-600">身長 (cm)</div>
            </div>
          )}
          {verticalReach && (
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">{verticalReach}</div>
              <div className="text-sm text-gray-600">縦リーチ (cm)</div>
            </div>
          )}
          {horizontalReach && (
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">{horizontalReach}</div>
              <div className="text-sm text-gray-600">横リーチ (cm)</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}