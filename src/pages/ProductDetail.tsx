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
import { ShoppingCart, Minus, Plus, Star, ChevronLeft, MessageSquare, ImageOff, AlertTriangle, Zap, Package } from "lucide-react";
import { z } from "zod";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";

const WhatsAppOrderButton = ({ product, variant, quantity, finalPrice }: { product: { name: string }; variant?: { variant_label: string } | null; quantity: number; finalPrice: number }) => {
  const [phone, setPhone] = useState<string | null>(null);
  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "whatsapp_number").maybeSingle().then(({ data }) => {
      if (data?.value) setPhone(data.value);
    });
  }, []);
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, "");
  const intlNumber = cleaned.startsWith("0") ? "88" + cleaned : cleaned;
  const text = `আসসালামু আলাইকুম,\nআমি এই পণ্যটি অর্ডার করতে চাই:\n\n📦 ${product.name}${variant ? `\n📋 ভ্যারিয়েন্ট: ${variant.variant_label}` : ""}\n🔢 পরিমাণ: ${quantity}\n💰 মূল্য: ৳${finalPrice * quantity}\n\nধন্যবাদ!`;
  return (
    <a
      href={`https://wa.me/${intlNumber}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-sm transition-colors shadow-md"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      WhatsApp এ অর্ডার করুন
    </a>
  );
};

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
  category_id: string | null;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
  short_description: string | null;
  product_images: { image_url: string }[];
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
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);

  useEffect(() => {
    if (!user) { setUserProfileImage(null); return; }
    supabase.from("users").select("profile_image_url").eq("id", user.id).single().then(({ data }) => {
      setUserProfileImage(data?.profile_image_url || null);
    });
  }, [user]);

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

      // Fetch related products from same category
      if (prod.category_id) {
        const { data: related } = await supabase
          .from("products")
          .select("id, name, slug, regular_price, sale_price, stock_quantity, short_description, product_images(image_url)")
          .eq("is_active", true)
          .eq("category_id", prod.category_id)
          .neq("id", prod.id)
          .order("created_at", { ascending: false })
          .limit(4);
        setRelatedProducts((related as unknown as RelatedProduct[]) || []);
      } else {
        setRelatedProducts([]);
      }

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
    const { error } = await supabase.from("reviews").insert({ product_id: product.id, user_id: user?.id || null, reviewer_name: parsed.data.reviewer_name, reviewer_location: parsed.data.reviewer_location || null, rating: parsed.data.rating, review_text: parsed.data.review_text || null, reviewer_image_url: userProfileImage || null });
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
            {(() => {
              const isOutOfStock = product.stock_quantity !== -1 && product.stock_quantity <= 0;
              return isOutOfStock ? (
                <div className="space-y-3">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                    <p className="text-destructive font-bold text-lg">স্টক শেষ</p>
                    <p className="text-sm text-muted-foreground mt-1">এই পণ্যটি বর্তমানে স্টকে নেই</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="lg" className="flex-1 brand-gradient text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity" onClick={handleAddToCart}>
                      <ShoppingCart className="h-5 w-5 mr-2" /> কার্টে যোগ করুন
                    </Button>
                    <Button size="lg" variant="outline" className="flex-1 border-primary text-primary font-semibold hover:bg-primary/10" onClick={handleBuyNow}>
                      <Zap className="h-5 w-5 mr-2" /> সরাসরি কিনুন
                    </Button>
                  </div>
                  <WhatsAppOrderButton product={product} variant={activeVariant} quantity={quantity} finalPrice={finalPrice} />
                  {product.stock_quantity > 0 && product.stock_quantity <= 10 && product.stock_quantity !== -1 && <p className="text-sm text-destructive font-medium flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> মাত্র {product.stock_quantity}টি বাকি আছে!</p>}
                </>
              );
            })()}
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              সম্পর্কিত পণ্য
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  regularPrice={p.regular_price}
                  salePrice={p.sale_price}
                  imageUrl={p.product_images?.[0]?.image_url || null}
                  shortDescription={p.short_description}
                  stockQuantity={p.stock_quantity}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
