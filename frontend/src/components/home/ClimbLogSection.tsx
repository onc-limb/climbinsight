import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ClimbLogSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-orange-900 mb-8">
          ClimbLog
        </h2>
        <p className="text-xl sm:text-2xl font-bold text-orange-800 mb-8">
          クライミング記録投稿サービス
        </p>
        <div className="bg-orange-50 rounded-lg p-6 sm:p-8 mb-8">
          <p className="text-lg text-gray-700 mb-4">
            ClimbLogは、あなたのクライミング体験を記録し、他のクライマーと共有するための専門プラットフォームです。
          </p>
          <p className="text-base text-gray-600">
            課題の詳細情報、攻略法、写真、そしてあなたの感想まで、
            クライミングに関するあらゆる情報を一箇所にまとめて記録・共有できます。
          </p>
        </div>
        <div className="bg-orange-100 rounded-lg p-6 sm:p-8 mb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-orange-900 mb-4">
            記事を検索
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              placeholder="岩場名、グレード、エリアなど..."
              className="flex-1"
            />
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6">
              検索
            </Button>
          </div>
        </div>
        <Link href="/climblog">
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg mb-8"
          >
            ClimbLogを始める
          </Button>
        </Link>
      </div>
    </section>
  );
}