import { useEffect, useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { Package, Filter, X, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price: number | null;
  short_description: string | null;
  stock_quantity: number;
  category_id: string | null;
  product_images: { image_url: string }[];
  avg_rating?: number;
}

type SortOption = "newest" | "price_low" | "price_high" | "rating";
const PRODUCTS_PER_PAGE = 12;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category"));
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [maxPrice, setMaxPrice] = useState(50000);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [catRes, prodRes, reviewRes] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, slug, image_url")
          .eq("is_active", true)
          .order("display_order"),
        supabase
          .from("products")
          .select("id, name, slug, regular_price, sale_price, short_description, stock_quantity, category_id, product_images(image_url)")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("reviews")
          .select("product_id, rating")
          .eq("is_approved", true),
      ]);
      if (catRes.data) setCategories(catRes.data);

      // Calculate avg ratings
      const ratingMap: Record<string, { sum: number; count: number }> = {};
      if (reviewRes.data) {
        for (const r of reviewRes.data) {
          if (!ratingMap[r.product_id]) ratingMap[r.product_id] = { sum: 0, count: 0 };
          ratingMap[r.product_id].sum += r.rating;
          ratingMap[r.product_id].count += 1;
        }
      }

      if (prodRes.data) {
        const prods = (prodRes.data as unknown as Product[]).map((p) => ({
          ...p,
          avg_rating: ratingMap[p.id] ? ratingMap[p.id].sum / ratingMap[p.id].count : 0,
        }));
        setProducts(prods);
        const highest = Math.max(...prods.map((p) => p.sale_price ?? p.regular_price), 1000);
        const roundedMax = Math.ceil(highest / 500) * 500;
        setMaxPrice(roundedMax);
        setPriceRange([0, roundedMax]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = selectedCategory
      ? products.filter((p) => p.category_id === selectedCategory)
      : [...products];

    // Price filter
    result = result.filter((p) => {
      const price = p.sale_price ?? p.regular_price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => (a.sale_price ?? a.regular_price) - (b.sale_price ?? b.regular_price));
        break;
      case "price_high":
        result.sort((a, b) => (b.sale_price ?? b.regular_price) - (a.sale_price ?? a.regular_price));
        break;
      case "rating":
        result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        break;
      // newest = default order from API
    }

    return result;
  }, [products, selectedCategory, sortBy, priceRange]);

  const handleCategoryClick = (catId: string | null) => {
    setSelectedCategory(catId);
    setMobileFilterOpen(false);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  const CategorySidebar = ({ className }: { className?: string }) => (
    <div className={cn("space-y-1", className)}>
      <button
        onClick={() => handleCategoryClick(null)}
        className={cn(
          "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          selectedCategory === null
            ? "bg-primary text-primary-foreground"
            : "text-foreground/80 hover:bg-secondary"
        )}
      >
        সকল পণ্য ({products.length})
      </button>
      {categories.map((cat) => {
        const count = products.filter((p) => p.category_id === cat.id).length;
        return (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between",
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-secondary"
            )}
          >
            <span className="truncate">{cat.name}</span>
            <span className={cn(
              "text-xs ml-2 shrink-0",
              selectedCategory === cat.id ? "opacity-80" : "text-muted-foreground"
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>সকল পণ্য | রাফছা স্টোর</title>
        <meta name="description" content="রাফছা স্টোরের সকল পণ্য দেখুন। ক্যাটাগরি অনুযায়ী পণ্য ব্রাউজ করুন।" />
      </Helmet>
      <TopBar />
      <Header />

      <main className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="bg-primary/5 border-b border-border">
          <div className="container px-4 py-5 sm:py-6 md:py-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary" />
                  সকল পণ্য
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {filtered.length}টি পণ্য পাওয়া গেছে
                  {selectedCategory && (
                    <button
                      onClick={() => handleCategoryClick(null)}
                      className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <X className="h-3 w-3" /> ফিল্টার সরান
                    </button>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort dropdown */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-xs sm:text-sm">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">নতুন আগে</SelectItem>
                    <SelectItem value="price_low">দাম: কম → বেশি</SelectItem>
                    <SelectItem value="price_high">দাম: বেশি → কম</SelectItem>
                    <SelectItem value="rating">সেরা রেটিং</SelectItem>
                  </SelectContent>
                </Select>

                {/* Mobile filter toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden h-9"
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                >
                  <Filter className="h-4 w-4 mr-1.5" />
                  ফিল্টার
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container px-4 py-6 md:py-8">
          <div className="flex gap-6 md:gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-56 lg:w-64 shrink-0">
              <div className="sticky top-20 space-y-6">
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">ক্যাটাগরি</h3>
                  <CategorySidebar />
                </div>

                {/* Price Range Filter */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">মূল্য পরিসীমা</h3>
                  <div className="px-1">
                    <Slider
                      min={0}
                      max={maxPrice}
                      step={50}
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v as [number, number])}
                      className="mb-3"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>৳{priceRange[0].toLocaleString()}</span>
                      <span>৳{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
                <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl border-t border-border p-5 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">ফিল্টার</h3>
                    <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg hover:bg-secondary">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Price Range - Mobile */}
                  <div className="mb-5">
                    <h4 className="text-sm font-medium text-foreground mb-3">মূল্য পরিসীমা</h4>
                    <div className="px-1">
                      <Slider
                        min={0}
                        max={maxPrice}
                        step={50}
                        value={priceRange}
                        onValueChange={(v) => setPriceRange(v as [number, number])}
                        className="mb-3"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>৳{priceRange[0].toLocaleString()}</span>
                        <span>৳{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-sm font-medium text-foreground mb-3">ক্যাটাগরি</h4>
                  <CategorySidebar />
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border animate-pulse">
                      <div className="aspect-square bg-secondary rounded-t-xl" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-secondary rounded w-3/4" />
                        <div className="h-3 bg-secondary rounded w-1/2" />
                        <div className="h-8 bg-secondary rounded mt-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">কোনো পণ্য পাওয়া যায়নি</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => { setSelectedCategory(null); setPriceRange([0, maxPrice]); }}
                  >
                    সকল ফিল্টার সরান
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {filtered.map((p) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      slug={p.slug}
                      regularPrice={p.regular_price}
                      salePrice={p.sale_price}
                      imageUrl={p.product_images?.[0]?.image_url || null}
                      shortDescription={p.short_description}
                      stockQuantity={p.stock_quantity}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Products;
