import Image from "next/image";
import Link from "next/link";
import React from "react";
import MediaEmbed from "./MediaEmbed";

interface Article {
  id: number;
  title: string;
  coverImage: string | null;
  tags: string[];
  postedDate: string;
  description: string;
}

interface ArticleComponentProps {
  article: Article;
}

export default function ArticleComponent({ article }: ArticleComponentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Link href={`/climblog/${article.id}`} className="block h-full">
      <article 
        className="bg-white rounded-lg shadow-lg overflow-hidden border border-orange-200 hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col"
      >
        {/* Cover Media */}
        <div className="bg-orange-200 h-48 flex items-center justify-center">
          {article.coverImage ? (
            <MediaEmbed 
              url={article.coverImage} 
              title={article.title}
              className="w-full h-full"
            />
          ) : (
            <span className="text-orange-700 font-medium">サンプル画像</span>
          )}
        </div>

        {/* Article Content */}
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-orange-900 mb-2 line-clamp-2">
            {article.title}
          </h3>
          
          <p className="text-gray-600 mb-4 text-sm line-clamp-3 flex-grow">
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
          <div className="text-sm text-gray-500 mt-auto">
            投稿日: {formatDate(article.postedDate)}
          </div>
        </div>
      </article>
    </Link>
  );
}

export type { Article };