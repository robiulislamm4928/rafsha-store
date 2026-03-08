import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Eye, TrendingUp, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyView { date: string; count: number; }
interface PopularProduct { name: string; count: number; }

const AdminAnalytics = () => {
  const [dailyViews, setDailyViews] = useState<DailyView[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Fetch page views
      const { data: views } = await supabase.from("page_views").select("created_at").limit(5000);

      if (views) {
        setTotalViews(views.length);
        const dailyMap: Record<string, number> = {};
        views.forEach((v) => {
          const date = new Date(v.created_at).toLocaleDateString("en-CA");
          dailyMap[date] = (dailyMap[date] || 0) + 1;
        });
        setDailyViews(Object.entries(dailyMap).sort().slice(-14).map(([date, count]) => ({ date, count })));
      }

      // Fetch popular products from order_items
      const { data: orderItems } = await supabase.from("order_items").select("product_name_snapshot, quantity").limit(5000);
      if (orderItems) {
        const productMap: Record<string, number> = {};
        orderItems.forEach((item) => {
          productMap[item.product_name_snapshot] = (productMap[item.product_name_snapshot] || 0) + item.quantity;
        });
        setPopularProducts(
          Object.entries(productMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        );
      }

      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const chartColor = "hsl(var(--primary))";

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">অ্যানালিটিক্স</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">অ্যানালিটিক্স</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">মোট পেজ ভিউ</CardTitle>
            <Eye className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-foreground">{totalViews.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">আজকের ভিউ</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-foreground">{dailyViews[dailyViews.length - 1]?.count || 0}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">দৈনিক পেজ ভিউ (গত ১৪ দিন)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyViews}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke={chartColor} strokeWidth={2} dot={{ fill: chartColor }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
