'use client'
import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-4 mt-12 text-sm text-gray-600">
      <p>
        <Link href="/terms" className="underline hover:text-gray-800">
          利用規約
        </Link>
      </p>
      <p className="mt-1">© {new Date().getFullYear()} onc-limb</p>
    </footer>
  );
}
