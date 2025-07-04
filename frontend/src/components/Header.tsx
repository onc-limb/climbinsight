'use client'
import React from "react";
import Link from "next/link";
import Image from "next/image";

import { useState } from 'react'; // useStateをインポート

// shadcn/ui の DropdownMenu コンポーネントをインポート
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; 

export default function Header() {
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false)

  return (
    <header className="bg-orange-200 shadow text-orange-900">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-4 py-2">
        <div className="flex-shrink-0">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/Logo.png" alt="Logo" height={100} width={250} className="" />
        </Link>
        </div>
        <div className="flex justify-center flex-grow">
          <ul className="flex space-x-8">
            <li>
              <DropdownMenu
                open={isFeaturesMenuOpen}
                onOpenChange={setIsFeaturesMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    className="text-gray-700 hover:text-orange-600 text-lg font-medium cursor-pointer"
                  >
                    機能
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white shadow-lg rounded-md p-2"
                >
                  <DropdownMenuItem asChild>
                    <Link href="/hold-extraction" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      画像加工
                    </Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem asChild>
                    <Link href="/features/problem-analysis" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      課題分析機能
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/features/competition-results" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      コンペティションリザルト機能
                    </Link>
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li>
              <Link href="/contact" className="text-gray-700 hover:text-orange-600 text-lg font-medium">
                お問い合わせ
              </Link>
            </li>
          </ul>
        </div>
        <div className="w-auto" style={{ minWidth: '100px' }}> {/* 将来的なボタンの幅を考慮してmin-widthを設定 */}
          {/* ここにログイン/会員登録ボタンが入ります */}
        </div>
      </nav>
    </header>
  );
}
