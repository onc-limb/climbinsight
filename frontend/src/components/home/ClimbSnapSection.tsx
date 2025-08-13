import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClimbSnapSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-orange-900 mb-8">
          ClimbSnap
        </h2>
        <p className="text-xl sm:text-2xl font-bold text-orange-800 mb-8">
          ホールド抽出機能
        </p>
        <div className="bg-orange-50 rounded-lg p-6 sm:p-8 mb-8">
          <div className="bg-orange-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">🎯</span>
          </div>
          <p className="text-lg text-gray-700 mb-4">
            AI技術を活用したホールド自動抽出機能で、課題の写真から美しいカバー画像を簡単に作成できます。
          </p>
          <p className="text-base text-gray-600 mb-4">
            壁の写真をアップロードし、使用するホールドをクリックするだけ。
            自動でホールドを認識・抽出し、プロ級のビジュアルを生成します。
          </p>
          <ul className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-2">
            <li>• 簡単操作：写真をアップロード→ホールドをクリック→完成</li>
            <li>• 高精度：AI技術による正確なホールド認識</li>
            <li>• 美しい仕上がり：プロ級のビジュアル生成</li>
          </ul>
        </div>
        <Link href="/hold-extraction">
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
          >
            ClimbSnapを試す
          </Button>
        </Link>
      </div>
    </section>
  );
}