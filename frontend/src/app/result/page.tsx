'use client'

import { useResultStore } from '@/stores/resultStore';
import Image from 'next/image';
import Link from 'next/link';

export default function ResultPage() {
  const { imageData, content } = useResultStore();

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      { imageData && (<><h1 className="text-2xl font-bold text-center">処理結果</h1>

      <Image src={imageData} alt="Result" width={500}
        height={400} className="w-full rounded-lg shadow" />

      <a
        href={imageData}
        download="result.png"
        className="block text-center bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        画像をダウンロード
      </a>

      <div className="p-4 rounded">
        <p className="text-sm whitespace-pre-line bg-orange-50 border-4 border-orange-300 p-4 rounded-lg">{content}</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(content ?? '');
            const toast = document.createElement('div');
            toast.textContent = 'コピーしました';
            toast.style.position = 'fixed';
            toast.style.bottom = '10px';
            toast.style.right = '10px';
            toast.style.backgroundColor = 'orange';
            toast.style.color = 'white';
            toast.style.padding = '10px';
            toast.style.borderRadius = '5px';
            toast.style.zIndex = '1000';
            document.body.appendChild(toast);
            setTimeout(() => {
              document.body.removeChild(toast);
            }, 2000);
          }}
          className="text-sm text-orange-700 hover:text-orange-900 border border-orange-700 rounded px-3 py-1 hover:shadow-lg"
        >
          投稿文をコピー
        </button>
      </div></>)}

      <Link href="/" className="text-sm text-orange-700 hover:text-orange-900 border border-orange-700 rounded px-3 py-1 hover:shadow-lg">
          トップページへ戻る
      </Link>
    </main>
  );
}
