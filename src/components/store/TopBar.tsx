import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const TopBar = () => {
  const [announcements, setAnnouncements] = useState<{ id: string; text: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState<number>(35);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, text")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data && data.length > 0) setAnnouncements(data);
        setLoading(false);
      });
  }, []);

  // Keep marquee speed constant (pixels per second) regardless of text length
  useEffect(() => {
    if (!marqueeRef.current || announcements.length === 0) return;
    const PIXELS_PER_SECOND = 35; // constant scroll speed (lower = slower)
    const calc = () => {
      const el = marqueeRef.current;
      if (!el) return;
      // half width because content is duplicated; marquee animates -50%
      const halfWidth = el.scrollWidth / 2;
      if (halfWidth > 0) setDuration(halfWidth / PIXELS_PER_SECOND);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [announcements]);

  if (loading) return null;
  if (announcements.length === 0) return null;

  return (
    <div className="sticky top-0 z-40 bg-primary text-primary-foreground h-8 sm:h-9 flex items-center overflow-hidden text-base sm:text-lg">
      <div
        ref={marqueeRef}
        className="marquee whitespace-nowrap font-normal tracking-wide"
        style={{ animationDuration: `${duration}s` }}
      >
        {announcements.map((a) => a.text).join("   •   ")}
        {"   •   "}
        {announcements.map((a) => a.text).join("   •   ")}
      </div>
    </div>
  );
};

export default TopBar;
