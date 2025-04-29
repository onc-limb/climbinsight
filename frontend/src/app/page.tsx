"use client";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { useResultStore } from "@/stores/resultStore";
import { useRouter } from "next/navigation";

type Point = { x: number; y: number };

export default function TopPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<Point[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // すでに近くにあるなら削除（トグル）
    const threshold = 10;
    const index = points.findIndex(
      (p) => Math.abs(p.x - x) < threshold && Math.abs(p.y - y) < threshold
    );

    if (index !== -1) {
      setPoints((prev) => prev.filter((_, i) => i !== index));
    } else {
      setPoints((prev) => [...prev, { x, y }]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("画像ファイルを選択してください。");
        return;
      }
      setImage(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      setError("画像を選択してください");
      return;
    }

    setLoading(true);
    setError(null);
    const rect = imageRef.current;
    const normalizedPoints = points.map((p) => ({
      x: p.x * ((rect?.naturalWidth || 1) / (rect?.width || 1)),
      y: p.y * ((rect?.naturalHeight || 1) / (rect?.height || 1)),
    }));

    const formData = new FormData();
    formData.append("image", image);
    formData.append("points", JSON.stringify(normalizedPoints));

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/images/process",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("サーバーとの通信に失敗しました。");
      }

      const data = await res.json();

      // zustand に保存して遷移
      useResultStore
        .getState()
        .setResult(URL.createObjectURL(image), data.session);
      router.push("/input");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-4xl font-bold">ClimbInsightへようこそ！</h1>
        <p className="text-xl text-gray-600">
          壁の写真を選択、ホールドをクリックして、課題のカバー画像を作成しよう
        </p>

        {!image ? (
          <div className="space-y-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-orange-300 rounded-lg p-6 text-orange-700 hover:bg-orange-100 transition"
            >
              <span className="text-sm font-medium mb-2">
                画像をここにアップロード またはクリックして選択
              </span>
              <span className="text-xs text-orange-500">
                (JPEG / PNG / HEIC など対応)
              </span>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative inline-block">
              <Image
                ref={imageRef}
                src={URL.createObjectURL(image)}
                alt="Preview"
                width={500}
                height={400}
                onClick={handleClick}
                className="w-full rounded-lg shadow"
              />
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {points.map((point, idx) => (
                  <circle
                    key={idx}
                    cx={point.x}
                    cy={point.y}
                    r={4}
                    fill="red"
                  />
                ))}
              </svg>
            </div>
            <div className="text-right">
              <button
                className="text-sm text-orange-700 hover:text-orange-900 border border-orange-700 rounded px-3 py-1 hover:shadow-lg"
                onClick={() => {
                  setImage(null);
                }}
              >
                画像を取り消す
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-red-600 text-sm">⚠ {error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "送信中..." : "画像を送信する"}
        </button>
        <h2 className="text-2xl font-bold">✏️ 使い方ガイド</h2>
        <ul className="list-inside space-y-4">
          <li>
            <p className="text-lg font-semibold">
              1. 課題の写真を選んでください
            </p>
            <p className="text-gray-700">
              壁全体が写っているJPEG / PNG / HEIC
              画像をアップロードしてください。
            </p>
          </li>
          <li>
            <p className="text-lg font-semibold">
              2. 課題のホールドを指定してください
            </p>
            <p className="text-gray-700">
              写真上で、登るホールドをクリックまたはタップしてください。
              <br />
              クリックしたホールドが自動で抽出されます。
            </p>
            <ul className="list-disc list-inside text-gray-600 text-sm mt-2">
              <li>
                同じホールドをもう一度クリックすると、選択を取り消すことができます。
              </li>
              <li>
                ホールドの中心かつ色がわかりやすい部分をクリックすると、加工の精度が向上します。
              </li>
            </ul>
          </li>
          <li>
            <p className="text-lg font-semibold">
              3. 「画像を送信する」を押すと、画像が送信されます
            </p>
            <p className="text-gray-700">
              指定したホールド情報を元に、写真を自動で加工します。
              <br />
              加工が完了すると、加工済みの画像と課題情報をダウンロードできるようになります！
            </p>
          </li>
        </ul>
      </main>
    </>
  );
}
