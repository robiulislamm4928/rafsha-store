import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Minus, Plus, ImageOff, Star } from "lucide-react";
import { toast } from "sonner";
import { linkifyAndSanitize } from "@/lib/sanitizeHtml";

interface QuickViewModalProps {
  productId: string | null;
  onClose: () => void;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
}

const QuickViewModal = ({ productId, onClose }: QuickViewModalProps) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    if (!productId) return;
    setQuantity(1);
    const fetch = async () => {
      const [prodRes, imgRes, revRes] = await Promise.all([
        supabase.from("products").select("id, name, slug, short_description, regular_price, sale_price, stock_quantity").eq("id", productId).single(),
        supabase.from("product_images").select("image_url").eq("product_id", productId).order("display_order").limit(1),
        supabase.from("reviews").select("rating").eq("product_id", productId).eq("is_approved", true),
      ]);
      setProduct(prodRes.data as ProductData | null);
      setImageUrl(imgRes.data?.[0]?.image_url || null);
      if (revRes.data && revRes.data.length > 0) {
        setAvgRating(revRes.data.reduce((s, r) => s + r.rating, 0) / revRes.data.length);
        setReviewCount(revRes.data.length);
      } else {
        setAvgRating(0);
        setReviewCount(0);
      }
    };
    fetch();
  }, [productId]);

  if (!product) return null;

  const displayPrice = product.sale_price ?? product.regular_price;
  const hasDiscount = product.sale_price !== null && product.sale_price < product.regular_price;
  const isOutOfStock = product.stock_quantity !== -1 && product.stock_quantity <= 0;

  return (
    <Dialog open={!!productId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-display">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><ImageOff className="h-12 w-12 text-muted-foreground/30" /></div>
            )}
          </div>
          <div className="space-y-3 flex flex-col">
            {reviewCount > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(avgRating) ? "text-accent fill-accent" : "text-border"}`} />)}</div>
                <span className="text-xs text-muted-foreground">({reviewCount})</span>
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">৳{displayPrice}</span>
              {hasDiscount && <span className="text-sm text-muted-foreground line-through">৳{product.regular_price}</span>}
            </div>
            {product.short_description && <div className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: linkifyAndSanitize(product.short_description) }} />}

            <div className="mt-auto space-y-3 pt-2">
              {isOutOfStock ? (
                <p className="text-destructive font-bold text-center">স্টক শেষ</p>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-3 w-3" /></Button>
                    <span className="font-semibold w-8 text-center">{quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 brand-gradient text-primary-foreground" onClick={() => { addItem({ productId: product.id, productName: product.name, slug: product.slug, price: displayPrice, image: imageUrl || undefined }, quantity); toast.success("Cart-এ যোগ হয়েছে"); }}>
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Cart
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { addItem({ productId: product.id, productName: product.name, slug: product.slug, price: displayPrice, image: imageUrl || undefined }, quantity); navigate("/checkout"); }}>
                      <Zap className="h-3.5 w-3.5 mr-1" /> কিনুন
                    </Button>
                  </div>
                </>
              )}
              <Button variant="link" size="sm" className="w-full text-primary" onClick={() => { onClose(); navigate(`/product/${product.slug}`); }}>
                বিস্তারিত দেখুন →
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
