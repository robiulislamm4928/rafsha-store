import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Category { id: string; name: string; slug: string; image_url: string | null; parent_id: string | null; is_active: boolean; display_order: number; }

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);

  const fetchData = async () => {
    const { data } = await supabase.from("categories").select("*").order("display_order");
    setCategories((data as Category[]) || []);
  };
  useEffect(() => { fetchData(); }, []);

  const save = async () => {
    if (!editing) return;
    const slug = editing.slug || editing.name?.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") || "";
    if (!editing.id) {
      const { error } = await supabase.from("categories").insert({ ...editing, id: crypto.randomUUID(), slug } as any);
      if (error) { toast.error(error.message); return; }
      toast.success("ক্যাটাগরি তৈরি হয়েছে");
    } else {
      const { error } = await supabase.from("categories").update({ ...editing, slug } as any).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("ক্যাটাগরি আপডেট হয়েছে");
    }
    setEditing(null); fetchData();
  };

  const del = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    toast.success("মুছে ফেলা হয়েছে"); fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">ক্যাটাগরি</h1>
        <Button onClick={() => setEditing({ name: "", slug: "", image_url: "", parent_id: null, is_active: true, display_order: 0 })} className="brand-gradient text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4 mr-1" /> নতুন</Button>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            <th className="p-3 font-medium text-muted-foreground">নাম</th>
            <th className="p-3 font-medium text-muted-foreground">স্লাগ</th>
            <th className="p-3 font-medium text-muted-foreground">ক্রম</th>
            <th className="p-3 font-medium text-muted-foreground">স্ট্যাটাস</th>
            <th className="p-3 font-medium text-muted-foreground">অ্যাকশন</th>
          </tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium text-foreground">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3">{c.display_order}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>{c.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span></td>
                <td className="p-3"><div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(c)}><Edit className="h-3.5 w-3.5" /></Button>
                  <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>মুছে ফেলতে চান?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>বাতিল</AlertDialogCancel><AlertDialogAction onClick={() => del(c.id)} className="bg-destructive text-destructive-foreground">মুছুন</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent><DialogHeader><DialogTitle className="font-display">{editing?.id ? "সম্পাদনা" : "নতুন ক্যাটাগরি"}</DialogTitle></DialogHeader>
          {editing && <div className="space-y-3">
            <div className="space-y-2"><Label>নাম</Label><Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>স্লাগ</Label><Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
            <div className="space-y-2"><Label>ছবি URL</Label><Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></div>
            <div className="space-y-2"><Label>প্যারেন্ট ক্যাটাগরি</Label>
              <Select value={editing.parent_id || "none"} onValueChange={(v) => setEditing({ ...editing, parent_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">কোনোটি নয়</SelectItem>{categories.filter((c) => c.id !== editing.id).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>ডিসপ্লে অর্ডার</Label><Input type="number" value={editing.display_order || 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /><Label>সক্রিয়</Label></div>
            <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setEditing(null)}>বাতিল</Button><Button onClick={save} className="brand-gradient text-primary-foreground hover:opacity-90">সংরক্ষণ</Button></div>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
