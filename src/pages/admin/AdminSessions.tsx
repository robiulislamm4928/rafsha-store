import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2, Monitor, Smartphone, Laptop } from "lucide-react";

interface Session {
  id: string; user_email: string; login_success: boolean; is_active: boolean;
  login_at: string; last_seen_at: string | null; logged_out_at: string | null;
  ip_address: string | null; browser: string | null; device_type: string;
  location_info: string | null;
}

const deviceIcon = (type: string) => {
  if (type === "mobile") return <Smartphone className="h-4 w-4" />;
  if (type === "tablet") return <Laptop className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
};

const AdminSessions = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);

  const fetch = async () => {
    const { data } = await supabase.from("login_sessions").select("*").order("login_at", { ascending: false }).limit(100);
    setSessions((data as Session[]) || []);
  };
  useEffect(() => { fetch(); }, []);

  const terminate = async (id: string) => {
    await supabase.from("login_sessions").update({ is_active: false, logged_out_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "সেশন বন্ধ করা হয়েছে" }); fetch();
  };

  const del = async (id: string) => {
    await supabase.from("login_sessions").delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" }); fetch();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold text-foreground">লগইন সেশন</h1>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            <th className="p-3 font-medium text-muted-foreground">ইউজার</th>
            <th className="p-3 font-medium text-muted-foreground">ডিভাইস</th>
            <th className="p-3 font-medium text-muted-foreground">ব্রাউজার</th>
            <th className="p-3 font-medium text-muted-foreground">IP</th>
            <th className="p-3 font-medium text-muted-foreground">লগইন</th>
            <th className="p-3 font-medium text-muted-foreground">স্ট্যাটাস</th>
            <th className="p-3 font-medium text-muted-foreground">অ্যাকশন</th>
          </tr></thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3 text-foreground">{s.user_email}</td>
                <td className="p-3"><div className="flex items-center gap-1 text-muted-foreground">{deviceIcon(s.device_type)} {s.device_type}</div></td>
                <td className="p-3 text-muted-foreground">{s.browser || "—"}</td>
                <td className="p-3 text-muted-foreground text-xs">{s.ip_address || "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(s.login_at).toLocaleString("bn-BD")}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}>{s.is_active ? "সক্রিয়" : "বন্ধ"}</span></td>
                <td className="p-3"><div className="flex gap-1">
                  {s.is_active && <Button variant="ghost" size="sm" className="text-xs text-destructive h-7" onClick={() => terminate(s.id)}>বন্ধ করুন</Button>}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSessions;
