import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Tag } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    code: "", discount_type: "fixed", discount_value: "", min_order_amount: "0", max_uses: "", expires_at: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons((data as Coupon[]) || []);
  };
  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async () => {
    if (!form.code.trim() || !form.discount_value) { toast.error("কোড এবং ডিসকাউন্ট মান দিন"); return; }
    setSaving(true);
    const { error } = await supabase.from("coupons").insert({
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type as any,
      discount_value: parseFloat(form.discount_value),
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
    } as any);
    setSaving(false);
    if (error) { toast.error("কুপন তৈরি ব্যর্থ: " + error.message); return; }
    toast.success("কুপন তৈরি হয়েছে");
    setForm({ code: "", discount_type: "fixed", discount_value: "", min_order_amount: "0", max_uses: "", expires_at: "" });
    setDialogOpen(false);
    fetchCoupons();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ is_active: active } as any).eq("id", id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("কুপন মুছে ফেলা হয়েছে");
    fetchCoupons();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">কুপন ম্যানেজমেন্ট</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brand-gradient text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4 mr-1" /> নতুন কুপন</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>নতুন কুপন তৈরি করুন</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>কুপন কোড *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SAVE20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ডিসকাউন্ট টাইপ</Label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">নির্দিষ্ট টাকা (৳)</SelectItem>
                      <SelectItem value="percentage">শতাংশ (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>ডিসকাউন্ট মান *</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder={form.discount_type === "fixed" ? "100" : "10"} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>মিনিমাম অর্ডার (৳)</Label><Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} /></div>
                <div className="space-y-2"><Label>সর্বোচ্চ ব্যবহার</Label><Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="সীমাহীন" /></div>
              </div>
              <div className="space-y-2"><Label>মেয়াদ শেষের তারিখ</Label><Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
              <Button onClick={handleCreate} disabled={saving} className="w-full brand-gradient text-primary-foreground hover:opacity-90">{saving ? "তৈরি হচ্ছে..." : "কুপন তৈরি করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            <th className="p-3 font-medium text-muted-foreground">কোড</th>
            <th className="p-3 font-medium text-muted-foreground">ডিসকাউন্ট</th>
            <th className="p-3 font-medium text-muted-foreground">মিনিমাম</th>
            <th className="p-3 font-medium text-muted-foreground">ব্যবহার</th>
            <th className="p-3 font-medium text-muted-foreground">স্ট্যাটাস</th>
            <th className="p-3 font-medium text-muted-foreground">অ্যাকশন</th>
          </tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3 font-mono font-bold text-foreground flex items-center gap-2"><Tag className="h-3.5 w-3.5 text-primary" />{c.code}</td>
                <td className="p-3 text-foreground">{c.discount_type === "fixed" ? `৳${c.discount_value}` : `${c.discount_value}%`}</td>
                <td className="p-3 text-foreground">৳{c.min_order_amount}</td>
                <td className="p-3 text-foreground">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                <td className="p-3"><Switch checked={c.is_active} onCheckedChange={(v) => toggleActive(c.id, v)} /></td>
                <td className="p-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>কুপন মুছে ফেলতে চান?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>বাতিল</AlertDialogCancel><AlertDialogAction onClick={() => deleteCoupon(c.id)} className="bg-destructive text-destructive-foreground">মুছুন</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">কোনো কুপন নেই</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoupons;
