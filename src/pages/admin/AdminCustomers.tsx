import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, ShieldOff, Shield } from "lucide-react";

interface UserProfile { id: string; full_name: string; email: string; phone: string | null; is_blocked: boolean; created_at: string; }

const AdminCustomers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    setUsers((data as UserProfile[]) || []);
  };
  useEffect(() => { fetchUsers(); }, []);

  const toggleBlock = async (userId: string, blocked: boolean) => {
    await supabase.from("users").update({ is_blocked: blocked }).eq("id", userId);
    toast({ title: blocked ? "ব্লক করা হয়েছে" : "আনব্লক করা হয়েছে" });
    fetchUsers();
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.full_name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.phone || "").includes(s);
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold text-foreground">গ্রাহক ম্যানেজমেন্ট</h1>
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
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium text-foreground">{u.full_name}</td>
                <td className="p-3 text-foreground">{u.email}</td>
                <td className="p-3 text-foreground">{u.phone || "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("bn-BD")}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.is_blocked ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-700"}`}>{u.is_blocked ? "ব্লকড" : "সক্রিয়"}</span></td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => toggleBlock(u.id, !u.is_blocked)} className={u.is_blocked ? "text-green-600" : "text-destructive"}>
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
