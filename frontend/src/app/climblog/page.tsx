"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { testArticles } from "@/const/testarticle.const";
import ArticleComponent, { Article } from "@/components/ArticleComponent";

export default function HomePage() {
  const articles: Article[] = testArticles
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo Section */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-6xl font-bold text-orange-900 mb-4">
              ClimbLog
              <span className="block text-lg sm:text-xl font-normal text-orange-600 mt-2">
                〜 クライムログ 〜
              </span>
            </h1>
          </div>

          {/* Service Description */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-12 border border-orange-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-orange-900 mb-4">
              クライミング記録投稿サービス
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              あなたのクライミング体験を記録し、コミュニティと共有しよう
            </p>
            <p className="text-base text-gray-600">
              課題の写真から自動でホールドを抽出し、美しいカバー画像を作成。<br className="hidden sm:block" />
              グレード、岩場情報、攻略のコツまで、すべてをまとめて記録できます。
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

      {/* Recommended Articles Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-orange-900 mb-12">
            新着の記事
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