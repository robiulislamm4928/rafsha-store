import { useState, useEffect, useCallback } from "react";

const KEY = "recently-viewed-products";
const MAX = 10;

interface RecentProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

export const useRecentlyViewed = () => {
  const [items, setItems] = useState<RecentProduct[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const addProduct = useCallback((product: RecentProduct) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, MAX);
    });
  }, []);

  return { items, addProduct };
};
