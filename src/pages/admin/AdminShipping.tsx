import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Zone { id: string; zone_name: string; delivery_charge: number; is_active: boolean; }

const AdminShipping = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [editing, setEditing] = useState<Partial<Zone> | null>(null);

  const fetchData = async () => {
    const { data } = await supabase.from("shipping_zones").select("*").order("zone_name");
    setZones((data as Zone[]) || []);
  };
  useEffect(() => { fetchData(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.id) {
      await supabase.from("shipping_zones").insert({ ...editing, id: crypto.randomUUID() } as any);
      toast.success("শিপিং জোন তৈরি হয়েছে");
    } else {
      await supabase.from("shipping_zones").update(editing as any).eq("id", editing.id);
      toast.success("শিপিং জোন আপডেট হয়েছে");
    }
    setEditing(null); fetchData();
  };

  const del = async (id: string) => {
    await supabase.from("shipping_zones").delete().eq("id", id);
    toast.success("মুছে ফেলা হয়েছে"); fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">শিপিং জোন</h1>
        <Button onClick={() => setEditing({ zone_name: "", delivery_charge: 0, is_active: true })} className="honey-gradient text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4 mr-1" /> নতুন</Button>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            <th className="p-3 font-medium text-muted-foreground">জোনের নাম</th>
            <th className="p-3 font-medium text-muted-foreground">ডেলিভারি চার্জ</th>
            <th className="p-3 font-medium text-muted-foreground">স্ট্যাটাস</th>
            <th className="p-3 font-medium text-muted-foreground">অ্যাকশন</th>
          </tr></thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium text-foreground">{z.zone_name}</td>
                <td className="p-3">৳{z.delivery_charge}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${z.is_active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>{z.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span></td>
                <td className="p-3"><div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(z)}><Edit className="h-3.5 w-3.5" /></Button>
                  <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>মুছে ফেলতে চান?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>বাতিল</AlertDialogCancel><AlertDialogAction onClick={() => del(z.id)} className="bg-destructive text-destructive-foreground">মুছুন</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent><DialogHeader><DialogTitle className="font-display">{editing?.id ? "সম্পাদনা" : "নতুন শিপিং জোন"}</DialogTitle></DialogHeader>
          {editing && <div className="space-y-3">
            <div className="space-y-2"><Label>জোনের নাম</Label><Input value={editing.zone_name || ""} onChange={(e) => setEditing({ ...editing, zone_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>ডেলিভারি চার্জ (৳)</Label><Input type="number" value={editing.delivery_charge || 0} onChange={(e) => setEditing({ ...editing, delivery_charge: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /><Label>সক্রিয়</Label></div>
            <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setEditing(null)}>বাতিল</Button><Button onClick={save} className="honey-gradient text-primary-foreground hover:opacity-90">সংরক্ষণ</Button></div>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminShipping;
