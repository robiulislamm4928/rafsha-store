import { useEffect, useState } from "react";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Mail, MapPin, Truck, ShieldCheck, HeartHandshake, Clock } from "lucide-react";

const About = () => {
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

  const storeName = settings.store_name || "রাফছা স্টোর";

  const features = [
    {
      icon: ShieldCheck,
      title: "গুণমান নিশ্চিত",
      desc: "সকল পণ্য সযত্নে নির্বাচিত এবং পরীক্ষিত। আমরা শুধুমাত্র ১০০% অথেনটিক পণ্য বিক্রি করি।",
    },
    {
      icon: Truck,
      title: "দ্রুত ডেলিভারি",
      desc: "সারাদেশে নির্ভরযোগ্য ও দ্রুত ডেলিভারি সেবা। ঢাকার ভেতরে ১-২ দিন, ঢাকার বাইরে ২-৪ দিন।",
    },
    {
      icon: HeartHandshake,
      title: "মানি-ব্যাক গ্যারান্টি",
      desc: "পণ্যে সমস্যা থাকলে সম্পূর্ণ টাকা ফেরতের গ্যারান্টি। আমরা আপনার সন্তুষ্টিকে সর্বোচ্চ প্রাধান্য দিই।",
    },
    {
      icon: Clock,
      title: "২৪/৭ কাস্টমার সাপোর্ট",
      desc: "সর্বদা আপনার সেবায় নিয়োজিত কাস্টমার টিম। যেকোনো সমস্যায় আমরা আছি আপনার পাশে।",
    },
  ];

  return (
    <>
      <Helmet>
        <title>আমাদের সম্পর্কে | {storeName}</title>
        <meta name="description" content={`${storeName} — আপনার পছন্দের পণ্যের জন্য বিশ্বস্ত অনলাইন মার্কেটপ্লেস। গুণমান নিশ্চিত, দ্রুত ডেলিভারি।`} />
      </Helmet>
      <TopBar />
      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-primary text-primary-foreground py-12 md:py-20">
          <div className="container px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">{storeName} সম্পর্কে</h1>
            <p className="text-base sm:text-lg opacity-90 max-w-2xl">
              {settings.about || "আপনার পছন্দের পণ্য সেরা মূল্যে — সারাদেশে দ্রুত ডেলিভারি।"}
            </p>
          </div>
        </div>

        <div className="container px-4 py-10 md:py-16 space-y-12 md:space-y-16">
          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-6 md:p-8 bg-secondary/40 rounded-xl border border-border">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">আমাদের মিশন</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                আমরা বিশ্বাস করি যে গুণমানের পণ্য এবং নির্ভরযোগ্য সেবা সবার জন্য সহজলভ্য হওয়া উচিত। {storeName} প্রতিষ্ঠা করা হয়েছে আপনার কেনাকাটার অভিজ্ঞতা আরও সহজ এবং আনন্দদায়ক করার জন্য। আমরা সর্বদা আপনাকে সেরা পণ্য, সেরা মূল্যে পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।
              </p>
            </div>
            <div className="p-6 md:p-8 bg-secondary/40 rounded-xl border border-border">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">আমাদের দৃষ্টিভঙ্গি</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                আমরা সারাদেশে সেরা মূল্যে সর্বোত্তম মানের পণ্য সরবরাহ করতে প্রতিশ্রুতিবদ্ধ। দ্রুত ডেলিভারি, নিরাপদ পেমেন্ট এবং চমৎকার কাস্টমার সাপোর্ট — এই তিনটি স্তম্ভের উপর দাঁড়িয়ে আমরা বাংলাদেশের অন্যতম বিশ্বস্ত অনলাইন শপ হিসেবে নিজেদের প্রতিষ্ঠিত করতে চাই।
              </p>
            </div>
          </div>

          {/* Why Choose Us */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">কেন আমাদের বেছে নেবেন?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4 p-5 md:p-6 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                  <div className="shrink-0 w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Info */}
          <section className="bg-primary/5 border border-primary/15 rounded-xl p-6 md:p-10">
            <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6">আমাদের সাথে যোগাযোগ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 md:gap-6 max-w-md mx-auto">
              <div className="flex flex-col items-center text-center gap-2 p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">ঠিকানা</p>
                <p className="text-xs text-muted-foreground">{settings.address || "বাংলাদেশ"}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default About;
