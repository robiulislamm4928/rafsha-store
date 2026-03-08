import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { Package, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  category_id: string | null;
  product_images: { image_url: string }[];
}

const Products = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, slug, image_url")
          .eq("is_active", true)
          .order("display_order"),
        supabase
          .from("products")
          .select("id, name, slug, regular_price, sale_price, short_description, category_id, product_images(image_url)")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (prodRes.data) setProducts(prodRes.data as unknown as Product[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  const handleCategoryClick = (catId: string | null) => {
    setSelectedCategory(catId);
    setMobileFilterOpen(false);
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
          <div className="container px-4 py-6 md:py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                  <Package className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  সকল পণ্য
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filtered.length}টি পণ্য পাওয়া গেছে
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <X className="h-3 w-3" /> ফিল্টার সরান
                    </button>
                  )}
                </p>
              </div>

              {/* Mobile filter toggle */}
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              >
                <Filter className="h-4 w-4 mr-1.5" />
                ক্যাটাগরি
              </Button>
            </div>
          </div>
        </div>

        <div className="container px-4 py-6 md:py-8">
          <div className="flex gap-6 md:gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-56 lg:w-64 shrink-0">
              <div className="sticky top-20 bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm">ক্যাটাগরি</h3>
                <CategorySidebar />
              </div>
            </aside>

            {/* Mobile Category Drawer */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
                <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl border-t border-border p-5 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">ক্যাটাগরি বেছে নিন</h3>
                    <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg hover:bg-secondary">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
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
                  <p className="text-muted-foreground">এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSelectedCategory(null)}
                  >
                    সকল পণ্য দেখুন
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
