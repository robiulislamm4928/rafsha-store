import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import heroFallback from "@/assets/hero-honey.jpg";

interface Banner {
  id: string;
  heading: string | null;
  subtext: string | null;
  cta_label: string | null;
  cta_link: string | null;
  desktop_image_url: string;
}

const HeroBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    supabase
      .from("banners")
      .select("id, heading, subtext, cta_label, cta_link, desktop_image_url")
      .eq("type", "hero")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data && data.length > 0) setBanners(data);
      });
  }, []);

  const goTo = useCallback((next: number, dir: "left" | "right") => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(next);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  }, [isAnimating]);

  const goNext = useCallback(() => {
    if (banners.length <= 1) return;
    goTo((current + 1) % banners.length, "right");
  }, [banners.length, current, goTo]);

  const goPrev = useCallback(() => {
    if (banners.length <= 1) return;
    goTo((current - 1 + banners.length) % banners.length, "left");
  }, [banners.length, current, goTo]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [banners.length, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const slide = banners[current];

  return (
    <section
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`transition-all duration-500 ease-in-out ${
          isAnimating
            ? direction === "right"
              ? "opacity-0 -translate-x-4"
              : "opacity-0 translate-x-4"
            : "opacity-100 translate-x-0"
        }`}
      >
        <img
          src={slide?.desktop_image_url || heroFallback}
          alt={slide?.heading || "Hero Banner"}
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />

      <div className="absolute inset-0 container flex items-center">
        <div
          className={`max-w-xl text-primary-foreground space-y-3 md:space-y-4 px-1 transition-all duration-500 ease-in-out ${
            isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          {slide?.heading && (
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold leading-tight">
              {slide.heading}
            </h2>
          )}
          {slide?.subtext && (
            <p className="text-sm sm:text-base md:text-lg opacity-90 leading-relaxed">
              {slide.subtext}
            </p>
          )}
          {slide?.cta_label && slide?.cta_link && (
            <Button
              size="lg"
              className="bg-accent text-accent-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity text-sm md:text-base"
              asChild
            >
              <a href={slide.cta_link}>{slide.cta_label}</a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
