import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_location: string | null;
  rating: number;
  review_text: string | null;
}

const CustomerReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("id, reviewer_name, reviewer_location, rating, review_text")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setReviews(data);
      });
  }, []);

  return (
    <section className="py-10 md:py-14 honey-gradient-subtle">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            💬 গ্রাহকদের মতামত
          </h2>
          <p className="text-muted-foreground mt-2">আমাদের সন্তুষ্ট গ্রাহকরা যা বলছেন</p>
        </div>

        {reviews.length > 0 ? (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="shrink-0 w-72 md:w-80 bg-card rounded-xl border border-border p-5 shadow-sm"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < r.rating ? "text-honey-gold fill-honey-gold" : "text-border"}`}
                      />
                    ))}
                  </div>
                  {r.review_text && (
                    <p className="text-sm text-foreground/80 mb-3 line-clamp-3">"{r.review_text}"</p>
                  )}
                  <div className="border-t border-border pt-3">
                    <p className="font-semibold text-sm text-foreground">{r.reviewer_name}</p>
                    {r.reviewer_location && (
                      <p className="text-xs text-muted-foreground">{r.reviewer_location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground py-6">শীঘ্রই রিভিউ আসছে...</p>
        )}
      </div>
    </section>
  );
};

export default CustomerReviews;
