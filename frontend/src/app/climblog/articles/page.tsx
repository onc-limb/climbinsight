"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearchConditions, setCurrentSearchConditions] = useState("小川山 5.12a");

  const handleSearch = () => {
    setCurrentSearchConditions(searchQuery);
    // TODO: APIから検索結果を取得する処理を実装
  };

  // サンプルデータ（後でAPIから取得する）
  const articles = [
    {
      id: 1,
      title: "小川山の名課題「エイハブ船長」完登記録",
      coverImage: null,
      tags: ["小川山", "5.12a", "トラッド"],
      postedDate: "2024-03-15",
      description: "小川山を代表する5.12aの名課題。核心部分の攻略法を詳しく解説します。"
    },
    {
      id: 2,
      title: "小川山 廻り目平のボルダー課題",
      coverImage: null,
      tags: ["小川山", "V4", "ボルダリング"],
      postedDate: "2024-03-10",
      description: "廻り目平エリアの隠れた名課題を発見。アプローチから攻略まで詳しく解説。"
    },
    {
      id: 3,
      title: "小川山 屋根岩の5.11クラック特集",
      coverImage: null,
      tags: ["小川山", "5.11c", "クラック"],
      postedDate: "2024-03-08",
      description: "屋根岩エリアの代表的なクラック課題を網羅。テクニックと装備を詳しく解説。"
    },
    {
      id: 4,
      title: "小川山 金峰山荘周辺の初級者向け課題",
      coverImage: null,
      tags: ["小川山", "5.7", "初級者"],
      postedDate: "2024-03-05",
      description: "金峰山荘周辺で楽しめる初級者向けの課題を厳選してご紹介。"
    },
    {
      id: 5,
      title: "小川山 烏帽子岩の5.12b「スーパーマン」",
      coverImage: null,
      tags: ["小川山", "5.12b", "フェース"],
      postedDate: "2024-03-01",
      description: "烏帽子岩の名課題スーパーマン。数年越しの完登までの記録を公開。"
    },
    {
      id: 6,
      title: "小川山のマルチピッチ入門",
      coverImage: null,
      tags: ["小川山", "5.9", "マルチピッチ"],
      postedDate: "2024-02-28",
      description: "小川山でマルチピッチクライミングデビュー。おすすめルートと注意点。"
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="flex-1">
      {/* Search Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-orange-900 mb-8">
            記事検索
          </h1>
          
          {/* Current Search Conditions */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-orange-200">
            <h2 className="text-lg font-semibold text-orange-900 mb-2">
              検索条件
            </h2>
            <p className="text-gray-700">
              <span className="font-medium">キーワード:</span> {currentSearchConditions}
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-orange-100 rounded-lg p-6 sm:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-orange-900 mb-4">
              新しい検索
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                placeholder="岩場名、グレード、エリアなど..." 
                className="flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                onClick={handleSearch}
              >
                検索
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-orange-900">
              検索結果
            </h2>
            <p className="text-gray-600">
              {articles.length}件の記事が見つかりました
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {articles.map((article) => (
              <article 
                key={article.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden border border-orange-200 hover:shadow-xl transition-shadow cursor-pointer"
              >
                {/* Cover Image */}
                <div className="bg-orange-200 h-48 flex items-center justify-center">
                  {article.coverImage ? (
                    <img 
                      src={article.coverImage} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-orange-700 font-medium">サンプル画像</span>
                  )}
                </div>

                {/* Article Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-orange-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                    {article.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {article.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Posted Date */}
                  <div className="text-sm text-gray-500">
                    投稿日: {formatDate(article.postedDate)}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              さらに読み込む
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}