import { useNavigate, Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, ImageOff } from "lucide-react";

const CartDrawer = () => {
  const { items, total, isCartOpen, closeCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ShoppingBag className="h-5 w-5 text-primary" />
            আপনার Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/20" />
            <p className="text-muted-foreground text-sm">আপনার Cart খালি</p>
            <Button variant="outline" size="sm" onClick={closeCart}>
              শপিং চালিয়ে যান
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantLabel || ""}`} className="flex gap-3 p-4">
                  {/* Image */}
                  <Link to={item.slug ? `/product/${item.slug}` : '#'} onClick={closeCart} className="w-20 h-20 rounded-lg overflow-hidden bg-secondary border border-border shrink-0 block">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={item.slug ? `/product/${item.slug}` : '#'} onClick={closeCart} className="text-sm font-semibold text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors block">
                      {item.productName}
                    </Link>
                    {item.variantLabel && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.variantLabel}</p>
                    )}
                    <p className="text-sm font-bold text-primary mt-1">৳{item.price}</p>

                    {/* Quantity + Remove */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantLabel)}
                          className="px-2.5 py-1 hover:bg-secondary transition-colors text-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium text-foreground bg-secondary/50 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantLabel)}
                          className="px-2.5 py-1 hover:bg-secondary transition-colors text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantLabel)}
                        className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-5 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">সর্বমোট</span>
                <span className="text-xl font-bold text-foreground">৳{total}</span>
              </div>
              <Button
                className="w-full h-11 brand-gradient text-primary-foreground font-semibold hover:opacity-90"
                onClick={handleCheckout}
              >
                চেকআউট করুন
              </Button>
              <Button variant="ghost" className="w-full text-sm" onClick={closeCart}>
                শপিং চালিয়ে যান
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
