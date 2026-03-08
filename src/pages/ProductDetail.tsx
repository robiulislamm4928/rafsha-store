import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Minus, Plus, Star, ChevronLeft, MessageSquare, ImageOff, AlertTriangle, Zap } from "lucide-react";
import { z } from "zod";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
  sku: string | null;
}

interface Variant {
  id: string;
  variant_label: string;
  price_adjustment: number;
  stock_quantity: number;
}

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_location: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
}

const reviewSchema = z.object({
  reviewer_name: z.string().trim().min(1, "নাম প্রয়োজন").max(100),
  reviewer_location: z.string().trim().max(100).optional(),
  rating: z.number().min(1).max(5),
  review_text: z.string().trim().max(1000).optional(),
});

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { user } = useAuth();
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

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const fetchProduct = async () => {
      const { data: prod } = await supabase.from("products").select("id, name, slug, short_description, full_description, regular_price, sale_price, stock_quantity, sku").eq("slug", slug).eq("is_active", true).single();
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
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar /><Header />
        <div className="container py-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar /><Header />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground">পণ্য পাওয়া যায়নি</h2>
          <Link to="/" className="text-primary underline mt-4 inline-block">হোমে ফিরে যান</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const activeVariant = variants.find((v) => v.id === selectedVariant);
  const basePrice = product.sale_price ?? product.regular_price;
  const finalPrice = basePrice + (activeVariant?.price_adjustment ?? 0);
  const hasDiscount = product.sale_price !== null && product.sale_price < product.regular_price;
  const mainImage = images[selectedImage]?.image_url;

  const handleAddToCart = () => {
    addItem({ productId: product.id, productName: product.name, variantLabel: activeVariant?.variant_label, price: finalPrice, image: images[0]?.image_url }, quantity);
    toast.success(`${product.name} কার্টে যোগ করা হয়েছে`);
  };

  const handleBuyNow = () => {
    addItem({ productId: product.id, productName: product.name, variantLabel: activeVariant?.variant_label, price: finalPrice, image: images[0]?.image_url }, quantity);
    navigate("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = reviewSchema.safeParse({ reviewer_name: reviewName, reviewer_location: reviewLocation || undefined, rating: reviewRating, review_text: reviewText || undefined });
    if (!parsed.success) { toast.error(parsed.error.errors[0]?.message); return; }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({ product_id: product.id, user_id: user?.id || null, reviewer_name: parsed.data.reviewer_name, reviewer_location: parsed.data.reviewer_location || null, rating: parsed.data.rating, review_text: parsed.data.review_text || null });
    setSubmitting(false);
    if (error) { toast.error("রিভিউ জমা দিতে সমস্যা হয়েছে"); } else {
      toast.success("আপনার রিভিউ অনুমোদনের পর প্রকাশিত হবে");
      setReviewName(""); setReviewLocation(""); setReviewRating(5); setReviewText("");
    }
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-background">
      <TopBar /><Header />
      <main className="container py-6 md:py-10">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"><ChevronLeft className="h-4 w-4 mr-1" /> হোমে ফিরুন</Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary border border-border">
              {mainImage ? <img src={mainImage} alt={product.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full brand-gradient-subtle flex items-center justify-center"><ImageOff className="h-16 w-16 text-muted-foreground/30" /></div>}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setSelectedImage(i)} className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? "border-primary shadow-md" : "border-border opacity-70 hover:opacity-100"}`}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{product.name}</h1>
              {product.sku && <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>}
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
            {variants.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">ভ্যারিয়েন্ট নির্বাচন করুন</Label>
                <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                  <SelectTrigger className="w-full max-w-xs"><SelectValue placeholder="ভ্যারিয়েন্ট বেছে নিন" /></SelectTrigger>
                  <SelectContent>{variants.map((v) => <SelectItem key={v.id} value={v.id}>{v.variant_label} {v.price_adjustment > 0 ? `(+৳${v.price_adjustment})` : v.price_adjustment < 0 ? `(-৳${Math.abs(v.price_adjustment)})` : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-medium">পরিমাণ</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="text-lg font-semibold w-10 text-center">{quantity}</span>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1 brand-gradient text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity" onClick={handleAddToCart} disabled={product.stock_quantity === 0}>
                <ShoppingCart className="h-5 w-5 mr-2" />{product.stock_quantity === 0 ? "স্টকে নেই" : "কার্টে যোগ করুন"}
              </Button>
              {product.stock_quantity !== 0 && (
                <Button size="lg" variant="outline" className="flex-1 border-primary text-primary font-semibold hover:bg-primary/10" onClick={handleBuyNow}>
                  <Zap className="h-5 w-5 mr-2" /> সরাসরি কিনুন
                </Button>
              )}
            </div>
            {product.stock_quantity > 0 && product.stock_quantity <= 10 && product.stock_quantity !== -1 && <p className="text-sm text-destructive font-medium flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> মাত্র {product.stock_quantity}টি বাকি আছে!</p>}
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
                <div key={r.id} className="bg-card rounded-xl border border-border p-5">
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
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">এখনো কোনো রিভিউ নেই। প্রথম রিভিউ দিন!</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
