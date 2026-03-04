import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Eye, TrendingUp } from "lucide-react";

interface DailyView { date: string; count: number; }
interface PopularPage { page_path: string; count: number; }

const AdminAnalytics = () => {
  const [dailyViews, setDailyViews] = useState<DailyView[]>([]);
  const [popularPages, setPopularPages] = useState<PopularPage[]>([]);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: views } = await supabase.from("page_views").select("page_path, created_at");

      if (!views) return;
      setTotalViews(views.length);

      // Daily counts
      const dailyMap: Record<string, number> = {};
      views.forEach((v) => {
        const date = new Date(v.created_at).toLocaleDateString("en-CA");
        dailyMap[date] = (dailyMap[date] || 0) + 1;
      });
      const dailyArr = Object.entries(dailyMap).sort().slice(-14).map(([date, count]) => ({ date, count }));
      setDailyViews(dailyArr);

      // Popular pages
      const pageMap: Record<string, number> = {};
      views.forEach((v) => { pageMap[v.page_path] = (pageMap[v.page_path] || 0) + 1; });
      const pageArr = Object.entries(pageMap).map(([page_path, count]) => ({ page_path, count })).sort((a, b) => b.count - a.count).slice(0, 10);
      setPopularPages(pageArr);
    };
    fetchAnalytics();
  }, []);

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
            <TrendingUp className="h-5 w-5 text-honey-gold" />
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
              <Line type="monotone" dataKey="count" stroke="hsl(36, 85%, 48%)" strokeWidth={2} dot={{ fill: "hsl(36, 85%, 48%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">জনপ্রিয় পেজ</CardTitle></CardHeader>
        <CardContent>
          {popularPages.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularPages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="page_path" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(36, 85%, 48%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">কোনো ডেটা নেই</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
