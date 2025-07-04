"use client";

import LoadingScreen from "@/components/Loading";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Result() {
  const router = useRouter();
  const [imageData, setImageData] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  useEffect(() => {
    if (!sessionId) return;
    const es = new EventSource(
      process.env.NEXT_PUBLIC_API_URL + `/result?session=${sessionId}`
    );

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 正常データ受信時
        setImageData(data.image);
        setContent(data.contents);
        es.close();
      } catch (err) {
        console.log(err);
        alert("レスポンスの解析に失敗しました");
        es.close();
        router.push("/");
      }
    };

    es.addEventListener("timeout", (event) => {
      const data = JSON.parse(event.data);
      console.log("⏱ タイムアウトイベント", data.error); // "timeout"
      alert("処理がタイムアウトしました");
      es.close();
      router.push("/");
    });

    es.onerror = (err) => {
      console.log("SSE接続エラー:", err);
      alert("サーバーとの接続に失敗しました。再接続を試みてください。");
      es.close();
      // 再接続のロジックをここに追加
      router.push("/"); // トップページに戻る
    };

    return () => {
      es.close();
    };
  }, [sessionId, router]);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleDownload = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "climbinsight_result.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  if (!imageData || !content) return <LoadingScreen />;

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      {imageData && content && (
        <>
          <h1 className="text-2xl font-bold text-center">処理結果</h1>
          <Image
            ref={imgRef}
            src={imageData}
            alt="Result"
            crossOrigin="anonymous"
            unoptimized
            width={500}
            height={400}
            className="w-full rounded-lg shadow"
          />

          <button
            onClick={handleDownload}
            className="block text-center bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            画像をダウンロード
          </button>

          <div className="p-4 rounded">
            <p className="text-sm whitespace-pre-line bg-orange-50 border-4 border-orange-300 p-4 rounded-lg">
              {content}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(content ?? "");
                const toast = document.createElement("div");
                toast.textContent = "コピーしました";
                toast.style.position = "fixed";
                toast.style.bottom = "10px";
                toast.style.right = "10px";
                toast.style.backgroundColor = "orange";
                toast.style.color = "white";
                toast.style.padding = "10px";
                toast.style.borderRadius = "5px";
                toast.style.zIndex = "1000";
                document.body.appendChild(toast);
                setTimeout(() => {
                  document.body.removeChild(toast);
                }, 2000);
              }}
              className="text-sm text-orange-700 hover:text-orange-900 border border-orange-700 rounded px-3 py-1 hover:shadow-lg"
            >
              投稿文をコピー
            </button>
          </div>
        </>
      )}

      <Link
        href="/"
        className="text-sm text-orange-700 hover:text-orange-900 border border-orange-700 rounded px-3 py-1 hover:shadow-lg"
      >
        トップページへ戻る
      </Link>
    </main>
  );
}
