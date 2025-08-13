import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex-1 bg-gradient-to-br from-orange-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-orange-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-orange-900">アカウントログイン</CardTitle>
              <CardDescription>
                下記の方法でログインできます
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Social Login Buttons */}
              <SocialLoginButtons />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-sm text-gray-500">または</span>
                </div>
              </div>

              {/* Email Form */}
              <LoginForm />

              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600">
                  アカウントをお持ちでないですか？{" "}
                  <Link href="/signup" className="text-orange-600 hover:underline font-medium">
                    新規登録はこちら
                  </Link>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}