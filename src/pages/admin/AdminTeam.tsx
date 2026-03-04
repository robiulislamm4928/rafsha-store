import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface UserRole { id: string; user_id: string; role: string; }
interface UserProfile { id: string; full_name: string; email: string; }

const AdminTeam = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<(UserRole & { profile?: UserProfile })[]>([]);

  const fetch = async () => {
    const { data: roleData } = await supabase.from("user_roles").select("*").in("role", ["admin", "moderator"]);
    if (!roleData) return;

    const userIds = [...new Set(roleData.map((r) => r.user_id))];
    const { data: profiles } = await supabase.from("users").select("id, full_name, email").in("id", userIds);
    const profileMap: Record<string, UserProfile> = {};
    profiles?.forEach((p) => { profileMap[p.id] = p as UserProfile; });

    setRoles(roleData.map((r) => ({ ...r, profile: profileMap[r.user_id] })));
  };

  useEffect(() => { fetch(); }, []);

  const changeRole = async (id: string, newRole: string) => {
    await supabase.from("user_roles").update({ role: newRole as any }).eq("id", id);
    toast({ title: "রোল আপডেট হয়েছে" }); fetch();
  };

  const removeRole = async (id: string) => {
    await supabase.from("user_roles").delete().eq("id", id);
    toast({ title: "রোল মুছে ফেলা হয়েছে" }); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">টিম ম্যানেজমেন্ট</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4" /> {roles.length} জন সদস্য</div>
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
