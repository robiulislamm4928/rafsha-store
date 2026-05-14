import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Props {
  /** When provided, overrides the internal scroll-based visibility. */
  show?: boolean;
}

const FloatingCartButton = ({ show }: Props) => {
  const { itemCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (show !== undefined) return;
    const onScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [show]);
  const visible = show !== undefined ? show : scrolled;
  if (!visible) return null;
  return (
    <button
      onClick={openCart}
      aria-label="Cart দেখুন"
      className="fixed bottom-[13rem] right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center md:bottom-[9rem] animate-fade-in-up"
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center border-2 border-background">
          {itemCount}
        </span>
      )}
    </button>
  );
};

export default FloatingCartButton;