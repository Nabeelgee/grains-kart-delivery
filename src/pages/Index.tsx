import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedRestaurants } from "@/components/home/FeaturedRestaurants";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { PartnerCTA } from "@/components/home/PartnerCTA";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CategoriesSection />
      <FeaturedRestaurants />
      <FeaturesSection />
      <PartnerCTA />
    </Layout>
  );
};

export default Index;
