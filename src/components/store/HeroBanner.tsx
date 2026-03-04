import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroFallback from "@/assets/hero-honey.jpg";

interface Banner {
  id: string;
  heading: string | null;
  subtext: string | null;
  cta_label: string | null;
  cta_link: string | null;
  desktop_image_url: string;
  mobile_image_url: string | null;
}

const HeroBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase
      .from("banners")
      .select("id, heading, subtext, cta_label, cta_link, desktop_image_url, mobile_image_url")
      .eq("type", "hero")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data && data.length > 0) setBanners(data);
      });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const slide = banners[current];

  return (
    <section className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${slide?.desktop_image_url || heroFallback})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container h-full flex items-center">
        <div className="max-w-xl text-primary-foreground space-y-4 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
            {slide?.heading || "সেরা পণ্য সেরা দামে"}
          </h2>
          <p className="text-base md:text-lg opacity-90 leading-relaxed">
            {slide?.subtext || "রাফছা স্টোরে পাচ্ছেন মানসম্মত পণ্য, দ্রুত ডেলিভারি এবং সেরা কাস্টমার সার্ভিস।"}
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity"
            asChild
          >
            <a href={slide?.cta_link || "/products"}>
              {slide?.cta_label || "এখনই কিনুন"}
            </a>
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/30 backdrop-blur-sm text-primary-foreground hover:bg-card/50 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/30 backdrop-blur-sm text-primary-foreground hover:bg-card/50 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === current ? "bg-accent w-7" : "bg-primary-foreground/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroBanner;