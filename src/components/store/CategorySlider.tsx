import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FolderOpen } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

const ImageWithSkeleton = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && <div className="absolute inset-0 bg-muted animate-pulse rounded-xl" />}
      <img src={src} alt={alt} className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`} onLoad={() => setLoaded(true)} loading="lazy" />
    </div>
  );
};

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
        <div className="sm:hidden">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground border-b border-border pb-2 mb-3">
            ক্যাটাগরি
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/${cat.slug}`}
                className="group shrink-0 w-32"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-secondary shadow-sm">
                  {cat.image_url ? (
                    <ImageWithSkeleton src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <FolderOpen className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-center text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                  {cat.name}
                </p>
              </a>
            ))}
          </div>
        </div>

        <div className="hidden sm:block">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground mb-4 sm:mb-6">
            ক্যাটাগরি
          </h2>
          <ScrollArea className="w-full">
            <div className="flex gap-3 sm:gap-4 pb-4">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/${cat.slug}`}
                  className="group shrink-0 w-28 sm:w-36 md:w-44"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-secondary shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 gradient-border-hover" style={{ perspective: "600px" }}>
                    <div className="w-full h-full transition-transform duration-300 group-hover:[transform:rotateY(5deg)_rotateX(3deg)]">
                      {cat.image_url ? (
                        <ImageWithSkeleton src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full brand-gradient-subtle flex items-center justify-center">
                          <FolderOpen className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
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
      </div>
    </section>
  );
};

export default CategorySlider;
