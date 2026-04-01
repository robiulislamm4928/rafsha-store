import { useEffect, useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { Package, X, ArrowUpDown, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [catRes, prodRes, reviewRes] = await Promise.all([
        supabase.from("categories").select("id, name, slug, image_url").eq("is_active", true).order("display_order"),
        supabase.from("products").select("id, name, slug, regular_price, sale_price, short_description, stock_quantity, category_id, product_images(image_url)").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("reviews").select("product_id, rating").eq("is_approved", true),
      ]);
      if (catRes.data) setCategories(catRes.data);
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
          ...p, avg_rating: ratingMap[p.id] ? ratingMap[p.id].sum / ratingMap[p.id].count : 0,
        }));
        setProducts(prods);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = selectedCategory ? products.filter((p) => p.category_id === selectedCategory) : [...products];
    switch (sortBy) {
      case "price_low": result.sort((a, b) => (a.sale_price ?? a.regular_price) - (b.sale_price ?? b.regular_price)); break;
      case "price_high": result.sort((a, b) => (b.sale_price ?? b.regular_price) - (a.sale_price ?? a.regular_price)); break;
      case "rating": result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)); break;
    }
    return result;
  }, [products, selectedCategory, sortBy]);

  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => { setVisibleCount(PRODUCTS_PER_PAGE); }, [selectedCategory, sortBy]);

  const handleCategoryClick = (catId: string | null) => {
    setSelectedCategory(catId);
    if (catId) setSearchParams({ category: catId }); else setSearchParams({});
  };

  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name;

  return (
    <>
      <Helmet>
        <title>সকল পণ্য | রাফছা স্টোর</title>
        <meta name="description" content="রাফছা স্টোরের সকল পণ্য দেখুন। ক্যাটাগরি অনুযায়ী পণ্য ব্রাউজ করুন।" />
      </Helmet>
      <TopBar />
      <Header />
      <main className="min-h-screen bg-background">
        <div className="bg-primary/5 border-b border-border">
          <div className="container px-4 py-5 sm:py-6 md:py-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary" />
                  সকল পণ্য
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{filtered.length}টি পণ্য পাওয়া গেছে</p>
              </div>
              <div className="flex items-center gap-2">
                {/* View mode toggle */}
                <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode("grid")} className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}>
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button onClick={() => setViewMode("list")} className={cn("p-2 transition-colors", viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}>
                    <List className="h-4 w-4" />
                  </button>
                </div>
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
              </div>
            </div>

            {/* Active filter chips */}
            {selectedCategory && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => handleCategoryClick(null)}>
                  {selectedCategoryName} <X className="h-3 w-3" />
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="container px-4 py-6 md:py-8">
          <div className="flex gap-6 md:gap-8">
            {/* Browse Sidebar */}
            <aside className="hidden md:block w-48 lg:w-56 shrink-0">
              <h3 className="font-bold text-foreground text-sm uppercase border-b border-border pb-2 mb-3">ব্রাউজ</h3>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={cn(
                      "block w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                      selectedCategory === cat.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Products */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                      <div className="aspect-square skeleton-shimmer" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 skeleton-shimmer rounded w-3/4" />
                        <div className="h-3 skeleton-shimmer rounded w-1/2" />
                        <div className="h-8 skeleton-shimmer rounded mt-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">কোনো পণ্য পাওয়া যায়নি</p>
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                      {visibleProducts.map((p) => (
                        <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} regularPrice={p.regular_price} salePrice={p.sale_price} imageUrl={p.product_images?.[0]?.image_url || null} shortDescription={p.short_description} stockQuantity={p.stock_quantity} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleProducts.map((p) => (
                        <Link key={p.id} to={`/product/${p.slug}`} className="flex bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
                          <div className="w-28 sm:w-36 shrink-0 bg-secondary">
                            {p.product_images?.[0]?.image_url ? (
                              <img src={p.product_images[0].image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground/30" /></div>}
                          </div>
                          <div className="p-3 sm:p-4 flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h3>
                            {p.short_description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.short_description}</p>}
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="text-sm sm:text-lg font-bold text-primary">৳{p.sale_price ?? p.regular_price}</span>
                              {p.sale_price && p.sale_price < p.regular_price && <span className="text-xs text-muted-foreground line-through">৳{p.regular_price}</span>}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Load more */}
                  {hasMore && (
                    <div className="text-center mt-8">
                      <Button variant="outline" size="lg" onClick={() => setVisibleCount((c) => c + PRODUCTS_PER_PAGE)} className="px-8">
                        আরো দেখুন ({filtered.length - visibleCount}টি বাকি)
                      </Button>
                    </div>
                  )}
                </>
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
