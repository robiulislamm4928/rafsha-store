import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
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
  const displayPrice = salePrice ?? regularPrice;
  const hasDiscount = salePrice !== null && salePrice < regularPrice;

  return (
    <div className="group bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <Link to={`/product/${slug}`} className="block aspect-square overflow-hidden bg-secondary relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full honey-gradient-subtle flex items-center justify-center text-6xl">🍯</div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
            {Math.round(((regularPrice - salePrice!) / regularPrice) * 100)}% ছাড়
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${slug}`}>
          <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        {shortDescription && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{shortDescription}</p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">৳{displayPrice}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">৳{regularPrice}</span>
            )}
          </div>
          <Button
            size="sm"
            className="honey-gradient text-primary-foreground hover:opacity-90 transition-opacity h-8 px-3"
            onClick={(e) => {
              e.preventDefault();
              addItem({ productId: id, productName: name, price: displayPrice, image: imageUrl || undefined });
            }}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">কিনুন</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
