import { useEffect } from "react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const DynamicMeta = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings.store_name) {
      document.title = settings.store_name;
      document.querySelector('meta[property="og:title"]')?.setAttribute("content", settings.store_name);
      document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", settings.store_name);
    }

    if (settings.store_logo_url) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.store_logo_url;
      link.type = "image/png";
    }
  }, [settings]);

  return null;
};

export default DynamicMeta;
