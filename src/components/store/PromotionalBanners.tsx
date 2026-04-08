import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  heading: string | null;
  subtext: string | null;
  cta_label: string | null;
  cta_link: string | null;
  desktop_image_url: string;
  mobile_image_url: string | null;
}

const PromotionalBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [imgLoaded, setImgLoaded] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    supabase
      .from("banners")
      .select("id, heading, subtext, cta_label, cta_link, desktop_image_url, mobile_image_url")
      .eq("type", "promotional")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data) setBanners(data);
      });
  }, []);

  const goTo = useCallback((next: number, dir: "left" | "right") => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(next);
      setImgLoaded(false);
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

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [banners.length, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { if (diff > 0) goNext(); else goPrev(); }
  };

  if (banners.length === 0) return null;

  const slide = banners[current];

  return (
    <section className="py-6 sm:py-10 md:py-14">
      <div className="container">
        <div
          className="relative rounded-xl overflow-hidden shadow-sm"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide image */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              isAnimating
                ? direction === "right" ? "opacity-0 -translate-x-4" : "opacity-0 translate-x-4"
                : "opacity-100 translate-x-0"
            }`}
          >
            {!imgLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse rounded-xl" />
            )}
            <img
              src={slide.desktop_image_url}
              alt={slide.heading || "Promotional Banner"}
              className={`w-full h-48 sm:h-56 md:h-72 lg:h-80 object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              key={slide.id}
            />
          </div>

          {/* Overlay & content */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
          <div className={`absolute inset-0 flex items-center px-6 sm:px-10 md:px-14 transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
            <div className="max-w-lg text-primary-foreground space-y-2 sm:space-y-3">
              {slide.heading && (
                <h3 className="text-lg sm:text-2xl md:text-3xl font-display font-bold leading-tight">
                  {slide.heading}
                </h3>
              )}
              {slide.subtext && (
                <p className="text-xs sm:text-sm md:text-base opacity-90 leading-relaxed line-clamp-2">
                  {slide.subtext}
                </p>
              )}
              <div>
                <Button
                  size="default"
                  className="bg-accent text-accent-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base h-8 sm:h-10 md:h-11 px-4 sm:px-6"
                  asChild
                >
                  <a href={slide.cta_link || "/products"}>
                    {slide.cta_label || "এখনই কিনুন"}
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-background/50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-background/50 transition-colors"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? "right" : "left")}
                  className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-accent" : "w-2 bg-primary-foreground/50 hover:bg-primary-foreground/70"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanners;
