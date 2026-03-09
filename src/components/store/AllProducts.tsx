import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Package } from "lucide-react";

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

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, slug, regular_price, sale_price, short_description, product_images(image_url)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (data) setProducts(data as unknown as Product[]);
      });
  }, []);

  return (
    <section id="all-products" className="py-10 md:py-14">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center justify-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            সকল পণ্য
          </h2>
          <p className="text-muted-foreground mt-2">আমাদের সম্পূর্ণ পণ্য কালেকশন ব্রাউজ করুন</p>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
        ) : (
          <p className="text-center text-muted-foreground py-10">শীঘ্রই পণ্য যোগ করা হবে...</p>
        )}
      </div>
    </section>
  );
};

export default AllProducts;