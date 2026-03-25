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
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    supabase
      .from("banners")
      .select("id, heading, subtext, cta_label, cta_link, desktop_image_url")
      .eq("type", "hero")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data && data.length > 0) setBanners(data);
        setLoading(false);
      });
  }, []);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setParallaxY(window.scrollY * 0.3);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { if (diff > 0) goNext(); else goPrev(); }
  };

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-secondary">
        <div className="w-full aspect-[16/6] sm:aspect-[16/5] skeleton-shimmer" />
      </section>
    );
  }

  const slide = banners[current];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`transition-all duration-500 ease-in-out ${
          isAnimating
            ? direction === "right" ? "opacity-0 -translate-x-4" : "opacity-0 translate-x-4"
            : "opacity-100 translate-x-0"
        }`}
      >
        <img
          src={slide?.desktop_image_url || heroFallback}
          alt={slide?.heading || "Hero Banner"}
          className="w-full h-auto object-cover"
          style={{ transform: `translateY(${parallaxY}px)`, willChange: "transform" }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />

      <div className="absolute inset-0 container flex items-end sm:items-center pb-6 sm:pb-0">
        <div className={`max-w-xl text-primary-foreground space-y-2 sm:space-y-3 md:space-y-4 px-1 stagger-children ${isAnimating ? "opacity-0" : ""}`}>
          {slide?.heading && (
            <h2 className="text-lg sm:text-3xl md:text-5xl font-display font-bold leading-tight" style={{ animationDelay: "0.1s" }}>
              {slide.heading}
            </h2>
          )}
          {slide?.subtext && (
            <p className="text-xs sm:text-base md:text-lg opacity-90 leading-relaxed line-clamp-2 sm:line-clamp-none" style={{ animationDelay: "0.3s" }}>
              {slide.subtext}
            </p>
          )}
          {slide?.cta_label && slide?.cta_link && (
            <div style={{ animationDelay: "0.5s" }}>
              <Button
                size="default"
                className="bg-accent text-accent-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base h-8 sm:h-10 md:h-11 px-4 sm:px-6 animate-glow"
                asChild
              >
                <a href={slide.cta_link}>{slide.cta_label}</a>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Slide indicators */}
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
    </section>
  );
};

export default HeroBanner;
