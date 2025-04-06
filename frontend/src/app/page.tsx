'use client'
import Image from "next/image";
import React, { useState } from "react";
import { useResultStore } from '@/stores/resultStore';
import { useRouter } from 'next/navigation';

export default function TopPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [grade, setGrade] = useState("V0");
  const [gym, setGym] = useState("");
  const [style, setStyle] = useState("");
  const [tryCount, setTryCount] = useState(0)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("画像ファイルを選択してください。");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!image || !gym || !style) {
      setError("全ての項目を入力してください。");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("grade", grade);
    formData.append("gym", gym);
    formData.append("style", style);

    try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("サーバーとの通信に失敗しました。");
      }

      const data = await res.json();
      
      // zustand に保存して遷移
      useResultStore.getState().setResult(data.imageData, data.content);
      router.push('/result');
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

      {!imagePreview ? (<div className="space-y-4">
  <label
    htmlFor="file-upload"
    className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-orange-300 rounded-lg p-6 text-orange-700 hover:bg-orange-100 transition"
  >
    <span className="text-sm font-medium mb-2">画像をここにアップロード またはクリックして選択</span>
    <span className="text-xs text-orange-500">(JPEG / PNG / HEIC など対応)</span>
  </label>
  <input
    id="file-upload"
    type="file"
    accept="image/*"
    onChange={handleImageChange}
    className="hidden"
  />
</div>) : 
 (
    <div className="space-y-2">
      <Image
        src={imagePreview}
        alt="Preview"
        width={500}
        height={400}
        className="w-full rounded-lg shadow"
      />
      <div className="text-right">
        <button
          className="text-sm text-orange-700 hover:text-orange-900 border border-orange-700 rounded px-3 py-1 hover:shadow-lg"
          onClick={() => {
            setImage(null);
            setImagePreview(null);
          }}
        >
          画像を取り消す
        </button>
      </div>
    </div>
  )}
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