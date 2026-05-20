import { Helmet } from "react-helmet-async";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import CategorySlider from "@/components/store/CategorySlider";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import CategoryProducts from "@/components/store/CategoryProducts";
import CustomerReviews from "@/components/store/CustomerReviews";

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
        <meta name="description" content="রাফছা স্টোরে পাচ্ছেন মানসম্মত পণ্য সেরা মূল্যে। সারাদেশে ডেলিভারি।" />
        <meta property="og:title" content="রাফছা স্টোর — সেরা পণ্য সেরা দামে" />
        <meta property="og:description" content="মানসম্মত পণ্য সেরা মূল্যে। সারাদেশে ডেলিভারি।" />
        <meta property="og:url" content="https://rafsha-store.lovable.app/" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://rafsha-store.lovable.app/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "রাফছা স্টোর",
          url: "https://rafsha-store.lovable.app/",
          inLanguage: "bn-BD",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://rafsha-store.lovable.app/products?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}</script>
      </Helmet>
      <TopBar />
      <Header />

      <main>
        <h1 className="sr-only">রাফছা স্টোর — বাংলাদেশের বিশ্বস্ত অনলাইন শপ</h1>
        <CategorySlider />
        <ScrollSection variant="left"><FeaturedProducts /></ScrollSection>
        <ScrollSection variant="up"><CategoryProducts /></ScrollSection>
        <ScrollSection variant="scale"><RecentlyViewedProducts /></ScrollSection>
        <ScrollSection variant="left"><CustomerReviews /></ScrollSection>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
