import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Upload, X, ImageIcon } from "lucide-react";

interface KeyPoint {
  id: string;
  title: string;
  description: string;
  icon_url: string | null;
  display_order: number;
  is_active: boolean;
}

const empty: KeyPoint = { id: "", title: "", description: "", icon_url: null, display_order: 0, is_active: true };

const AdminKeyPoints = () => {
  const [items, setItems] = useState<KeyPoint[]>([]);
  const [editing, setEditing] = useState<KeyPoint | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const { data } = await supabase.from("key_points").select("*").order("display_order");
    if (data) setItems(data as KeyPoint[]);
  };

  useEffect(() => { fetchData(); }, []);

  const uploadIcon = async (file: File) => {
    const allowed = ["image/svg+xml", "image/png", "image/webp", "image/jpeg"];
    if (!allowed.includes(file.type)) {
      toast.error("SVG, PNG, WebP বা JPG ফাইল আপলোড করুন");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      toast.error("ফাইল সাইজ ১MB এর কম হতে হবে");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `keypoint-icon-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("banners").upload(path, file, { upsert: true });
    if (error) {
      setUploading(false);
      toast.error("আপলোড ব্যর্থ");
      return;
    }
    const { data: urlData } = supabase.storage.from("banners").getPublicUrl(path);
    setEditing((prev) => prev ? { ...prev, icon_url: urlData.publicUrl } : prev);
    setUploading(false);
    toast.success("আইকন আপলোড হয়েছে");
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast.error("টাইটেল দিন"); return; }
    setSaving(true);

    if (editing.id) {
      const { error } = await supabase.from("key_points").update({
        title: editing.title,
        description: editing.description,
        icon_url: editing.icon_url,
        display_order: editing.display_order,
        is_active: editing.is_active,
      }).eq("id", editing.id);
      if (error) toast.error("আপডেট ব্যর্থ");
      else toast.success("আপডেট হয়েছে");
    } else {
      const { error } = await supabase.from("key_points").insert({
        title: editing.title,
        description: editing.description,
        icon_url: editing.icon_url,
        display_order: editing.display_order,
        is_active: editing.is_active,
      });
      if (error) toast.error("যোগ করা ব্যর্থ");
      else toast.success("যোগ হয়েছে");
    }

    setSaving(false);
    setEditing(null);
    fetchData();
  };

  const del = async (id: string) => {
    await supabase.from("key_points").delete().eq("id", id);
    toast.success("মুছে ফেলা হয়েছে");
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">কী পয়েন্টস / ফিচার</h1>
          <p className="text-sm text-muted-foreground">হোমপেজে দেখানো ফিচার কার্ডগুলো ম্যানেজ করুন</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="brand-gradient text-primary-foreground hover:opacity-90 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1" /> নতুন যোগ করুন
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">আইকন</TableHead>
              <TableHead>টাইটেল</TableHead>
              <TableHead className="hidden sm:table-cell">বিবরণ</TableHead>
              <TableHead className="w-20">ক্রম</TableHead>
              <TableHead className="w-20">স্ট্যাটাস</TableHead>
              <TableHead className="w-24">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  কোনো ফিচার যোগ করা হয়নি
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.icon_url ? (
                      <img src={item.icon_url} alt="" className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{item.description}</TableCell>
                  <TableCell>{item.display_order}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {item.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ ...item })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>মুছে ফেলতে চান?</AlertDialogTitle>
                            <AlertDialogDescription>"{item.title}" মুছে ফেলা হবে।</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>না</AlertDialogCancel>
                            <AlertDialogAction onClick={() => del(item.id)}>হ্যাঁ, মুছুন</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "ফিচার সম্পাদনা" : "নতুন ফিচার যোগ"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>টাইটেল</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="যেমন: দ্রুত ডেলিভারি" />
              </div>
              <div className="space-y-2">
                <Label>সংক্ষিপ্ত বিবরণ</Label>
                <Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="যেমন: সারাদেশে পৌঁছে যাবে" />
              </div>
              <div className="space-y-2">
                <Label>আইকন (SVG/PNG)</Label>
                <div className="flex items-center gap-3 flex-wrap">
                  {editing.icon_url && (
                    <div className="relative">
                      <img src={editing.icon_url} alt="" className="h-12 w-12 object-contain rounded-lg border border-border p-1" />
                      <button onClick={() => setEditing({ ...editing, icon_url: null })} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <input type="file" ref={fileRef} accept=".svg,image/svg+xml,image/png,image/webp,image/jpeg" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadIcon(e.target.files[0]); }} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Upload className="h-4 w-4 mr-1" /> {uploading ? "আপলোড হচ্ছে..." : "আইকন আপলোড"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">SVG ফাইল সবচেয়ে ভালো কাজ করে। সর্বোচ্চ ১MB।</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ক্রম</Label>
                  <Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <Switch checked={editing.is_active} onCheckedChange={(checked) => setEditing({ ...editing, is_active: checked })} />
                  <Label>সক্রিয়</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>বাতিল</Button>
                <Button onClick={save} disabled={saving} className="brand-gradient text-primary-foreground hover:opacity-90">
                  {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKeyPoints;
