import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ImageOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  regularPrice: number;
  salePrice: number | null;
  imageUrl: string | null;
  shortDescription?: string | null;
}

const ProductCard = ({ id, name, slug, regularPrice, salePrice, imageUrl, shortDescription }: ProductCardProps) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const displayPrice = salePrice ?? regularPrice;
  const hasDiscount = salePrice !== null && salePrice < regularPrice;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ productId: id, productName: name, price: displayPrice, image: imageUrl || undefined });
    navigate("/checkout");
  };

  return (
    <div className="group bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <Link to={`/product/${slug}`} className="block aspect-square overflow-hidden bg-secondary relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full brand-gradient-subtle flex items-center justify-center">
            <ImageOff className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
            {Math.round(((regularPrice - salePrice!) / regularPrice) * 100)}% ছাড়
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${slug}`}>
          <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        {shortDescription && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{shortDescription}</p>
        )}

        <div className="mt-auto pt-3 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">৳{displayPrice}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">৳{regularPrice}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={(e) => {
                e.preventDefault();
                addItem({ productId: id, productName: name, price: displayPrice, image: imageUrl || undefined });
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> কার্ট
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs brand-gradient text-primary-foreground hover:opacity-90"
              onClick={handleBuyNow}
            >
              <Zap className="h-3.5 w-3.5 mr-1" /> কিনুন
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
