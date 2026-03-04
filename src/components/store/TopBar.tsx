import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Megaphone } from "lucide-react";

const TopBar = () => {
  const [announcements, setAnnouncements] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, text")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data && data.length > 0) setAnnouncements(data);
      });
  }, []);

  const marqueeText = announcements.map((a) => a.text).join("   •   ");

  return (
    <div className="brand-gradient text-primary-foreground py-1.5 text-sm overflow-hidden relative">
      <div className="container flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 shrink-0 z-10">
          <Phone className="h-3.5 w-3.5" />
          <span className="font-medium">০১XXXXXXXXX</span>
        </div>

        <div className="flex-1 overflow-hidden mx-4">
          {announcements.length > 0 ? (
            <div className="marquee whitespace-nowrap">
              <span>{marqueeText}   •   {marqueeText}</span>
            </div>
          ) : (
            <p className="text-center text-xs flex items-center justify-center gap-1.5">
              <Megaphone className="h-3.5 w-3.5" />
              রাফছা স্টোরে স্বাগতম — সেরা পণ্য সেরা দামে!
            </p>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0 z-10">
          <a href="#" className="hover:opacity-80 transition-opacity text-xs">Facebook</a>
          <a href="#" className="hover:opacity-80 transition-opacity text-xs">Instagram</a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;