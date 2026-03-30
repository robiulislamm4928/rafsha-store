import { Helmet } from "react-helmet-async";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import CategorySlider from "@/components/store/CategorySlider";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import KeyPoints from "@/components/store/KeyPoints";
import PromotionalBanners from "@/components/store/PromotionalBanners";
import CategoryProducts from "@/components/store/CategoryProducts";
import CustomerReviews from "@/components/store/CustomerReviews";
import MoneybackBanner from "@/components/store/MoneybackBanner";
import RecentlyViewedProducts from "@/components/store/RecentlyViewedProducts";
import Footer from "@/components/store/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const ScrollSection = ({ children, className = "", variant = "up" }: { children: React.ReactNode; className?: string; variant?: "up" | "left" | "right" | "scale" }) => {
  const { ref, isVisible } = useScrollAnimation();
  const variantClass = variant === "left" ? "scroll-animate-left" : variant === "right" ? "scroll-animate-right" : variant === "scale" ? "scroll-animate-scale" : "scroll-animate";
  return (
    <div ref={ref} className={`${variantClass} ${isVisible ? "visible" : ""} ${className}`}>
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
      
      <CategorySlider />
      <ScrollSection variant="scale"><KeyPoints /></ScrollSection>
      <ScrollSection variant="left"><FeaturedProducts /></ScrollSection>
      <ScrollSection variant="right"><PromotionalBanners /></ScrollSection>
      <ScrollSection variant="up"><CategoryProducts /></ScrollSection>
      <ScrollSection variant="scale"><RecentlyViewedProducts /></ScrollSection>
      <ScrollSection variant="left"><CustomerReviews /></ScrollSection>
      
      <ScrollSection variant="scale"><MoneybackBanner /></ScrollSection>
      <Footer />
    </div>
  );
};

export default Index;
