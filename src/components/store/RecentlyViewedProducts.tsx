import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Link } from "react-router-dom";
import { Clock, ImageOff } from "lucide-react";

const RecentlyViewedProducts = () => {
  const { items } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <section className="py-8 md:py-10">
      <div className="container">
        <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          সম্প্রতি দেখা পণ্য
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {items.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              className="shrink-0 w-32 sm:w-36 bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="aspect-square bg-secondary overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageOff className="h-8 w-8 text-muted-foreground/20" /></div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">{p.name}</p>
                <p className="text-xs font-bold text-primary mt-1">৳{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedProducts;
