export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-orange-50 to-white py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo Section */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-6xl font-bold text-orange-900 mb-4">
            ClimbInsight
            <span className="block text-lg sm:text-xl font-normal text-orange-600 mt-2">
              〜 クライムインサイト 〜
            </span>
          </h1>
        </div>

        {/* Service Description */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-12 border border-orange-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-orange-900 mb-4">
            総合クライミングコミュニティサービス
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            あなたのクライミング体験をもっと楽しく！
          </p>
        </div>
      </div>
    </section>
  );
}