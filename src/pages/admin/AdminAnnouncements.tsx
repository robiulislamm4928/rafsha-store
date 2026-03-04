import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Inbox, Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Announcement {
  id: string;
  text: string;
  is_active: boolean;
  display_order: number;
}

const emptyAnnouncement = (): Partial<Announcement> => ({
  text: "", is_active: true, display_order: 0,
});

const AdminAnnouncements = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [editing, setEditing] = useState<Partial<Announcement> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase.from("announcements").select("*").order("display_order");
    setItems((data as Announcement[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const save = async () => {
    if (!editing || !editing.text?.trim()) {
      toast.error("টেক্সট আবশ্যক");
      return;
    }
    const isNew = !editing.id;
    if (isNew) {
      const { error } = await supabase.from("announcements").insert({ ...editing, id: crypto.randomUUID() } as any);
      if (error) { toast.error(error.message); return; }
      toast.success("অ্যানাউন্সমেন্ট তৈরি হয়েছে");
    } else {
      const { error } = await supabase.from("announcements").update(editing as any).eq("id", editing.id!);
      if (error) { toast.error(error.message); return; }
      toast.success("অ্যানাউন্সমেন্ট আপডেট হয়েছে");
    }
    setEditing(null);
    fetchAll();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    toast.success("অ্যানাউন্সমেন্ট মুছে ফেলা হয়েছে");
    fetchAll();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">অ্যানাউন্সমেন্ট বার</h1>
        <Button onClick={() => setEditing(emptyAnnouncement())} className="brand-gradient text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4 mr-1" /> নতুন টেক্সট
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        এই টেক্সটগুলো সাইটের একদম উপরে স্লাইডিং বার হিসেবে দেখাবে। একাধিক সক্রিয় টেক্সট থাকলে সব একসাথে স্লাইড করবে।
      </p>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-3 font-medium text-muted-foreground">টেক্সট</th>
              <th className="p-3 font-medium text-muted-foreground">ক্রম</th>
              <th className="p-3 font-medium text-muted-foreground">স্ট্যাটাস</th>
              <th className="p-3 font-medium text-muted-foreground">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4"><div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center"><Megaphone className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" /><p className="text-muted-foreground">কোনো অ্যানাউন্সমেন্ট নেই</p></td></tr>
            ) : items.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <p className="font-medium text-foreground line-clamp-2">{a.text}</p>
                </td>
                <td className="p-3 text-muted-foreground">{a.display_order}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.is_active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>
                    {a.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(a)}><Edit className="h-3.5 w-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>মুছে ফেলতে চান?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteItem(a.id)} className="bg-destructive text-destructive-foreground">মুছুন</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">{editing?.id ? "সম্পাদনা" : "নতুন অ্যানাউন্সমেন্ট"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>টেক্সট *</Label><Input value={editing.text || ""} onChange={(e) => setEditing({ ...editing, text: e.target.value })} placeholder="বিশেষ অফার! সকল পণ্যে ১০% ছাড়" /></div>
              <div className="space-y-2"><Label>ডিসপ্লে ক্রম</Label><Input type="number" value={editing.display_order || 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-2"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /><Label>সক্রিয়</Label></div>
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setEditing(null)}>বাতিল</Button>
                <Button onClick={save} className="brand-gradient text-primary-foreground hover:opacity-90">সংরক্ষণ</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAnnouncements;
