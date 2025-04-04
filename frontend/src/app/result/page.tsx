'use client'

import { useResultStore } from '@/stores/resultStore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ResultPage() {
  const { imageData, caption, clear } = useResultStore();
  const router = useRouter();

  if (!imageData) return <p>データが見つかりません。</p>;

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">処理結果</h1>

      <Image src={imageData} alt="Result" width={500}
        height={400} className="w-full rounded-lg shadow" />

      <a
        href={imageData}
        download="result.png"
        className="block text-center bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        画像をダウンロード
      </a>

      <div className="bg-orange-100 p-4 rounded">
        <p className="text-sm whitespace-pre-line">{caption}</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(caption ?? '');
          }}
          className="mt-2 text-sm underline text-orange-700"
        >
          投稿文をコピー
        </button>
      </div>

      <button
        onClick={() => {
          clear();
          router.push('/');
        }}
        className="text-sm text-gray-600 underline text-center block mx-auto"
      >
        トップページへ戻る
      </button>
    </main>
  );
}
