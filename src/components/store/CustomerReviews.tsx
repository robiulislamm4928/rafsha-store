import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageCircle, Globe, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_location: string | null;
  rating: number;
  review_text: string | null;
  reviewer_image_url: string | null;
  social_link: string | null;
  social_platform: string | null;
  user_id: string | null;
  review_image_url: string | null;
}

const platformIcons: Record<string, string> = {
  facebook: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg",
  instagram: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg",
  youtube: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg",
  tiktok: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg",
  twitter: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg",
};

const CustomerReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("id, reviewer_name, reviewer_location, rating, review_text, reviewer_image_url, social_link, social_platform, user_id, review_image_url")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (data) setReviews(data as Review[]);
      });
  }, []);

  return (
    <section className="py-10 md:py-14 brand-gradient-subtle">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center justify-center gap-2">
            <MessageCircle className="h-6 w-6 text-accent" />
            গ্রাহকদের মতামত
          </h2>
          <p className="text-muted-foreground mt-2">আমাদের সন্তুষ্ট গ্রাহকরা যা বলছেন</p>
        </div>

        {reviews.length > 0 ? (
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {reviews.map((r) => (
                <CarouselItem key={r.id} className="pl-3 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="bg-card rounded-xl border border-border p-5 shadow-sm h-full flex flex-col relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20">
                    {/* Social icon - top right */}
                    <div className="absolute top-3 right-3">
                      {r.user_id && !r.social_link ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : r.social_link ? (
                        <a
                          href={r.social_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          {r.social_platform && platformIcons[r.social_platform] ? (
                            <img
                              src={platformIcons[r.social_platform]}
                              alt={r.social_platform}
                              className="h-4 w-4 opacity-60 hover:opacity-100 transition-opacity dark:invert"
                            />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                        </a>
                      ) : null}
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < r.rating ? "text-accent fill-accent" : "text-border"}`}
                        />
                      ))}
                    </div>

                    {/* Review text */}
                    {r.review_text && (
                      <p className="text-sm text-foreground/80 mb-4 flex-1 line-clamp-4">
                        "{r.review_text}"
                      </p>
                    )}

                    {/* Reviewer info */}
                    <div className="border-t border-border pt-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={r.reviewer_image_url || undefined} alt={r.reviewer_name} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                          {r.reviewer_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-foreground leading-tight">
                          {r.reviewer_name}
                        </p>
                        {r.reviewer_location && (
                          <p className="text-xs text-muted-foreground">{r.reviewer_location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <p className="text-center text-muted-foreground py-6">শীঘ্রই রিভিউ আসছে...</p>
        )}
      </div>
    </section>
  );
};

export default CustomerReviews;
