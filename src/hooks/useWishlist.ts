import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setWishlistIds(new Set()); return; }
    supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setWishlistIds(new Set(data.map((d) => d.product_id)));
      });
  }, [user]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) {
      toast.error("উইশলিস্টে যোগ করতে লগইন করুন");
      return;
    }
    setLoading(true);
    const isInWishlist = wishlistIds.has(productId);
    if (isInWishlist) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      setWishlistIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
      toast.success("উইশলিস্ট থেকে সরানো হয়েছে");
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
      setWishlistIds((prev) => new Set(prev).add(productId));
      toast.success("উইশলিস্টে যোগ করা হয়েছে");
    }
    setLoading(false);
  }, [user, wishlistIds]);

  const isWishlisted = useCallback((productId: string) => wishlistIds.has(productId), [wishlistIds]);

  return { wishlistIds, toggleWishlist, isWishlisted, loading };
};
