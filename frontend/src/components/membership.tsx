import { Button } from "./ui/button";

export default function Membership() {
    return (
      <section className="py-12 sm:py-16 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 sm:p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              会員登録でもっと楽しく
            </h2>
            <p className="text-lg text-orange-100 mb-6">
              記事の投稿、お気に入り機能、コメント機能など、
              <br className="hidden sm:block" />
              さらに充実したクライミングライフを送りませんか？
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-orange-600 hover:bg-white/25 font-semibold px-8 py-3 text-lg"
              >
                無料で会員登録
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-orange-600 hover:bg-white/25 font-semibold px-8 py-3 text-lg"
              >
                ログイン
              </Button>
            </div>
            <p className="text-sm text-orange-100 mt-4">
              登録は30秒で完了。今すぐあなたのクライミング記録を始めよう！
            </p>
          </div>
        </div>
      </section>
    )
}