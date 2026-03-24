import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, ArrowLeftRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
  short_description: string | null;
  image_url?: string;
  category_name?: string;
}

const ComparisonTable = ({ currentProductId, categoryId }: { currentProductId: string; categoryId: string | null }) => {
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [compareProduct, setCompareProduct] = useState<CompareProduct | null>(null);
  const [currentProduct, setCurrentProduct] = useState<CompareProduct | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, regular_price, sale_price, stock_quantity, short_description, category_id")
        .eq("is_active", true)
        .neq("id", currentProductId)
        .limit(50);

      if (data) {
        const ids = [currentProductId, ...data.map((p: any) => p.id)];
        const { data: images } = await supabase.from("product_images").select("product_id, image_url").in("product_id", ids).order("display_order");
        const imgMap: Record<string, string> = {};
        images?.forEach((i: any) => { if (!imgMap[i.product_id]) imgMap[i.product_id] = i.image_url; });

        const { data: cats } = await supabase.from("categories").select("id, name");
        const catMap: Record<string, string> = {};
        cats?.forEach((c: any) => { catMap[c.id] = c.name; });

        setProducts(data.map((p: any) => ({ ...p, image_url: imgMap[p.id], category_name: catMap[p.category_id] })));

        const { data: cur } = await supabase.from("products").select("id, name, slug, regular_price, sale_price, stock_quantity, short_description, category_id").eq("id", currentProductId).single();
        if (cur) setCurrentProduct({ ...cur, image_url: imgMap[cur.id], category_name: catMap[cur.category_id || ""] });
      }
    };
    fetchProducts();
  }, [currentProductId]);

  const handleCompare = () => {
    const prod = products.find(p => p.id === selectedId);
    if (prod) { setCompareProduct(prod); setShow(true); }
  };

  if (!currentProduct) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-primary" /> পণ্য তুলনা
        </h3>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="তুলনা করতে পণ্য নির্বাচন করুন" /></SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleCompare} disabled={!selectedId}>তুলনা</Button>
        </div>
      </div>

      {show && compareProduct && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between bg-secondary/30 px-4 py-2">
            <span className="text-sm font-medium">তুলনা রেজাল্ট</span>
            <button onClick={() => setShow(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium w-28">বিবরণ</th>
                  <th className="p-3 text-center">{currentProduct.name}</th>
                  <th className="p-3 text-center">{compareProduct.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3 text-muted-foreground">ছবি</td>
                  <td className="p-3 text-center">{currentProduct.image_url ? <img src={currentProduct.image_url} alt="" className="w-20 h-20 object-cover rounded mx-auto" /> : "—"}</td>
                  <td className="p-3 text-center">{compareProduct.image_url ? <img src={compareProduct.image_url} alt="" className="w-20 h-20 object-cover rounded mx-auto" /> : "—"}</td>
                </tr>
                <tr className="border-b border-border bg-secondary/20">
                  <td className="p-3 text-muted-foreground">মূল্য</td>
                  <td className="p-3 text-center font-bold text-primary">৳{currentProduct.sale_price ?? currentProduct.regular_price}</td>
                  <td className="p-3 text-center font-bold text-primary">৳{compareProduct.sale_price ?? compareProduct.regular_price}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 text-muted-foreground">ক্যাটাগরি</td>
                  <td className="p-3 text-center">{currentProduct.category_name || "—"}</td>
                  <td className="p-3 text-center">{compareProduct.category_name || "—"}</td>
                </tr>
                <tr className="border-b border-border bg-secondary/20">
                  <td className="p-3 text-muted-foreground">স্টক</td>
                  <td className="p-3 text-center">{currentProduct.stock_quantity > 0 ? <span className="text-green-600">ইন স্টক</span> : <span className="text-destructive">স্টক আউট</span>}</td>
                  <td className="p-3 text-center">{compareProduct.stock_quantity > 0 ? <span className="text-green-600">ইন স্টক</span> : <span className="text-destructive">স্টক আউট</span>}</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">বিবরণ</td>
                  <td className="p-3 text-center text-xs">{currentProduct.short_description || "—"}</td>
                  <td className="p-3 text-center text-xs">{compareProduct.short_description || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;
