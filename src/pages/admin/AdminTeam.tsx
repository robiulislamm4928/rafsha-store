import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Trash2, Plus, Info } from "lucide-react";

interface UserRole { id: string; user_id: string; role: string; }
interface UserProfile { id: string; full_name: string; email: string; }

const ROLE_ACCESS = {
  admin: [
    "সকল পেজে সম্পূর্ণ অ্যাক্সেস",
    "অর্ডার, পণ্য, ক্যাটাগরি, ব্যানার তৈরি/সম্পাদনা/মুছে ফেলা",
    "গ্রাহক ব্লক/আনব্লক",
    "শিপিং জোন ও সাইট সেটিংস পরিবর্তন",
    "কুপন তৈরি/মুছে ফেলা",
    "টিম সদস্য যোগ/মুছে ফেলা",
    "অ্যানালিটিক্স দেখা",
  ],
  moderator: [
    "অর্ডার দেখা ও স্ট্যাটাস আপডেট",
    "পণ্য দেখা (সম্পাদনা করতে পারবে না)",
    "লাইভ চ্যাটে গ্রাহকদের সাথে কথা বলা",
    "রিভিউ অনুমোদন/প্রত্যাখ্যান",
    "গ্রাহক তালিকা দেখা",
  ],
};

const AdminTeam = () => {
  const [roles, setRoles] = useState<(UserRole & { profile?: UserProfile })[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState("moderator");
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    const { data: roleData } = await supabase.from("user_roles").select("*").in("role", ["admin", "moderator"]);
    if (!roleData) return;
    const userIds = [...new Set(roleData.map((r) => r.user_id))];
    if (userIds.length === 0) { setRoles([]); return; }
    const { data: profiles } = await supabase.from("users").select("id, full_name, email").in("id", userIds);
    const profileMap: Record<string, UserProfile> = {};
    profiles?.forEach((p) => { profileMap[p.id] = p as UserProfile; });
    setRoles(roleData.map((r) => ({ ...r, profile: profileMap[r.user_id] })));
  };
  useEffect(() => { fetchData(); }, []);

  const addRoleByEmail = async () => {
    if (!email.trim()) { toast.error("ইমেইল দিন"); return; }
    setAdding(true);
    // Find user by email
    const { data: userData } = await supabase.from("users").select("id").eq("email", email.trim()).maybeSingle();
    if (!userData) { setAdding(false); toast.error("এই ইমেইলে কোনো ইউজার পাওয়া যায়নি। ইউজারকে আগে রেজিস্ট্রেশন করতে হবে।"); return; }
    // Check existing role
    const { data: existingRole } = await supabase.from("user_roles").select("id, role").eq("user_id", userData.id).in("role", ["admin", "moderator"]).maybeSingle();
    if (existingRole) { setAdding(false); toast.error(`এই ইউজারের ইতিমধ্যে "${existingRole.role}" রোল আছে`); return; }
    // Insert role
    const { error } = await supabase.from("user_roles").insert({ user_id: userData.id, role: newRole as any });
    setAdding(false);
    if (error) { toast.error("রোল যোগ করতে সমস্যা: " + error.message); return; }
    toast.success("রোল সফলভাবে যোগ করা হয়েছে");
    setEmail(""); setDialogOpen(false); fetchData();
  };

  const changeRole = async (id: string, role: string) => {
    await supabase.from("user_roles").update({ role: role as any }).eq("id", id);
    toast.success("রোল আপডেট হয়েছে"); fetchData();
  };

  const removeRole = async (id: string) => {
    await supabase.from("user_roles").delete().eq("id", id);
    toast.success("রোল মুছে ফেলা হয়েছে"); fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">টিম ম্যানেজমেন্ট</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4" /> {roles.length} জন সদস্য</div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="brand-gradient text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4 mr-1" /> রোল যোগ করুন</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>নতুন রোল অ্যাসাইন করুন</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ইউজারের ইমেইল (Gmail/Email) *</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@gmail.com" type="email" />
                  <p className="text-xs text-muted-foreground">ইউজারকে আগে সাইটে রেজিস্ট্রেশন করা থাকতে হবে</p>
                </div>
                <div className="space-y-2">
                  <Label>রোল</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (অ্যাডমিন)</SelectItem>
                      <SelectItem value="moderator">Moderator (মডারেটর)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Access info */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1"><Info className="h-3.5 w-3.5" /> {newRole === "admin" ? "অ্যাডমিন" : "মডারেটর"} যা যা করতে পারবে:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {ROLE_ACCESS[newRole as keyof typeof ROLE_ACCESS].map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span>{item}</li>
                    ))}
                  </ul>
                </div>
                <Button onClick={addRoleByEmail} disabled={adding} className="w-full brand-gradient text-primary-foreground hover:opacity-90">{adding ? "যোগ হচ্ছে..." : "রোল যোগ করুন"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Role access info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["admin", "moderator"] as const).map((role) => (
          <div key={role} className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
              <Shield className={`h-4 w-4 ${role === "admin" ? "text-primary" : "text-accent"}`} />
              {role === "admin" ? "অ্যাডমিন অ্যাক্সেস" : "মডারেটর অ্যাক্সেস"}
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              {ROLE_ACCESS[role].map((item, i) => (
                <li key={i} className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            <th className="p-3 font-medium text-muted-foreground">নাম</th>
            <th className="p-3 font-medium text-muted-foreground">ইমেইল</th>
            <th className="p-3 font-medium text-muted-foreground">রোল</th>
            <th className="p-3 font-medium text-muted-foreground">অ্যাকশন</th>
          </tr></thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium text-foreground">{r.profile?.full_name || "—"}</td>
                <td className="p-3 text-foreground">{r.profile?.email || "—"}</td>
                <td className="p-3">
                  <Select value={r.role} onValueChange={(v) => changeRole(r.id, v)}>
                    <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>রোল মুছে ফেলতে চান?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>বাতিল</AlertDialogCancel><AlertDialogAction onClick={() => removeRole(r.id)} className="bg-destructive text-destructive-foreground">মুছুন</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
            {roles.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">কোনো অ্যাডমিন/মডারেটর নেই</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTeam;
