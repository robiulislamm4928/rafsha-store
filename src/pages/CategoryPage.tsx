import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { Package, ChevronLeft, ChevronRight, Filter, X, ArrowUpDown, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price: number | null;
  short_description: string | null;
  stock_quantity: number;
  product_images: { image_url: string }[];
}

type SortOption = "newest" | "price_low" | "price_high" | "popularity";
const PRODUCTS_PER_PAGE = 12;

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!categorySlug) return;
    setLoading(true);
    setNotFound(false);

    const fetchData = async () => {
      // Fetch all categories + current category
      const [catRes, allCatRes] = await Promise.all([
        supabase.from("categories").select("id, name, slug, image_url, parent_id").eq("slug", categorySlug).eq("is_active", true).maybeSingle(),
        supabase.from("categories").select("id, name, slug, image_url, parent_id").eq("is_active", true).order("display_order"),
      ]);

      if (!catRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const cat = catRes.data as Category;
      setCategory(cat);
      setAllCategories((allCatRes.data as Category[]) || []);

      // Sub-categories
      const subCats = (allCatRes.data as Category[])?.filter(c => c.parent_id === cat.id) || [];
      setSubCategories(subCats);

      // Products from this category AND sub-categories
      const categoryIds = [cat.id, ...subCats.map(sc => sc.id)];
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, slug, regular_price, sale_price, short_description, stock_quantity, product_images(image_url)")
        .eq("is_active", true)
        .in("category_id", categoryIds)
        .order("created_at", { ascending: false });

      const productList = (prods as unknown as Product[]) || [];
      setProducts(productList);

      setLoading(false);
    };

    fetchData();
  }, [categorySlug]);

  const filtered = useMemo(() => {
    let result = [...products];
    switch (sortBy) {
      case "price_low": result.sort((a, b) => (a.sale_price ?? a.regular_price) - (b.sale_price ?? b.regular_price)); break;
      case "price_high": result.sort((a, b) => (b.sale_price ?? b.regular_price) - (a.sale_price ?? a.regular_price)); break;
      case "newest": break; // already sorted by created_at
    }
    return result;
  }, [products, sortBy]);

  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => { setVisibleCount(PRODUCTS_PER_PAGE); }, [sortBy]);

  // Get sibling categories (same parent) for the BROWSE sidebar
  const browseCategories = useMemo(() => {
    if (!category) return [];
    // If this is a parent category, show its children + itself
    if (!category.parent_id) {
      return allCategories.filter(c => c.parent_id === category.id || c.id === category.id);
    }
    // If this is a child category, show siblings + parent
    return allCategories.filter(c => c.parent_id === category.parent_id || c.id === category.parent_id);
  }, [category, allCategories]);

  // Get top-level categories for browsing
  const topCategories = useMemo(() => {
    return allCategories.filter(c => !c.parent_id);
  }, [allCategories]);

  const scrollSlider = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };


  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar /><Header />
        <div className="container py-20 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <h2 className="text-xl font-bold text-foreground mb-2">ক্যাটাগরি পাওয়া যায়নি</h2>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/products"><ChevronLeft className="h-4 w-4 mr-1" /> সকল পণ্য দেখুন</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{category?.name || "ক্যাটাগরি"} | রাফছা স্টোর</title>
        <meta name="description" content={`রাফছা স্টোরে ${category?.name || ""} ক্যাটাগরির সকল পণ্য দেখুন।`} />
      </Helmet>
      <TopBar /><Header />

      <main>
        {/* Breadcrumb + Sort bar */}
        <div className="bg-primary/10 border-b border-border">
          <div className="container px-4 py-4 sm:py-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-foreground/60 hover:text-primary font-medium uppercase text-xs sm:text-sm">HOME</Link>
              <span className="text-foreground/40">/</span>
              <span className="font-bold text-foreground uppercase text-xs sm:text-sm">{category?.name || "..."}</span>
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
                <SelectTrigger className="w-[160px] sm:w-[180px] h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Sort by popularity</SelectItem>
                  <SelectItem value="newest">নতুন আগে</SelectItem>
                  <SelectItem value="price_low">দাম: কম → বেশি</SelectItem>
                  <SelectItem value="price_high">দাম: বেশি → কম</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>


        <div className="container px-4 py-6 md:py-8">
          <div>
            {/* Products */}
            <div>
              {/* Sub-categories slider */}
              {!loading && subCategories.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground">সাব-ক্যাটাগরি</h2>
                    <div className="hidden sm:flex gap-1">
                      <button onClick={() => scrollSlider("left")} className="p-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={() => scrollSlider("right")} className="p-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div ref={sliderRef} className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
                    {subCategories.map(sub => (
                      <Link key={sub.id} to={`/${sub.slug}`} className="group shrink-0 w-24 sm:w-32 md:w-36">
                        <div className="relative rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-primary/30">
                          <div className="aspect-square bg-secondary/30 overflow-hidden">
                            {sub.image_url ? (
                              <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground/30" /></div>
                            )}
                          </div>
                          <div className="p-2 text-center">
                            <p className="text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{sub.name}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

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
                  <p className="text-muted-foreground">এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি</p>
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                      {visibleProducts.map(p => (
                        <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} regularPrice={p.regular_price} salePrice={p.sale_price} imageUrl={p.product_images?.[0]?.image_url || null} shortDescription={p.short_description} stockQuantity={p.stock_quantity} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleProducts.map(p => (
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

                  {hasMore && (
                    <div className="text-center mt-8">
                      <Button variant="outline" size="lg" onClick={() => setVisibleCount(c => c + PRODUCTS_PER_PAGE)} className="px-8">
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
    </div>
  );
};

export default CategoryPage;