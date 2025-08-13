import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RecentActivity() {
  return (
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
  );
}