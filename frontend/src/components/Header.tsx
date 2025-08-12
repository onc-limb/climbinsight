'use client'
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import { useState } from 'react';

// shadcn/ui の DropdownMenu コンポーネントをインポート
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-orange-200 shadow text-orange-900">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-4 py-2">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/Logo.png" 
              alt="Logo" 
              height={100} 
              width={250} 
              className="h-12 w-auto sm:h-16" 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center flex-grow">
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

        {/* Desktop Right Section */}
        <div className="hidden md:flex space-x-4 w-auto" style={{ minWidth: '200px' }}>
          <Link href="/login">
            <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
              ログイン
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-orange-600 text-white hover:bg-orange-700">
              会員登録
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            aria-expanded="false"
          >
            <span className="sr-only">メニューを開く</span>
            {/* Hamburger icon */}
            <svg
              className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            {/* X icon */}
            <svg
              className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-orange-100">
          <div className="block">
            <button
              onClick={() => setIsFeaturesMenuOpen(!isFeaturesMenuOpen)}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-200 flex justify-between items-center"
            >
              機能
              <svg
                className={`ml-2 h-4 w-4 transition-transform ${isFeaturesMenuOpen ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {isFeaturesMenuOpen && (
              <div className="pl-4 space-y-1">
                <Link
                  href="/hold-extraction"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  画像加工
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            お問い合わせ
          </Link>
          
          {/* Mobile Auth Buttons */}
          <div className="px-3 py-2 space-y-2">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50">
                ログイン
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-orange-600 text-white hover:bg-orange-700">
                会員登録
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
