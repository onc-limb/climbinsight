import Link from "next/link";
import { CardFooter } from "@/components/ui/card";

export default function SignupFooter() {
  return (
    <CardFooter className="flex flex-col space-y-4">
      <div className="text-center text-sm text-gray-600">
        <p>
          アカウント作成により、
          <Link href="/terms" className="text-orange-600 hover:underline">利用規約</Link>
          および
          <Link href="/privacy-policy" className="text-orange-600 hover:underline">プライバシーポリシー</Link>
          に同意したものとみなします。
        </p>
      </div>

      <div className="text-center">
        <span className="text-sm text-gray-600">
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" className="text-orange-600 hover:underline font-medium">
            ログインはこちら
          </Link>
        </span>
      </div>
    </CardFooter>
  );
}