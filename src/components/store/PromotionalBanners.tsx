import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  heading: string | null;
  subtext: string | null;
  cta_label: string | null;
  cta_link: string | null;
  desktop_image_url: string;
}

const PromotionalBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    supabase
      .from("banners")
      .select("id, heading, subtext, cta_label, cta_link, desktop_image_url")
      .eq("type", "promotional")
      .eq("is_active", true)
      .order("display_order")
      .limit(2)
      .then(({ data }) => {
        if (data) setBanners(data);
      });
  }, []);

  if (banners.length === 0) return null;

  return (
    <section className="py-6 sm:py-10 md:py-14">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative rounded-xl overflow-hidden h-48 md:h-56 shadow-sm"
            >
              <img
                src={banner.desktop_image_url}
                alt={banner.heading || "Promo"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-primary-foreground">
                {banner.heading && <h3 className="font-display font-bold text-lg">{banner.heading}</h3>}
                {banner.subtext && <p className="text-sm opacity-90 mt-1">{banner.subtext}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanners;
