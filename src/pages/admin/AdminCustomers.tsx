import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShieldOff, Shield, Users, FileDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile { id: string; full_name: string; email: string; phone: string | null; is_blocked: boolean; created_at: string; }

const AdminCustomers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false }).limit(500);
    setUsers((data as UserProfile[]) || []);
    setLoading(false);
  };
  useEffect(() => { fetchUsers(); }, []);

  const toggleBlock = async (userId: string, blocked: boolean) => {
    await supabase.from("users").update({ is_blocked: blocked }).eq("id", userId);
    toast.success(blocked ? "ব্লক করা হয়েছে" : "আনব্লক করা হয়েছে");
    fetchUsers();
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.full_name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.phone || "").includes(s);
  });

  const exportCSV = () => {
    const headers = ["Name","Email","Phone","Status","Joined"];
    const rows = filtered.map(u => [u.full_name, u.email, u.phone || "", u.is_blocked ? "Blocked" : "Active", new Date(u.created_at).toLocaleDateString("en-GB")]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `customers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV ডাউনলোড হয়েছে");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">গ্রাহক ম্যানেজমেন্ট</h1>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <FileDown className="h-4 w-4 mr-1.5" /> CSV এক্সপোর্ট
        </Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="নাম, ইমেইল বা ফোন খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            <th className="p-3 font-medium text-muted-foreground">নাম</th>
            <th className="p-3 font-medium text-muted-foreground">ইমেইল</th>
            <th className="p-3 font-medium text-muted-foreground">ফোন</th>
            <th className="p-3 font-medium text-muted-foreground">যোগদান</th>
            <th className="p-3 font-medium text-muted-foreground">স্ট্যাটাস</th>
            <th className="p-3 font-medium text-muted-foreground">অ্যাকশন</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4"><div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center"><Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" /><p className="text-muted-foreground">কোনো গ্রাহক পাওয়া যায়নি</p></td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium text-foreground">{u.full_name}</td>
                <td className="p-3 text-foreground">{u.email}</td>
                <td className="p-3 text-foreground">{u.phone || "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("bn-BD")}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.is_blocked ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>{u.is_blocked ? "ব্লকড" : "সক্রিয়"}</span></td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => toggleBlock(u.id, !u.is_blocked)} className={u.is_blocked ? "text-success" : "text-destructive"}>
                    {u.is_blocked ? <><Shield className="h-3.5 w-3.5 mr-1" /> আনব্লক</> : <><ShieldOff className="h-3.5 w-3.5 mr-1" /> ব্লক</>}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
