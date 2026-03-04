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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <HeroBanner />
      <CategorySlider />
      <FeaturedProducts />
      <KeyPoints />
      <PromotionalBanners />
      <AllProducts />
      <CustomerReviews />
      <ComparisonTable />
      <MoneybackBanner />
      <Footer />
    </div>
  );
};

export default Index;
