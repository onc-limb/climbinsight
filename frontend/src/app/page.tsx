import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import ClimbLogSection from "@/components/home/ClimbLogSection";
import RecommendedArticles from "@/components/home/RecommendedArticles";
import ClimbSnapSection from "@/components/home/ClimbSnapSection";
import HomePageClient from "@/components/client/HomePageClient";

export default function HomePage() {
  return (
    <main className="flex-1">
      <HomePageClient>
        <HeroSection />
        <FeaturesSection />
        <ClimbLogSection />
        <RecommendedArticles />
        <ClimbSnapSection />
      </HomePageClient>
    </main>
  );
}
