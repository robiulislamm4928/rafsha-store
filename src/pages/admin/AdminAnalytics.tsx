import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      // Page views
      if (viewsRes.data) {
        setTotalViews(viewsRes.data.length);
        const dailyMap: Record<string, number> = {};
        viewsRes.data.forEach((v) => {
          const date = new Date(v.created_at).toLocaleDateString("en-CA");
          dailyMap[date] = (dailyMap[date] || 0) + 1;
        });
        setDailyViews(Object.entries(dailyMap).sort().slice(-14).map(([date, count]) => ({ date, count })));
      }

      // Orders & Revenue
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

      // Popular products
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

  const chartColor = "hsl(var(--primary))";
  const accentColor = "hsl(var(--accent))";

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">অ্যানালিটিক্স</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">অ্যানালিটিক্স</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">মোট রেভিনিউ</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">৳{totalRevenue.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">মোট অর্ডার</CardTitle>
            <ShoppingCart className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{totalOrders}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">মোট পেজ ভিউ</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{totalViews.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">মোট গ্রাহক</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{totalCustomers}</p></CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader><CardTitle className="text-lg">দৈনিক রেভিনিউ (গত ১৪ দিন)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, "রেভিনিউ"]} />
              <Area type="monotone" dataKey="revenue" stroke={chartColor} fill={chartColor} fillOpacity={0.15} strokeWidth={2} name="রেভিনিউ" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Page Views Chart */}
      <Card>
        <CardHeader><CardTitle className="text-lg">দৈনিক পেজ ভিউ (গত ১৪ দিন)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyViews}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke={chartColor} strokeWidth={2} dot={{ fill: chartColor }} name="ভিউ" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Order Trend */}
      <Card>
        <CardHeader><CardTitle className="text-lg">দৈনিক অর্ডার (গত ১৪ দিন)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill={accentColor} radius={[4, 4, 0, 0]} name="অর্ডার সংখ্যা" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Popular Products */}
      <Card>
        <CardHeader><CardTitle className="text-lg">জনপ্রিয় পণ্য</CardTitle></CardHeader>
        <CardContent>
          {popularProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill={chartColor} radius={[0, 4, 4, 0]} name="বিক্রিত সংখ্যা" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">কোনো ডেটা নেই</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
