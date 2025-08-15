import Image from "next/image";

interface MediaEmbedProps {
  url: string;
  title: string;
  className?: string;
}

export default function MediaEmbed({ url, title, className = "" }: MediaEmbedProps) {
  // YouTube URLの判定と変換
  const getYouTubeEmbedUrl = (url: string): string | null => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  // Instagram URLの判定
  const isInstagramUrl = (url: string): boolean => {
    return /instagram\.com\/p\//.test(url);
  };

  // Bunny Stream URLの判定
  const isBunnyStreamUrl = (url: string): boolean => {
    return /bunnycdn\.com|b-cdn\.net/.test(url) && /\.(mp4|webm|mov)/.test(url);
  };

  // 画像URLの判定
  const isImageUrl = (url: string): boolean => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  // YouTube埋め込み
  const youtubeEmbedUrl = getYouTubeEmbedUrl(url);
  if (youtubeEmbedUrl) {
    return (
      <div className={`aspect-video ${className}`}>
        <iframe
          src={youtubeEmbedUrl}
          title={title}
          className="w-full h-full rounded-lg"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  // Instagram埋め込み
  if (isInstagramUrl(url)) {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <blockquote 
          className="instagram-media" 
          data-instgrm-permalink={url}
          data-instgrm-version="14"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            Instagram投稿を見る
          </a>
        </blockquote>
        <script async src="//www.instagram.com/embed.js"></script>
      </div>
    );
  }

  // Bunny Stream動画埋め込み
  if (isBunnyStreamUrl(url)) {
    return (
      <div className={`aspect-video ${className}`}>
        <video 
          controls 
          className="w-full h-full rounded-lg"
          preload="metadata"
        >
          <source src={url} type="video/mp4" />
          お使いのブラウザは動画タグをサポートしていません。
        </video>
      </div>
    );
  }

  // 画像埋め込み
  if (isImageUrl(url)) {
    return (
      <div className={`relative aspect-video ${className}`}>
        <Image
          src={url}
          alt={title}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  // URLが判定できない場合のフォールバック
  return (
    <div className={`bg-orange-200 h-48 flex items-center justify-center rounded-lg ${className}`}>
      <div className="text-center text-orange-700">
        <p className="font-medium">メディアを読み込めませんでした</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm underline hover:no-underline"
        >
          元のURLを開く
        </a>
      </div>
    </div>
  );
}