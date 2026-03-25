import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { Eye, TrendingUp, ShoppingBag, DollarSign, ShoppingCart, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyView { date: string; count: number; }
interface DailyRevenue { date: string; revenue: number; orders: number; }
interface PopularProduct { name: string; count: number; }

const AdminAnalytics = () => {
  const [dailyViews, setDailyViews] = useState<DailyView[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const [viewsRes, ordersRes, orderItemsRes, usersRes] = await Promise.all([
        supabase.from("page_views").select("created_at").limit(5000),
        supabase.from("orders").select("created_at, total_amount, order_status").limit(5000),
        supabase.from("order_items").select("product_name_snapshot, quantity").limit(5000),
        supabase.from("users").select("id", { count: "exact", head: true }),
      ]);

      if (viewsRes.data) {
        setTotalViews(viewsRes.data.length);
        const dailyMap: Record<string, number> = {};
        viewsRes.data.forEach((v) => {
          const date = new Date(v.created_at).toLocaleDateString("en-CA");
          dailyMap[date] = (dailyMap[date] || 0) + 1;
        });
        setDailyViews(Object.entries(dailyMap).sort().slice(-14).map(([date, count]) => ({ date, count })));
      }

      if (ordersRes.data) {
        const validOrders = ordersRes.data.filter((o) => o.order_status !== "Cancelled");
        setTotalOrders(validOrders.length);
        setTotalRevenue(validOrders.reduce((s, o) => s + (o.total_amount || 0), 0));

        const revenueMap: Record<string, { revenue: number; orders: number }> = {};
        validOrders.forEach((o) => {
          const date = new Date(o.created_at).toLocaleDateString("en-CA");
          if (!revenueMap[date]) revenueMap[date] = { revenue: 0, orders: 0 };
          revenueMap[date].revenue += o.total_amount || 0;
          revenueMap[date].orders += 1;
        });
        setDailyRevenue(Object.entries(revenueMap).sort().slice(-14).map(([date, d]) => ({ date, ...d })));
      }

      if (orderItemsRes.data) {
        const productMap: Record<string, number> = {};
        orderItemsRes.data.forEach((item) => {
          productMap[item.product_name_snapshot] = (productMap[item.product_name_snapshot] || 0) + item.quantity;
        });
        setPopularProducts(Object.entries(productMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10));
      }

      setTotalCustomers(usersRes.count || 0);
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const metricCards = [
    { label: "মোট রেভিনিউ", value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, gradient: "from-blue-500 via-blue-600 to-indigo-700", shadow: "shadow-blue-500/30" },
    { label: "মোট অর্ডার", value: totalOrders, icon: ShoppingCart, gradient: "from-purple-500 via-purple-600 to-violet-700", shadow: "shadow-purple-500/30" },
    { label: "মোট পেজ ভিউ", value: totalViews.toLocaleString(), icon: Eye, gradient: "from-emerald-400 via-green-500 to-teal-600", shadow: "shadow-green-500/30" },
    { label: "মোট গ্রাহক", value: totalCustomers, icon: Users, gradient: "from-pink-400 via-rose-500 to-red-600", shadow: "shadow-pink-500/30" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">অ্যানালিটিক্স</h1>
          <p className="text-sm text-gray-400">Reports & Analytics</p>
        </div>
      </div>

      {/* Gradient Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg ${card.shadow} hover:scale-[1.02] transition-transform duration-300`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
            <div className="relative z-10">
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/80 mb-1">{card.label}</p>
              <p className="text-2xl md:text-3xl font-extrabold">{card.value}</p>
            </div>
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <card.icon className="h-5 w-5 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">দৈনিক রেভিনিউ (গত ১৪ দিন)</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyRevenue}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, "রেভিনিউ"]} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revenueGrad)" strokeWidth={3} name="রেভিনিউ" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Page Views Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Eye className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">দৈনিক পেজ ভিউ (গত ১৪ দিন)</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyViews}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} name="ভিউ" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">দৈনিক অর্ডার</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip />
              <Bar dataKey="orders" fill="url(#orderGrad)" radius={[8, 8, 0, 0]} name="অর্ডার সংখ্যা" />
              <defs>
                <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">জনপ্রিয় পণ্য</h2>
          </div>
          {popularProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: "#6b7280" }} />
                <Tooltip />
                <Bar dataKey="count" fill="url(#popGrad)" radius={[0, 8, 8, 0]} name="বিক্রিত সংখ্যা" />
                <defs>
                  <linearGradient id="popGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <ShoppingBag className="h-7 w-7 text-gray-300" />
              </div>
              <p className="text-gray-400">কোনো ডেটা নেই</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
