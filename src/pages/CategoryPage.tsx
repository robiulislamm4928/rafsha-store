import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { Package, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  product_images: { image_url: string }[];
}

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!categorySlug) return;
    setLoading(true);
    setNotFound(false);

    const fetchData = async () => {
      const { data: cat } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("slug", categorySlug)
        .eq("is_active", true)
        .maybeSingle();

      if (!cat) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCategory(cat);

      const { data: prods } = await supabase
        .from("products")
        .select("id, name, slug, regular_price, sale_price, short_description, stock_quantity, product_images(image_url)")
        .eq("is_active", true)
        .eq("category_id", cat.id)
        .order("created_at", { ascending: false });

      setProducts((prods as unknown as Product[]) || []);
      setLoading(false);
    };

    fetchData();
  }, [categorySlug]);

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
        <div className="bg-primary/5 border-b border-border">
          <div className="container px-4 py-5 sm:py-6 md:py-8">
            <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
              <ChevronLeft className="h-4 w-4 mr-0.5" /> সকল পণ্য
            </Link>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary" />
              {loading ? "লোড হচ্ছে..." : category?.name}
            </h1>
            {!loading && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{products.length}টি পণ্য পাওয়া গেছে</p>
            )}
          </div>
        </div>

        <div className="container px-4 py-4 sm:py-6 md:py-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border animate-pulse">
                  <div className="aspect-square bg-secondary rounded-t-xl" />
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                    <div className="h-8 bg-secondary rounded mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি</p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/products">সকল পণ্য দেখুন</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.map((p) => (
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
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;