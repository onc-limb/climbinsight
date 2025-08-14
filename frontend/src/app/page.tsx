import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import ClimbLogSection from "@/components/home/ClimbLogSection";
import RecommendedArticles from "@/components/home/RecommendedArticles";
import ClimbSnapSection from "@/components/home/ClimbSnapSection";
import Membership from "@/components/client/membership";

export default function HomePage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <FeaturesSection />
      <ClimbLogSection />
      <RecommendedArticles />
      <ClimbSnapSection />
      <Membership />
    </main>
  );
}
