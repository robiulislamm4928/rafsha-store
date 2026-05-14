import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const TopBar = () => {
  const [announcements, setAnnouncements] = useState<{ id: string; text: string }[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return null;
  if (announcements.length === 0) return null;

  const isSingle = announcements.length === 1;

  return (
    <div className="sticky top-0 z-[60] bg-primary text-primary-foreground h-8 sm:h-9 flex items-center overflow-hidden text-base sm:text-lg">
      <div className="marquee whitespace-nowrap font-normal tracking-wide">
        {announcements.map((a) => a.text).join("   •   ")}
        {"   •   "}
        {announcements.map((a) => a.text).join("   •   ")}
      </div>
    </div>
  );
};

export default TopBar;
