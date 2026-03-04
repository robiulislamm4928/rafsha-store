import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((s) => (map[s.key] = s.value));
          setSettings(map);
        }
      });
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <img src={logo} alt="রাফছা স্টোর" className="h-14 w-auto mb-4 brightness-0 invert" />
            <p className="text-sm opacity-80 leading-relaxed">
              {settings.about || "আপনার পছন্দের পণ্য সেরা মূল্যে — সারাদেশে দ্রুত ডেলিভারি।"}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">দ্রুত লিঙ্ক</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="opacity-80 hover:opacity-100 transition-opacity">পণ্যসমূহ</a></li>
              <li><a href="/categories" className="opacity-80 hover:opacity-100 transition-opacity">ক্যাটাগরি</a></li>
              <li><a href="/track-order" className="opacity-80 hover:opacity-100 transition-opacity">অর্ডার ট্র্যাক</a></li>
              <li><a href="/about" className="opacity-80 hover:opacity-100 transition-opacity">আমাদের সম্পর্কে</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm">
              {settings.phone && (
                <li className="flex items-center gap-2 opacity-80">
                  <Phone className="h-4 w-4 shrink-0" />
                  {settings.phone}
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2 opacity-80">
                  <Mail className="h-4 w-4 shrink-0" />
                  {settings.email}
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2 opacity-80">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  {settings.address}
                </li>
              )}
              {!settings.phone && !settings.email && (
                <li className="flex items-center gap-2 opacity-80">
                  <Phone className="h-4 w-4" />
                  ০১XXXXXXXXX
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-4 text-center text-xs opacity-60">
          © {new Date().getFullYear()} রাফছা স্টোর। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
};

export default Footer;