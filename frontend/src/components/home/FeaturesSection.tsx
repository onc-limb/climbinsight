export default function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-orange-900 mb-12">
          機能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-orange-900 mb-2">
              ClimbLog
            </h3>
            <p className="text-gray-600">
              課題の動画、画像、感想などを好きに投稿
              <br />
              ジム名やグレードで検索もできる！
            </p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="text-xl font-bold text-orange-900 mb-2">
              ClimbSnap
            </h3>
            <p className="text-gray-600">
              写真からホールドを自動抽出し、カバー画像を作成
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}