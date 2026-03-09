import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price: number | null;
  short_description: string | null;
  product_images: { image_url: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

interface CategoryWithProducts extends Category {
  products: Product[];
}

const CategoryProducts = () => {
  const [data, setData] = useState<CategoryWithProducts[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: categories }, { data: products }] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, slug, display_order")
          .eq("is_active", true)
          .order("display_order"),
        supabase
          .from("products")
          .select("id, name, slug, regular_price, sale_price, short_description, category_id, product_images(image_url)")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);

      if (!categories || !products) return;

      const grouped: CategoryWithProducts[] = categories
        .map((cat) => ({
          ...cat,
          products: (products as any[]).filter((p) => p.category_id === cat.id) as Product[],
        }))
        .filter((cat) => cat.products.length > 0);

      setData(grouped);
    };
    load();
  }, []);

  if (data.length === 0) return null;

  return (
    <>
      {data.map((cat) => (
        <section key={cat.id} className="py-8 md:py-12">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
                {cat.name}
              </h2>
              <a
                href={`/${cat.slug}`}
                className="text-sm text-primary hover:underline font-medium"
              >
                সবগুলো দেখুন →
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {cat.products.slice(0, 8).map((p) => (
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
      ))}
    </>
  );
};

export default CategoryProducts;
