import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, DollarSign, Clock, Inbox, AlertTriangle, TrendingUp, Users, Eye, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  todayOrders: number;
  totalCustomers: number;
  deliveredOrders: number;
  cancelledOrders: number;
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

const gradientCards = [
  { key: "totalRevenue", label: "মোট আয়", icon: DollarSign, gradient: "from-blue-500 via-blue-600 to-indigo-700", shadow: "shadow-blue-500/30" },
  { key: "totalOrders", label: "মোট অর্ডার", icon: ShoppingCart, gradient: "from-purple-500 via-purple-600 to-violet-700", shadow: "shadow-purple-500/30" },
  { key: "pendingOrders", label: "পেন্ডিং অর্ডার", icon: Clock, gradient: "from-amber-400 via-orange-500 to-red-500", shadow: "shadow-orange-500/30" },
  { key: "totalProducts", label: "মোট পণ্য", icon: Package, gradient: "from-emerald-400 via-green-500 to-teal-600", shadow: "shadow-green-500/30" },
  { key: "todayOrders", label: "আজকের অর্ডার", icon: TrendingUp, gradient: "from-cyan-400 via-cyan-500 to-blue-600", shadow: "shadow-cyan-500/30" },
  { key: "totalCustomers", label: "মোট গ্রাহক", icon: Users, gradient: "from-pink-400 via-rose-500 to-red-600", shadow: "shadow-pink-500/30" },
  { key: "deliveredOrders", label: "ডেলিভারড", icon: ArrowUpRight, gradient: "from-green-400 via-emerald-500 to-green-700", shadow: "shadow-emerald-500/30" },
  { key: "cancelledOrders", label: "বাতিল", icon: AlertTriangle, gradient: "from-red-400 via-red-500 to-rose-700", shadow: "shadow-red-500/30" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0, totalRevenue: 0, pendingOrders: 0, totalProducts: 0,
    todayOrders: 0, totalCustomers: 0, deliveredOrders: 0, cancelledOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const today = new Date().toISOString().split("T")[0];
    const [ordersRes, pendingRes, productsRes, recentRes, lowStockRes, todayRes, customersRes, deliveredRes, cancelledRes] = await Promise.all([
      supabase.from("orders").select("total_amount"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status", "Pending"),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, order_number, customer_name, total_amount, order_status, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("products").select("id, name, slug, stock_quantity").gt("stock_quantity", 0).lte("stock_quantity", 10).eq("is_active", true).order("stock_quantity"),
      supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", today),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status", "Delivered"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status", "Cancelled"),
    ]);

    const orders = ordersRes.data || [];
    setStats({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + (o.total_amount || 0), 0),
      pendingOrders: pendingRes.count || 0,
      totalProducts: productsRes.count || 0,
      todayOrders: todayRes.count || 0,
      totalCustomers: customersRes.count || 0,
      deliveredOrders: deliveredRes.count || 0,
      cancelledOrders: cancelledRes.count || 0,
    });
    setRecentOrders((recentRes.data as RecentOrder[]) || []);
    setLowStockProducts((lowStockRes.data as LowStockProduct[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-rt-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchStats())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getStatValue = (key: string) => {
    const val = stats[key as keyof Stats];
    if (key === "totalRevenue") return `৳${(val as number).toLocaleString()}`;
    return val;
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      Pending: "bg-amber-100 text-amber-700",
      Processing: "bg-blue-100 text-blue-700",
      Confirmed: "bg-indigo-100 text-indigo-700",
      Shipped: "bg-cyan-100 text-cyan-700",
      Delivered: "bg-emerald-100 text-emerald-700",
      Cancelled: "bg-red-100 text-red-700",
    };
    return map[s] || "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Eye className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ড্যাশবোর্ড</h1>
          <p className="text-sm text-gray-400">Overview</p>
        </div>
      </div>

      {/* Gradient Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {gradientCards.map((card) => (
          <div
            key={card.key}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg ${card.shadow} hover:scale-[1.02] transition-transform duration-300 cursor-default`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
            <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/5 translate-y-4 -translate-x-4" />
            <div className="relative z-10">
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/80 mb-1">{card.label}</p>
              <p className="text-2xl md:text-3xl font-extrabold">{getStatValue(card.key)}</p>
            </div>
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <card.icon className="h-5 w-5 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">সাম্প্রতিক অর্ডার</h2>
            </div>
            <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              সব দেখুন →
            </Link>
          </div>
        </div>
        <div className="p-4">
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <Inbox className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">কোনো অর্ডার নেই</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">অর্ডার</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">গ্রাহক</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">পরিমাণ</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr key={o.id} className={`hover:bg-gray-50/50 transition-colors ${i !== recentOrders.length - 1 ? "border-b border-gray-50" : ""}`}>
                      <td className="py-3 px-4">
                        <Link to="/admin/orders" className="text-blue-600 font-semibold hover:underline">{o.order_number}</Link>
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{o.customer_name}</td>
                      <td className="py-3 px-4 font-bold text-gray-800">৳{o.total_amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(o.order_status)}`}>{o.order_status}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString("bn-BD")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
          <div className="p-6 pb-4 border-b border-red-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center animate-pulse">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-700">স্টক কম আছে</h2>
                <p className="text-xs text-red-400">{lowStockProducts.length}টি পণ্যে স্টক কম</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-1">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 px-4 hover:bg-red-50/30 rounded-xl transition-colors">
                <Link to="/admin/products" className="text-sm text-gray-700 hover:text-blue-600 font-medium">{p.name}</Link>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  p.stock_quantity <= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {p.stock_quantity}টি বাকি
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
