import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Minus, Plus, Star, ChevronLeft, ChevronRight, MessageSquare, ImageOff, AlertTriangle, Zap, Package, Share2, Copy, Check, Heart, Shield, Truck, RotateCcw, X } from "lucide-react";
import { z } from "zod";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import RecentlyViewedProducts from "@/components/store/RecentlyViewedProducts";
import ImageZoom from "@/components/store/ImageZoom";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

// --- WhatsApp & Social Share (same as before, kept compact) ---
const WhatsAppOrderButton = ({ product, variant, quantity, finalPrice }: { product: { name: string }; variant?: { variant_label: string } | null; quantity: number; finalPrice: number }) => {
  const { settings } = useSiteSettings();
  const phone = settings.whatsapp_number || null;
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, "");
  const intlNumber = cleaned.startsWith("0") ? "88" + cleaned : cleaned;
  const text = `আসসালামু আলাইকুম,\nআমি এই পণ্যটি অর্ডার করতে চাই:\n\n📦 ${product.name}${variant ? `\n📋 ভ্যারিয়েন্ট: ${variant.variant_label}` : ""}\n🔢 পরিমাণ: ${quantity}\n💰 মূল্য: ৳${finalPrice * quantity}\n\nধন্যবাদ!`;
  return (
    <a href={`https://wa.me/${intlNumber}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-sm transition-colors shadow-md">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      WhatsApp এ অর্ডার করুন
    </a>
  );
};

const SocialShareButtons = ({ productName }: { productName: string }) => {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const handleCopy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="flex items-center gap-2 pt-2 border-t border-border mt-1">
      <span className="text-xs text-muted-foreground flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> শেয়ার:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center transition-colors" title="Facebook"><svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></a>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${productName} — রাফছা স্টোরে দেখুন!\n${url}`)}`} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white flex items-center justify-center transition-colors" title="WhatsApp"><svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg></a>
      <button onClick={handleCopy} className="h-8 w-8 rounded-full bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors" title="লিংক কপি">
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

interface Product { id: string; name: string; slug: string; short_description: string | null; full_description: string | null; regular_price: number; sale_price: number | null; stock_quantity: number; sku: string | null; category_id: string | null; }
interface RelatedProduct { id: string; name: string; slug: string; regular_price: number; sale_price: number | null; stock_quantity: number; short_description: string | null; product_images: { image_url: string }[]; }
interface Variant { id: string; variant_label: string; variant_type: string; price_adjustment: number; stock_quantity: number; }
interface ProductImage { id: string; image_url: string; display_order: number; }
interface Review { id: string; reviewer_name: string; reviewer_location: string | null; rating: number; review_text: string | null; created_at: string; }

const reviewSchema = z.object({ reviewer_name: z.string().trim().min(1, "নাম প্রয়োজন").max(100), reviewer_location: z.string().trim().max(100).optional(), rating: z.number().min(1).max(5), review_text: z.string().trim().max(1000).optional() });

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addProduct: addRecentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewName, setReviewName] = useState("");
  const [reviewLocation, setReviewLocation] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [topSellingProducts, setTopSellingProducts] = useState<RelatedProduct[]>([]);
  const [stickyWiggle, setStickyWiggle] = useState(false);

  // Periodic wiggle for sticky bar buttons
  useEffect(() => {
    const interval = setInterval(() => {
      setStickyWiggle(true);
      setTimeout(() => setStickyWiggle(false), 600);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (!user) { setUserProfileImage(null); return; } supabase.from("users").select("profile_image_url").eq("id", user.id).single().then(({ data }) => { setUserProfileImage(data?.profile_image_url || null); }); }, [user]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const fetchProduct = async () => {
      const { data: prod } = await supabase.from("products").select("id, name, slug, short_description, full_description, regular_price, sale_price, stock_quantity, sku, category_id").eq("slug", slug).eq("is_active", true).single();
      if (!prod) { setLoading(false); return; }
      setProduct(prod);
      const [imgRes, varRes, revRes] = await Promise.all([
        supabase.from("product_images").select("*").eq("product_id", prod.id).order("display_order"),
        supabase.from("product_variants").select("*").eq("product_id", prod.id).eq("is_active", true),
        supabase.from("reviews").select("*").eq("product_id", prod.id).eq("is_approved", true).order("created_at", { ascending: false }).limit(50),
      ]);
      setImages((imgRes.data as ProductImage[]) || []);
      setVariants((varRes.data as Variant[]) || []);
      setReviews((revRes.data as Review[]) || []);

      // Category name for breadcrumb
      if (prod.category_id) {
        supabase.from("categories").select("name, slug").eq("id", prod.category_id).single().then(({ data }) => {
          if (data) setCategoryName(data.name);
        });
      }

      if (prod.category_id) {
        const { data: related } = await supabase.from("products").select("id, name, slug, regular_price, sale_price, stock_quantity, short_description, product_images(image_url)").eq("is_active", true).eq("category_id", prod.category_id).neq("id", prod.id).order("created_at", { ascending: false }).limit(4);
        setRelatedProducts((related as unknown as RelatedProduct[]) || []);
      } else { setRelatedProducts([]); }

      // Fetch top selling products (most ordered)
      const { data: topItems } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .limit(500);
      if (topItems && topItems.length > 0) {
        const salesMap: Record<string, number> = {};
        topItems.forEach((item: any) => { salesMap[item.product_id] = (salesMap[item.product_id] || 0) + item.quantity; });
        const topIds = Object.entries(salesMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id]) => id).filter(id => id !== prod.id);
        if (topIds.length > 0) {
          const { data: topProds } = await supabase.from("products").select("id, name, slug, regular_price, sale_price, stock_quantity, short_description, product_images(image_url)").eq("is_active", true).in("id", topIds).limit(10);
          setTopSellingProducts((topProds as unknown as RelatedProduct[]) || []);
        }
      }
      setLoading(false);
      addRecentlyViewed({ id: prod.id, name: prod.name, slug: prod.slug, price: prod.sale_price ?? prod.regular_price, image: undefined });
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><TopBar /><Header />
        <div className="container py-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-xl skeleton-shimmer" />
            <div className="space-y-4"><div className="h-8 skeleton-shimmer rounded w-3/4" /><div className="h-6 skeleton-shimmer rounded w-1/3" /><div className="h-20 skeleton-shimmer rounded w-full" /><div className="h-12 skeleton-shimmer rounded w-full" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (<div className="min-h-screen bg-background"><TopBar /><Header /><div className="container py-20 text-center"><h2 className="text-2xl font-bold text-foreground">পণ্য পাওয়া যায়নি</h2><Link to="/" className="text-primary underline mt-4 inline-block">হোমে ফিরে যান</Link></div><Footer /></div>);
  }

  const activeVariant = variants.find((v) => v.id === selectedVariant);
  const basePrice = product.sale_price ?? product.regular_price;
  const finalPrice = basePrice + (activeVariant?.price_adjustment ?? 0);
  const hasDiscount = product.sale_price !== null && product.sale_price < product.regular_price;
  const mainImage = images[selectedImage]?.image_url;
  const isOutOfStock = product.stock_quantity !== -1 && product.stock_quantity <= 0;

  const handleAddToCart = () => { addItem({ productId: product.id, productName: product.name, variantLabel: activeVariant?.variant_label, price: finalPrice, image: images[0]?.image_url }, quantity); toast.success(`${product.name} কার্টে যোগ করা হয়েছে`); };
  const handleBuyNow = () => { addItem({ productId: product.id, productName: product.name, variantLabel: activeVariant?.variant_label, price: finalPrice, image: images[0]?.image_url }, quantity); navigate("/checkout"); };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = reviewSchema.safeParse({ reviewer_name: reviewName, reviewer_location: reviewLocation || undefined, rating: reviewRating, review_text: reviewText || undefined });
    if (!parsed.success) { toast.error(parsed.error.errors[0]?.message); return; }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({ product_id: product.id, user_id: user?.id || null, reviewer_name: parsed.data.reviewer_name, reviewer_location: parsed.data.reviewer_location || null, rating: parsed.data.rating, review_text: parsed.data.review_text || null, reviewer_image_url: userProfileImage || null });
    setSubmitting(false);
    if (error) { toast.error("রিভিউ জমা দিতে সমস্যা হয়েছে"); } else { toast.success("আপনার রিভিউ অনুমোদনের পর প্রকাশিত হবে"); setReviewName(""); setReviewLocation(""); setReviewRating(5); setReviewText(""); }
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-background">
      <TopBar /><Header />
      <main className="container py-6 md:py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Product", "name": product.name, "description": product.short_description || product.full_description || "", "image": mainImage || "", "sku": product.sku || undefined, "offers": { "@type": "Offer", "price": finalPrice, "priceCurrency": "BDT", "availability": (product.stock_quantity === -1 || product.stock_quantity > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }, ...(reviews.length > 0 ? { "aggregateRating": { "@type": "AggregateRating", "ratingValue": avgRating.toFixed(1), "reviewCount": reviews.length } } : {}) }) }} />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-primary transition-colors">সকল পণ্য</Link>
          {categoryName && (<><ChevronRight className="h-3 w-3" /><span className="text-foreground/70">{categoryName}</span></>)}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery - Vertical thumbnails left + main image */}
          <div className="relative">
            <div className="flex flex-col-reverse md:flex-row gap-3">
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden md:max-h-[500px] pb-2 md:pb-0 md:pr-1 scrollbar-thin">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        i === selectedImage
                          ? "border-primary shadow-md ring-1 ring-primary/30"
                          : "border-border/50 opacity-60 hover:opacity-100 hover:border-border"
                      }`}
                    >
                      <img src={img.image_url} alt={`${product.name} - ছবি ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
              {/* Main Image */}
              <div className="flex-1 aspect-square rounded-xl overflow-hidden bg-secondary border border-border relative group">
                {mainImage ? (
                  <ImageZoom src={mainImage} alt={product.name} className="w-full h-full" />
                ) : (
                  <div className="w-full h-full brand-gradient-subtle flex items-center justify-center">
                    <ImageOff className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                <button onClick={() => setLightboxOpen(true)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/5 md:hidden">
                  <span className="bg-card/90 text-foreground text-xs px-3 py-1.5 rounded-full shadow">🔍 বড় করে দেখুন</span>
                </button>
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-card/80 backdrop-blur-sm text-foreground text-xs px-2.5 py-1 rounded-full shadow border border-border/50">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>
            </div>
            {/* Zoom Result Panel — absolute overlay to the right of the image, over product info */}
            <div id="image-zoom-result" className="hidden md:block absolute top-0 left-[calc(100%+1.5rem)] w-[calc(100%-80px)] aspect-square z-50 pointer-events-none" />
          </div>

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{product.name}</h1>
                {product.sku && <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>}
              </div>
              <button onClick={() => toggleWishlist(product.id)} className={`shrink-0 h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-110 ${isWishlisted(product.id) ? "bg-destructive border-destructive text-destructive-foreground" : "border-border text-muted-foreground hover:text-destructive hover:border-destructive"}`} title="উইশলিস্ট">
                <Heart className={`h-5 w-5 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
              </button>
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "text-accent fill-accent" : "text-border"}`} />)}</div>
                <span className="text-sm text-muted-foreground">({reviews.length} রিভিউ)</span>
              </div>
            )}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">৳{finalPrice}</span>
              {hasDiscount && <span className="text-lg text-muted-foreground line-through">৳{product.regular_price + (activeVariant?.price_adjustment ?? 0)}</span>}
              {hasDiscount && <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">{Math.round(((product.regular_price - product.sale_price!) / product.regular_price) * 100)}% ছাড়</span>}
            </div>
            {product.short_description && <p className="text-foreground/80 leading-relaxed">{product.short_description}</p>}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield, label: "গ্যারান্টি" },
                { icon: Truck, label: "দ্রুত ডেলিভারি" },
                { icon: RotateCcw, label: "সহজ রিটার্ন" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/5 text-center">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-medium text-foreground/70">{label}</span>
                </div>
              ))}
            </div>

            {/* Variants grouped by type */}
            {["size", "color", "weight"].map(type => {
              const typeVariants = variants.filter(v => v.variant_type === type);
              if (typeVariants.length === 0) return null;
              const typeLabel = type === "size" ? "সাইজ নির্বাচন করুন" : type === "color" ? "কালার নির্বাচন করুন" : "ওজন নির্বাচন করুন";
              return (
                <div key={type} className="space-y-2">
                  <Label className="text-sm font-medium">{typeLabel}</Label>
                  {type === "color" ? (
                    <div className="flex flex-wrap gap-2">
                      {typeVariants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v.id)}
                          className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                            selectedVariant === v.id
                              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                              : "border-border hover:border-foreground/30"
                          }`}
                          title={v.variant_label}
                        >
                          {v.variant_label.startsWith("#") ? (
                            <div className="w-8 h-8 rounded-full border border-border shadow-sm" style={{ backgroundColor: v.variant_label }} />
                          ) : (
                            <span className="text-sm font-medium px-2">{v.variant_label}</span>
                          )}
                          {v.price_adjustment !== 0 && (
                            <span className="text-[10px] text-muted-foreground">{v.price_adjustment > 0 ? "+" : ""}৳{v.price_adjustment}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {typeVariants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v.id)}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedVariant === v.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-foreground/30 text-foreground"
                          }`}
                        >
                          {v.variant_label}
                          {v.price_adjustment !== 0 && (
                            <span className="text-xs ml-1 opacity-70">({v.price_adjustment > 0 ? "+" : ""}৳{v.price_adjustment})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="space-y-2">
              <Label className="text-sm font-medium">পরিমাণ</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="text-lg font-semibold w-10 text-center">{quantity}</span>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {isOutOfStock ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                <p className="text-destructive font-bold text-lg">স্টক শেষ</p>
                <p className="text-sm text-muted-foreground mt-1">এই পণ্যটি বর্তমানে স্টকে নেই</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="flex-1 brand-gradient text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity" onClick={handleAddToCart}><ShoppingCart className="h-5 w-5 mr-2" /> কার্টে যোগ করুন</Button>
                  <Button size="lg" variant="outline" className="flex-1 border-primary text-primary font-semibold hover:bg-primary/10" onClick={handleBuyNow}><Zap className="h-5 w-5 mr-2" /> সরাসরি কিনুন</Button>
                </div>
                <WhatsAppOrderButton product={product} variant={activeVariant} quantity={quantity} finalPrice={finalPrice} />
                {product.stock_quantity > 0 && product.stock_quantity <= 10 && product.stock_quantity !== -1 && <p className="text-sm text-destructive font-medium flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> মাত্র {product.stock_quantity}টি বাকি আছে!</p>}
              </>
            )}
            <SocialShareButtons productName={product.name} />
          </div>
        </div>

        {product.full_description && (
          <section className="mt-12 bg-card rounded-xl border border-border p-6 md:p-8">
            <h2 className="text-xl font-display font-bold text-foreground mb-4">বিস্তারিত বিবরণ</h2>
            <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap">{product.full_description}</div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-display font-bold text-foreground mb-6">গ্রাহক রিভিউ ({reviews.length})</h2>
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-4">আপনার মতামত দিন</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="rname">আপনার নাম *</Label><Input id="rname" value={reviewName} onChange={(e) => setReviewName(e.target.value)} required maxLength={100} placeholder="নাম লিখুন" /></div>
                <div className="space-y-2"><Label htmlFor="rloc">অবস্থান</Label><Input id="rloc" value={reviewLocation} onChange={(e) => setReviewLocation(e.target.value)} maxLength={100} placeholder="যেমন: ঢাকা" /></div>
              </div>
              <div className="space-y-2">
                <Label>রেটিং *</Label>
                <div className="flex gap-1">{[1,2,3,4,5].map((star) => <button key={star} type="button" onClick={() => setReviewRating(star)} className="p-0.5"><Star className={`h-6 w-6 transition-colors ${star <= reviewRating ? "text-accent fill-accent" : "text-border"}`} /></button>)}</div>
              </div>
              <div className="space-y-2"><Label htmlFor="rtext">রিভিউ</Label><Textarea id="rtext" value={reviewText} onChange={(e) => setReviewText(e.target.value)} maxLength={1000} placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..." rows={3} /></div>
              <Button type="submit" disabled={submitting} className="brand-gradient text-primary-foreground hover:opacity-90">{submitting ? "জমা হচ্ছে..." : "রিভিউ জমা দিন"}</Button>
            </form>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-card rounded-xl border border-border p-5 gradient-border-hover">
                  <div className="flex gap-1 mb-2">{[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating ? "text-accent fill-accent" : "text-border"}`} />)}</div>
                  {r.review_text && <p className="text-sm text-foreground/80 mb-3">"{r.review_text}"</p>}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div><p className="font-semibold text-sm text-foreground">{r.reviewer_name}</p>{r.reviewer_location && <p className="text-xs text-muted-foreground">{r.reviewer_location}</p>}</div>
                    <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("bn-BD")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8"><MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" /><p className="text-muted-foreground">এখনো কোনো রিভিউ নেই। প্রথম রিভিউ দিন!</p></div>
          )}
        </section>

        <section className="mt-12 bg-card rounded-xl border border-border p-6 md:p-8"><ProductQA productId={product.id} /></section>
        <section className="mt-12 bg-card rounded-xl border border-border p-6 md:p-8"><ComparisonTable currentProductId={product.id} categoryId={product.category_id} /></section>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-display font-bold text-foreground mb-6 flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> সম্পর্কিত পণ্য</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {relatedProducts.map((p) => <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} regularPrice={p.regular_price} salePrice={p.sale_price} imageUrl={p.product_images?.[0]?.image_url || null} shortDescription={p.short_description} stockQuantity={p.stock_quantity} />)}
            </div>
          </section>
        )}

        {topSellingProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" /> টপ সেলিং প্রোডাক্ট
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {topSellingProducts.map((p) => (
                <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} regularPrice={p.regular_price} salePrice={p.sale_price} imageUrl={p.product_images?.[0]?.image_url || null} shortDescription={p.short_description} stockQuantity={p.stock_quantity} />
              ))}
            </div>
          </section>
        )}

        <RecentlyViewedProducts />
      </main>

      {/* Lightbox */}
      {lightboxOpen && mainImage && (
        <div className="fixed inset-0 z-[100] bg-foreground/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-primary-foreground hover:text-accent" onClick={() => setLightboxOpen(false)}><X className="h-8 w-8" /></button>
          {images.length > 1 && (
            <>
              <button className="absolute left-4 text-primary-foreground hover:text-accent" onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev - 1 + images.length) % images.length); }}><ChevronLeft className="h-10 w-10" /></button>
              <button className="absolute right-4 text-primary-foreground hover:text-accent" onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev + 1) % images.length); }}><ChevronRight className="h-10 w-10" /></button>
            </>
          )}
          <img src={images[selectedImage].image_url} alt={product.name} className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Sticky bottom Add to Cart bar — all screens */}
      {!isOutOfStock && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="container py-2.5 flex items-center gap-3 md:gap-4">
            {/* Product thumbnail */}
            <div className="hidden sm:block shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-border">
              {images[0]?.image_url ? (
                <img src={images[0].image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground/40" /></div>
              )}
            </div>
            {/* Product name + price */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
              <p className="text-xs text-primary font-bold">৳{finalPrice}</p>
            </div>
            {/* Quantity controls */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-3.5 w-3.5" /></Button>
              <span className="text-sm font-semibold w-8 text-center">{quantity}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
            {/* Action buttons with periodic wiggle */}
            <div className={`flex items-center gap-2 shrink-0 transition-transform ${stickyWiggle ? "animate-wiggle" : ""}`}>
              <Button
                size="sm"
                className="brand-gradient text-primary-foreground font-semibold"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">কার্টে যোগ</span><span className="sm:hidden">কার্ট</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={handleBuyNow}
              >
                <Zap className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">এখনই কিনুন</span><span className="sm:hidden">কিনুন</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;
