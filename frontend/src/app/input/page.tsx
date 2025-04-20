'use client'
import React, { useState } from "react";
import Image from "next/image";
import { useResultStore } from '@/stores/resultStore';
import { useRouter } from 'next/navigation';


export default function TopPage() {
  const router = useRouter();
  const [grade, setGrade] = useState("V0");
  const [gym, setGym] = useState("");
  const [style, setStyle] = useState("");
  const [tryCount, setTryCount] = useState(0)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const image = useResultStore.getState().imageUrl
  const sessionId = useResultStore.getState().session

  const handleSubmit = async () => {
    if (!gym || !style) {
      setError("全ての項目を入力してください。");
      return;
    }

    setLoading(true);
    setError(null);
    const body = JSON.stringify({
      sessionId,
      grade,
      gym,
      style,
      tryCount
    })

    try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/contents/generate", {
        method: "POST",
        body: body,
      });

      if (!res.ok) {
        throw new Error("サーバーとの通信に失敗しました。");
      }

      router.push(`/result?session=${sessionId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">ClimbInsight</h1>
      <p className="text-gray-600">課題の画像をアップロードして課題情報を記録しましょう！</p>
      <div className="relative inline-block">
      {image && (<Image
        src={image}
        alt="Preview"
        width={500}
        height={400}
        className="w-full rounded-lg shadow"
      />)}
    </div>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium">グレード</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i} value={`V${i}`}>
                V{i}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">ジム名</label>
          <input
            type="text"
            value={gym}
            onChange={(e) => setGym(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder="例: B-PUMP 荻窪"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">課題スタイル</label>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder="例: スラブ / ルーフ / 足自由 など"
          />
        </div>
      </div>
        <div>
          <label className="block text-sm font-medium">トライ回数</label>
          <input
            type="number"
            value={tryCount}
            onChange={(e) => setTryCount(Number(e.target.value))}
            className="border rounded px-2 py-1 w-full"
            placeholder="トライ回数を入力してください"
          />
        </div>


      {error && <p className="text-red-600 text-sm">⚠ {error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? "送信中..." : "送信して登録する"}
      </button>
    </main>
  );
}