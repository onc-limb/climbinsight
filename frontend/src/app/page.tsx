"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo Section */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-6xl font-bold text-orange-900 mb-4">
              ClimbInsight
              <span className="block text-lg sm:text-xl font-normal text-orange-600 mt-2">
                〜 クライムインサイト 〜
              </span>
            </h1>
          </div>

          {/* Service Description */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-12 border border-orange-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-orange-900 mb-4">
              総合クライミングコミュニティサービス
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              あなたのクライミング体験をもっと楽しく！
            </p>
          </div>

          {/* Search Section */}
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
        </div>
      </section>

      {/* ClimbLog Service Introduction */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-orange-900 mb-8">
            ClimbLog
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-orange-800 mb-8">クライミング記録投稿サービス</p>
          <div className="bg-orange-50 rounded-lg p-6 sm:p-8 mb-8">
            <p className="text-lg text-gray-700 mb-4">
              ClimbLogは、あなたのクライミング体験を記録し、他のクライマーと共有するための専門プラットフォームです。
            </p>
            <p className="text-base text-gray-600">
              課題の詳細情報、攻略法、写真、そしてあなたの感想まで、
              クライミングに関するあらゆる情報を一箇所にまとめて記録・共有できます。
            </p>
          </div>
          <Link href="/climblog">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg mb-8">
              ClimbLogを始める
            </Button>
          </Link>
        </div>
      </section>

      {/* Recommended Articles Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-orange-900 mb-12">
            おすすめの記事
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Sample Article 1 */}
            <article className="bg-white rounded-lg shadow-lg overflow-hidden border border-orange-200 hover:shadow-xl transition-shadow">
              <div className="bg-orange-200 h-48 flex items-center justify-center">
                <span className="text-orange-700 font-medium">サンプル画像</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-orange-900 mb-2">
                  小川山の名課題「エイハブ船長」
                </h3>
                <p className="text-gray-600 mb-3">
                  小川山を代表する5.12aの名課題。核心部分の攻略法を詳しく解説します。
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>グレード: 5.12a</span>
                  <span>エリア: 小川山</span>
                </div>
              </div>
            </article>

            {/* Sample Article 2 */}
            <article className="bg-white rounded-lg shadow-lg overflow-hidden border border-orange-200 hover:shadow-xl transition-shadow">
              <div className="bg-orange-200 h-48 flex items-center justify-center">
                <span className="text-orange-700 font-medium">サンプル画像</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-orange-900 mb-2">
                  城ヶ崎の初心者向け課題特集
                </h3>
                <p className="text-gray-600 mb-3">
                  海岸沿いの美しいロケーションで楽しめる、初心者にもおすすめの課題をご紹介。
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>グレード: 5.8-5.10</span>
                  <span>エリア: 城ヶ崎</span>
                </div>
              </div>
            </article>

            {/* Sample Article 3 */}
            <article className="bg-white rounded-lg shadow-lg overflow-hidden border border-orange-200 hover:shadow-xl transition-shadow">
              <div className="bg-orange-200 h-48 flex items-center justify-center">
                <span className="text-orange-700 font-medium">サンプル画像</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-orange-900 mb-2">
                  御岳の岩場ガイド完全版
                </h3>
                <p className="text-gray-600 mb-3">
                  関東屈指のクライミングエリア御岳。アクセスから課題情報まで完全ガイド。
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>グレード: 5.6-5.13</span>
                  <span>エリア: 御岳</span>
                </div>
              </div>
            </article>

            {/* Sample Article 4 (hidden on mobile, shown on lg screens) */}
            <article className="bg-white rounded-lg shadow-lg overflow-hidden border border-orange-200 hover:shadow-xl transition-shadow hidden lg:block">
              <div className="bg-orange-200 h-48 flex items-center justify-center">
                <span className="text-orange-700 font-medium">サンプル画像</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-orange-900 mb-2">
                  冬場のクライミング装備術
                </h3>
                <p className="text-gray-600 mb-3">
                  寒い季節でも安全にクライミングを楽しむための装備とテクニックを解説。
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>装備・テクニック</span>
                  <span>シーズン: 冬</span>
                </div>
              </div>
            </article>

            {/* Sample Article 5 (hidden on mobile, shown on lg screens) */}
            <article className="bg-white rounded-lg shadow-lg overflow-hidden border border-orange-200 hover:shadow-xl transition-shadow hidden lg:block">
              <div className="bg-orange-200 h-48 flex items-center justify-center">
                <span className="text-orange-700 font-medium">サンプル画像</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-orange-900 mb-2">
                  ボルダリングのためのトレーニング
                </h3>
                <p className="text-gray-600 mb-3">
                  自宅でできる効果的なトレーニング方法から、岩場での実践まで。
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>トレーニング</span>
                  <span>タイプ: ボルダリング</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      

      {/* Hold Extraction Feature Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-orange-900 mb-8">
            ClimbSnap
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-orange-800 mb-8">ホールド抽出機能</p>
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
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg">
              ホールド抽出を試す
            </Button>
          </Link>
        </div>
      </section>

      {/* Membership CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 sm:p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              会員登録でもっと楽しく
            </h2>
            <p className="text-lg text-orange-100 mb-6">
              記事の投稿、お気に入り機能、コメント機能など、<br className="hidden sm:block" />
              さらに充実したクライミングライフを送りませんか？
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8 py-3 text-lg"
              >
                無料で会員登録
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg"
              >
                ログイン
              </Button>
            </div>
            <p className="text-sm text-orange-100 mt-4">
              登録は30秒で完了。今すぐあなたのクライミング記録を始めよう！
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}