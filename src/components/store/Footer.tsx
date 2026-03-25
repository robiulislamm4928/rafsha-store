import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { MapPin, Facebook, Youtube, Instagram, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");

  const socialLinks = [
    { key: "facebook_url", icon: Facebook, label: "Facebook", hoverColor: "hover:bg-[#1877F2] hover:text-white" },
    { key: "youtube_url", icon: Youtube, label: "YouTube", hoverColor: "hover:bg-[#FF0000] hover:text-white" },
    { key: "instagram_url", icon: Instagram, label: "Instagram", hoverColor: "hover:bg-[#E4405F] hover:text-white" },
    { key: "tiktok_url", icon: null, label: "TikTok", hoverColor: "hover:bg-[#000000] hover:text-white" },
    { key: "twitter_url", icon: null, label: "X / Twitter", hoverColor: "hover:bg-[#1DA1F2] hover:text-white" },
  ].filter((s) => settings[s.key]);

  const displayLogo = settings.store_logo_url || logo;
  const storeName = settings.store_name || "রাফছা স্টোর";

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("নিউজলেটারে সাবস্ক্রাইব করেছেন!");
    setEmail("");
  };

  return (
    <footer className="bg-primary text-primary-foreground relative wave-divider mt-10">
      <div className="container px-4 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <div className="bg-white rounded-xl p-4 inline-block mb-3 sm:mb-4 mx-auto sm:mx-0">
              <img src={displayLogo} alt={storeName} className="h-28 sm:h-32 md:h-40 w-auto" />
            </div>
            <p className="text-sm opacity-80 leading-relaxed max-w-xs mx-auto sm:mx-0">
              {settings.about || "আপনার পছন্দের পণ্য সেরা মূল্যে — সারাদেশে দ্রুত ডেলিভারি।"}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">দ্রুত লিঙ্ক</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/", label: "হোম" },
                { href: "/products", label: "সকল পণ্য" },
                { href: "/about", label: "About Us" },
                { href: "/return-policy", label: "রিটার্ন পলিসি" },
                { href: "/terms", label: "শর্তাবলী" },
                { href: "/privacy", label: "প্রাইভেসি পলিসি" },
                { href: "/faq", label: "সাধারণ জিজ্ঞাসা" },
                { href: "/sitemap", label: "সাইটম্যাপ" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="opacity-80 hover:opacity-100 hover:translate-x-1 transition-all duration-200 inline-block">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm">
              {settings.address && (
                <li className="flex items-start gap-2 opacity-80">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  {settings.address}
                </li>
              )}
            </ul>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">সোশ্যাল মিডিয়া</h4>
                <div className="flex gap-3">
                  {socialLinks.map((s) => (
                    <a key={s.key} href={settings[s.key]} target="_blank" rel="noopener noreferrer"
                      className={`w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center transition-all duration-300 ${s.hoverColor} hover:scale-110`}
                      title={s.label}>
                      {s.icon ? <s.icon className="h-4 w-4" /> : <span className="text-xs font-bold">{s.label[0]}</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">নিউজলেটার</h4>
            <p className="text-sm opacity-80 mb-4">নতুন পণ্য ও অফারের আপডেট পেতে সাবস্ক্রাইব করুন</p>
            <form onSubmit={handleNewsletter} className="flex gap-2 pb-16 sm:pb-0">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm h-11"
              />
              <Button type="submit" size="icon" variant="secondary" className="shrink-0 h-11 w-11">
                <Send className="h-4 w-4" />
              </Button>
            </form>
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
