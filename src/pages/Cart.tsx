import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, ImageOff } from "lucide-react";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";

const Cart = () => {
  const { items, itemCount, total, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <Header />

      <div className="container py-4 sm:py-6 md:py-10 flex-1">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 sm:h-7 sm:w-7 text-primary" /> আপনার Cart
          </h1>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs sm:text-sm" onClick={clearCart}>
              সব মুছুন
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">আপনার কার্ট খালি</h2>
            <p className="text-sm text-muted-foreground mb-6">আমাদের পণ্যগুলো ব্রাউজ করুন এবং পছন্দের পণ্য কার্টে যোগ করুন।</p>
            <Button asChild className="brand-gradient text-primary-foreground hover:opacity-90">
              <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> শপিং চালিয়ে যান</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantLabel || ""}`}
                  className="bg-card rounded-xl border border-border p-3 sm:p-4"
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Image */}
                    <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-secondary">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full brand-gradient-subtle flex items-center justify-center"><ImageOff className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" /></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2">{item.productName}</h3>
                      {item.variantLabel && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.variantLabel}</p>
                      )}
                      <p className="text-sm font-bold text-primary mt-1">৳{item.price}</p>
                    </div>

                    {/* Remove - mobile top right */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive h-7 w-7 sm:h-8 sm:w-8"
                      onClick={() => removeItem(item.productId, item.variantLabel)}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>

                  {/* Quantity & Total - separate row on mobile */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantLabel)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantLabel)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-bold text-foreground text-sm sm:text-base">৳{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-4 sm:p-6 sticky top-24 space-y-4">
                <h3 className="font-display font-bold text-lg text-foreground">অর্ডার সারাংশ</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-foreground/80">
                    <span>মোট পণ্য</span>
                    <span>{itemCount}টি</span>
                  </div>
                  <div className="flex justify-between text-foreground/80">
                    <span>সাবটোটাল</span>
                    <span>৳{total}</span>
                  </div>
                  <div className="flex justify-between text-foreground/80">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="text-muted-foreground">চেকআউটে নির্ধারিত হবে</span>
                  </div>
                </div>
                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="font-bold text-foreground text-lg">মোট</span>
                  <span className="font-bold text-primary text-xl">৳{total}</span>
                </div>
                <Button asChild className="w-full brand-gradient text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity" size="lg">
                  <Link to="/checkout">চেকআউট করুন</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> শপিং চালিয়ে যান</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;