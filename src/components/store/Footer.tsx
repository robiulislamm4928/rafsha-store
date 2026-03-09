import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail, Facebook, Youtube, Instagram } from "lucide-react";
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

  const socialLinks = [
    { key: "facebook_url", icon: Facebook, label: "Facebook" },
    { key: "youtube_url", icon: Youtube, label: "YouTube" },
    { key: "instagram_url", icon: Instagram, label: "Instagram" },
    { key: "tiktok_url", icon: null, label: "TikTok" },
    { key: "twitter_url", icon: null, label: "X / Twitter" },
  ].filter((s) => settings[s.key]);

  const displayLogo = settings.store_logo_url || logo;
  const storeName = settings.store_name || "রাফছা স্টোর";

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-8 sm:py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand */}
           <div>
             <img src={displayLogo} alt={storeName} className="h-14 sm:h-20 w-auto mb-3 sm:mb-4" />
            <p className="text-sm opacity-80 leading-relaxed">
              {settings.about || "আপনার পছন্দের পণ্য সেরা মূল্যে — সারাদেশে দ্রুত ডেলিভারি।"}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">দ্রুত লিঙ্ক</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="opacity-80 hover:opacity-100 transition-opacity">হোম</a></li>
              <li><a href="/products" className="opacity-80 hover:opacity-100 transition-opacity">সকল পণ্য</a></li>
              <li><a href="/about" className="opacity-80 hover:opacity-100 transition-opacity">About Us</a></li>
              <li><a href="/track-order" className="opacity-80 hover:opacity-100 transition-opacity">অর্ডার ট্র্যাক</a></li>
              <li><a href="/return-policy" className="opacity-80 hover:opacity-100 transition-opacity">রিটার্ন পলিসি</a></li>
              <li><a href="/terms" className="opacity-80 hover:opacity-100 transition-opacity">শর্তাবলী</a></li>
              <li><a href="/privacy" className="opacity-80 hover:opacity-100 transition-opacity">প্রাইভেসি পলিসি</a></li>
            </ul>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">সোশ্যাল মিডিয়া</h4>
                <div className="flex gap-3">
                  {socialLinks.map((s) => (
                    <a key={s.key} href={settings[s.key]} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                      title={s.label}>
                      {s.icon ? <s.icon className="h-4 w-4" /> : <span className="text-xs font-bold">{s.label[0]}</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}
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
        <div className="container py-4 text-center text-[10px] sm:text-xs opacity-60 px-4">
          © Copyright {new Date().getFullYear()} <strong>{storeName}</strong>
          <span className="hidden sm:inline"> | </span>
          <br className="sm:hidden" />
          Developed by{" "}
          <a href="https://digiinvention.com/" target="_blank" rel="noopener noreferrer">
            <strong>DiGi Invention Agency</strong>
          </a>
          .
        </div>
      </div>
    </footer>
  );
};

export default Footer;
