import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Sparkles } from "lucide-react";

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

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, slug, regular_price, sale_price, short_description, stock_quantity, product_images(image_url)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) setProducts(data as unknown as Product[]);
      });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-6 sm:py-10 md:py-14 brand-gradient-subtle">
      <div className="container">
        <div className="text-center mb-5 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            বিশেষ পণ্যসমূহ
          </h2>
          <p className="text-muted-foreground mt-1.5 sm:mt-2 text-xs sm:text-base">আমাদের সবচেয়ে জনপ্রিয় পণ্য কালেকশন</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;