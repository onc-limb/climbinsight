"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ArticleComponent, { Article } from "@/components/ArticleComponent";
import { testArticles } from "@/const/testarticle.const";
import Membership from "@/components/membership";

export default function HomePage() {
  const articles: Article[] = testArticles.slice(0, 3);
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
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-orange-900 mb-12">
            機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-orange-900 mb-2">
                ClimbLog
              </h3>
              <p className="text-gray-600">
                課題の動画、画像、感想などを好きに投稿
                <br />
                ジム名やグレードで検索もできる！
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-xl font-bold text-orange-900 mb-2">
                ClimbSnap
              </h3>
              <p className="text-gray-600">
                写真からホールドを自動抽出し、カバー画像を作成
              </p>
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

      {/* Recommended Articles Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-orange-900 mb-12">
            おすすめの記事
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {articles.map((article) => (
              <ArticleComponent
                key={article.id}
                article={article}
                onClick={() => {
                  // TODO: 記事詳細ページへの遷移処理を実装
                  console.log(`記事 ${article.id} がクリックされました`);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Hold Extraction Feature Section */}
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
      <Membership/>
    </main>
  );
}
