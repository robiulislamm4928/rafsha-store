import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import { FileText, Folder, Package } from "lucide-react";

interface SitemapItem { name: string; url: string; }

const Sitemap = () => {
  const [categories, setCategories] = useState<SitemapItem[]>([]);
  const [products, setProducts] = useState<SitemapItem[]>([]);

  useEffect(() => {
    supabase.from("categories").select("name, slug").eq("is_active", true).order("display_order").then(({ data }) => {
      setCategories((data || []).map((c: any) => ({ name: c.name, url: `/${c.slug}` })));
    });
    supabase.from("products").select("name, slug").eq("is_active", true).order("name").limit(500).then(({ data }) => {
      setProducts((data || []).map((p: any) => ({ name: p.name, url: `/product/${p.slug}` })));
    });
  }, []);

  const staticPages: SitemapItem[] = [
    { name: "হোম", url: "/" },
    { name: "সকল পণ্য", url: "/products" },
    { name: "About Us", url: "/about" },
    { name: "অর্ডার ট্র্যাক", url: "/track-order" },
    { name: "রিটার্ন পলিসি", url: "/return-policy" },
    { name: "শর্তাবলী", url: "/terms" },
    { name: "প্রাইভেসি পলিসি", url: "/privacy" },
    { name: "সাধারণ জিজ্ঞাসা", url: "/faq" },
    { name: "ইনস্টল", url: "/install" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar /><Header />
      <main className="container py-8 max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">সাইটম্যাপ</h1>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3"><FileText className="h-5 w-5 text-primary" /> পেজসমূহ</h2>
          <ul className="space-y-1 pl-2">
            {staticPages.map((p) => (
              <li key={p.url}><Link to={p.url} className="text-sm text-primary hover:underline">{p.name}</Link></li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3"><Folder className="h-5 w-5 text-primary" /> ক্যাটাগরি</h2>
          <ul className="space-y-1 pl-2">
            {categories.map((c) => (
              <li key={c.url}><Link to={c.url} className="text-sm text-primary hover:underline">{c.name}</Link></li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3"><Package className="h-5 w-5 text-primary" /> পণ্যসমূহ ({products.length})</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-2">
            {products.map((p) => (
              <li key={p.url}><Link to={p.url} className="text-sm text-primary hover:underline">{p.name}</Link></li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Sitemap;
