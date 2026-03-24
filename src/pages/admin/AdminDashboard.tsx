import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, DollarSign, Clock, Inbox, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  stock_quantity: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, totalProducts: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const [ordersRes, pendingRes, productsRes, recentRes, lowStockRes] = await Promise.all([
      supabase.from("orders").select("total_amount"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status", "Pending"),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, order_number, customer_name, total_amount, order_status, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("products").select("id, name, slug, stock_quantity").gt("stock_quantity", 0).lte("stock_quantity", 10).eq("is_active", true).order("stock_quantity"),
    ]);

    const orders = ordersRes.data || [];
    setStats({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + (o.total_amount || 0), 0),
      pendingOrders: pendingRes.count || 0,
      totalProducts: productsRes.count || 0,
    });
    setRecentOrders((recentRes.data as RecentOrder[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Real-time: auto-refresh when orders change
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-rt-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchStats();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const cards = [
    { title: "মোট অর্ডার", value: stats.totalOrders, icon: ShoppingCart, color: "text-primary" },
    { title: "মোট আয়", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-success" },
    { title: "পেন্ডিং অর্ডার", value: stats.pendingOrders, icon: Clock, color: "text-destructive" },
    { title: "মোট পণ্য", value: stats.totalProducts, icon: Package, color: "text-accent" },
  ];

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      Pending: "bg-accent/20 text-accent",
      Processing: "bg-primary/10 text-primary",
      Shipped: "bg-info/10 text-info",
      Delivered: "bg-success/10 text-success",
      Cancelled: "bg-destructive/10 text-destructive",
    };
    return map[s] || "bg-secondary text-secondary-foreground";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">ড্যাশবোর্ড</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">ড্যাশবোর্ড</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">সাম্প্রতিক অর্ডার</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">কোনো অর্ডার নেই</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 font-medium text-muted-foreground">অর্ডার</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">গ্রাহক</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">পরিমাণ</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">স্ট্যাটাস</th>
                    <th className="py-2 font-medium text-muted-foreground">তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4">
                        <Link to="/admin/orders" className="text-primary font-medium hover:underline">{o.order_number}</Link>
                      </td>
                      <td className="py-3 pr-4 text-foreground">{o.customer_name}</td>
                      <td className="py-3 pr-4 font-medium text-foreground">৳{o.total_amount}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(o.order_status)}`}>{o.order_status}</span>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString("bn-BD")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
