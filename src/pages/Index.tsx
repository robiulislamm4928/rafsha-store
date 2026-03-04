import { Helmet } from "react-helmet-async";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import HeroBanner from "@/components/store/HeroBanner";
import CategorySlider from "@/components/store/CategorySlider";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import KeyPoints from "@/components/store/KeyPoints";
import PromotionalBanners from "@/components/store/PromotionalBanners";
import AllProducts from "@/components/store/AllProducts";
import CustomerReviews from "@/components/store/CustomerReviews";
import ComparisonTable from "@/components/store/ComparisonTable";
import MoneybackBanner from "@/components/store/MoneybackBanner";
import Footer from "@/components/store/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const ScrollSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div ref={ref} className={`scroll-animate ${isVisible ? "visible" : ""} ${className}`}>
      {children}
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>রাফছা স্টোর — সেরা পণ্য সেরা দামে | বাংলাদেশ</title>
        <meta name="description" content="রাফছা স্টোরে পাচ্ছেন মানসম্মত পণ্য সেরা মূল্যে। দ্রুত ডেলিভারি, মানি-ব্যাক গ্যারান্টি। সারাদেশে ডেলিভারি।" />
      </Helmet>
      <TopBar />
      <Header />
      <HeroBanner />
      <ScrollSection><CategorySlider /></ScrollSection>
      <ScrollSection><FeaturedProducts /></ScrollSection>
      <ScrollSection><KeyPoints /></ScrollSection>
      <ScrollSection><PromotionalBanners /></ScrollSection>
      <ScrollSection><AllProducts /></ScrollSection>
      <ScrollSection><CustomerReviews /></ScrollSection>
      <ScrollSection><ComparisonTable /></ScrollSection>
      <ScrollSection><MoneybackBanner /></ScrollSection>
      <Footer />
    </div>
  );
};

export default Index;
