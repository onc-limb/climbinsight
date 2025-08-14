import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import SocialLoginButtons from "@/components/client/auth/SocialLoginButtons";
import SignupForm from "@/components/client/auth/SignupForm";
import SignupFooter from "@/components/SignupFooter";

export default function SignupPage() {

  return (
    <main className="flex-1 bg-gradient-to-br from-orange-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-orange-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-orange-900">アカウント作成</CardTitle>
              <CardDescription>
                下記の方法でアカウントを作成できます
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Social Login Buttons */}
              <SocialLoginButtons mode="signup" />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-sm text-gray-500">または</span>
                </div>
              </div>

              {/* Email Form */}
              <SignupForm />
            </CardContent>

            <SignupFooter />
          </Card>
        </div>
      </div>
    </main>
  );
}