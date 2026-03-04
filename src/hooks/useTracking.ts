import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await supabase.functions.invoke("track-event", {
          body: {
            page_path: location.pathname,
            event_type: "page_view",
            referrer: document.referrer || null,
            user_agent: navigator.userAgent || null,
          },
        });
      } catch (e) {
        // Silent fail — tracking should never break the app
      }
    };

    trackPageView();
  }, [location.pathname]);
};
