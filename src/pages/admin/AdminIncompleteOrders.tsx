import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Phone, ShoppingCart } from "lucide-react";

interface IncompleteOrder {
  id: string;
  phone: string | null;
  total_value: number | null;
  cart_snapshot: any;
  created_at: string;
}

const AdminIncompleteOrders = () => {
  const [orders, setOrders] = useState<IncompleteOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("incomplete_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setOrders((data as IncompleteOrder[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-accent" />
        অসম্পূর্ণ অর্ডার
      </h1>
      <p className="text-sm text-muted-foreground">যেসব কাস্টমার চেকআউট কমপ্লিট করেনি তাদের তালিকা</p>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-3 font-medium text-muted-foreground">ফোন</th>
              <th className="p-3 font-medium text-muted-foreground">মূল্য</th>
              <th className="p-3 font-medium text-muted-foreground">কার্ট আইটেম</th>
              <th className="p-3 font-medium text-muted-foreground">তারিখ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4"><div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div></td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center">
                <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">কোনো অসম্পূর্ণ অর্ডার নেই</p>
              </td></tr>
            ) : orders.map((o) => {
              const items = Array.isArray(o.cart_snapshot) ? o.cart_snapshot : [];
              return (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    {o.phone ? (
                      <a href={`tel:${o.phone}`} className="text-primary flex items-center gap-1 hover:underline">
                        <Phone className="h-3.5 w-3.5" /> {o.phone}
                      </a>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-3 font-medium">৳{o.total_value?.toLocaleString() || "—"}</td>
                  <td className="p-3">
                    <div className="space-y-0.5">
                      {items.slice(0, 3).map((item: any, idx: number) => (
                        <p key={idx} className="text-xs text-foreground/80 truncate max-w-[200px]">
                          {item.productName || item.product_name || "পণ্য"} × {item.quantity || 1}
                        </p>
                      ))}
                      {items.length > 3 && <p className="text-xs text-muted-foreground">+{items.length - 3} আরো</p>}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("bn-BD")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminIncompleteOrders;
