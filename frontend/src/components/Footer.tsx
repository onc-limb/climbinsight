import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-orange-100 text-center py-4 mt-12 text-sm text-orange-800">
      <div className="flex justify-center items-center space-x-4">
          <Link href="/terms" className="underline hover:text-gray-800">
            利用規約
          </Link>
          <Link href="/privacy-policy" className="underline hover:text-gray-800">
            プライバシーポリシー
          </Link>
      </div>
      <p className="mt-1">© {new Date().getFullYear()} onc-limb</p>
    </footer>
  );
}
