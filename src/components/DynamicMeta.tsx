import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DynamicMeta = () => {
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["store_name", "store_logo_url"]);

      if (!data) return;

      const map: Record<string, string> = {};
      data.forEach((s) => (map[s.key] = s.value));

      if (map.store_name) {
        document.title = map.store_name;
        // Update OG/Twitter titles too
        document.querySelector('meta[property="og:title"]')?.setAttribute("content", map.store_name);
        document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", map.store_name);
      }

      if (map.store_logo_url) {
        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = map.store_logo_url;
        link.type = "image/png";
      }
    };

    fetchSettings();
  }, []);

  return null;
};

export default DynamicMeta;
