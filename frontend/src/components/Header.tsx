'use client'
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-orange-200 shadow text-orange-900">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/Logo.jpg" alt="Logo" height={100} width={100} className="h-16 w-16" />
          <span className="text-xl font-semibold text-gray-800">ClimbInsight</span>
        </Link>
        <nav className="space-x-4 text-sm text-gray-700">
          <Link href="/">ホーム</Link>
          <Link href="/history">履歴</Link>
          <Link href="/contact">お問い合わせ</Link>
        </nav>
      </div>
    </header>
  );
}
