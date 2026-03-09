import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FolderOpen } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

const CategorySlider = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-6 sm:py-10 md:py-14">
      <div className="container">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground mb-4 sm:mb-6">
          ক্যাটাগরি
        </h2>
        <ScrollArea className="w-full">
          <div className="flex gap-3 sm:gap-4 pb-4">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group shrink-0 w-28 sm:w-36 md:w-44"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-secondary border border-border shadow-sm group-hover:shadow-md transition-shadow">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full brand-gradient-subtle flex items-center justify-center">
                      <FolderOpen className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-center text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </p>
              </a>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default CategorySlider;