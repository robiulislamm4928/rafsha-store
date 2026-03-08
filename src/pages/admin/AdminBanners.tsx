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
import { Plus, Edit, Trash2, Inbox, Upload, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Banner {
  id: string; heading: string | null; subtext: string | null; cta_label: string | null; cta_link: string | null;
  desktop_image_url: string; mobile_image_url: string | null; type: string; is_active: boolean; display_order: number;
}

const emptyBanner = (): Partial<Banner> => ({
  heading: "", subtext: "", cta_label: "", cta_link: "",
  desktop_image_url: "", mobile_image_url: "", type: "hero",
  is_active: true, display_order: 0,
});

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("display_order");
    setBanners((data as Banner[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const filePath = `${path}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("banners").upload(filePath, file);
    if (error) { toast.error("আপলোড ব্যর্থ: " + error.message); return null; }
    const { data } = supabase.storage.from("banners").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "desktop_image_url" | "mobile_image_url") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, field === "desktop_image_url" ? "desktop" : "mobile");
    if (url) setEditing((prev) => prev ? { ...prev, [field]: url } : null);
    setUploading(false);
  };

  const saveBanner = async () => {
    if (!editing || !editing.desktop_image_url) {
      toast.error("ডেস্কটপ ইমেজ আবশ্যক"); return;
    }
    const isNew = !editing.id;
    if (isNew) {
      const { error } = await supabase.from("banners").insert({ ...editing, id: crypto.randomUUID() } as any);
      if (error) { toast.error(error.message); return; }
      toast.success("ব্যানার তৈরি হয়েছে");
    } else {
      const { error } = await supabase.from("banners").update(editing as any).eq("id", editing.id!);
      if (error) { toast.error(error.message); return; }
      toast.success("ব্যানার আপডেট হয়েছে");
    }
    setEditing(null); fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    await supabase.from("banners").delete().eq("id", id);
    toast.success("ব্যানার মুছে ফেলা হয়েছে"); fetchBanners();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">ব্যানার ম্যানেজমেন্ট</h1>
        <Button onClick={() => setEditing(emptyBanner())} className="brand-gradient text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4 mr-1" /> নতুন ব্যানার
        </Button>
      </div>

      <div className="bg-muted/50 rounded-lg p-3 md:p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">ব্যানার সাইজ গাইড:</p>
        <p>📐 <strong>হিরো ব্যানার:</strong> <strong>1920×840px</strong> (16:7 অনুপাত) — ডেস্কটপ ও মোবাইল উভয়ে একই সাইজ ব্যবহার হবে</p>
        <p>📱 <strong>মোবাইল ব্যানার (ঐচ্ছিক):</strong> <strong>768×430px</strong> — আপলোড করলে মোবাইলে এটি দেখাবে</p>
        <p>🎯 <strong>প্রমোশনাল ব্যানার:</strong> <strong>800×400px</strong></p>
        <p className="text-xs mt-1">💡 সেরা ফলাফলের জন্য JPG/WebP ফরম্যাটে ২MB এর নিচে রাখুন</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-3 font-medium text-muted-foreground">প্রিভিউ</th>
              <th className="p-3 font-medium text-muted-foreground">শিরোনাম</th>
              <th className="p-3 font-medium text-muted-foreground">ধরন</th>
              <th className="p-3 font-medium text-muted-foreground">ক্রম</th>
              <th className="p-3 font-medium text-muted-foreground">স্ট্যাটাস</th>
              <th className="p-3 font-medium text-muted-foreground">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4"><div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div></td></tr>
            ) : banners.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center"><Inbox className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" /><p className="text-muted-foreground">কোনো ব্যানার নেই</p></td></tr>
            ) : banners.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <img src={b.desktop_image_url} alt={b.heading || "Banner"} className="h-14 w-24 object-cover rounded-md border border-border" />
                </td>
                <td className="p-3">
                  <p className="font-medium text-foreground">{b.heading || "—"}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{b.subtext || ""}</p>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.type === "hero" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                    {b.type === "hero" ? "হিরো" : "প্রমোশনাল"}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{b.display_order}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.is_active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>
                    {b.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(b)}><Edit className="h-3.5 w-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>ব্যানার মুছে ফেলতে চান?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteBanner(b.id)} className="bg-destructive text-destructive-foreground">মুছুন</AlertDialogAction>
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

      {/* Banner Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing?.id ? "ব্যানার সম্পাদনা" : "নতুন ব্যানার"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ধরন</Label>
                <Select value={editing.type || "hero"} onValueChange={(v) => setEditing({ ...editing, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">হিরো ব্যানার</SelectItem>
                    <SelectItem value="promotional">প্রমোশনাল ব্যানার</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Image Upload */}
              <div className="space-y-2">
                <Label>ডেস্কটপ ইমেজ *</Label>
                {editing.desktop_image_url && (
                  <img src={editing.desktop_image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-border" />
                )}
                <label className="block">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "desktop_image_url")} />
                  <Button type="button" variant="outline" className="w-full" disabled={uploading} asChild>
                    <span><Upload className="h-4 w-4 mr-1" />{uploading ? "আপলোড হচ্ছে..." : "ডেস্কটপ ছবি আপলোড করুন"}</span>
                  </Button>
                </label>
              </div>

              {/* Mobile Image Upload */}
              <div className="space-y-2">
                <Label>মোবাইল ইমেজ (ঐচ্ছিক)</Label>
                {editing.mobile_image_url && (
                  <img src={editing.mobile_image_url} alt="Mobile Preview" className="w-32 h-24 object-cover rounded-lg border border-border" />
                )}
                <label className="block">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "mobile_image_url")} />
                  <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                    <span><ImageIcon className="h-3.5 w-3.5 mr-1" />মোবাইল ছবি আপলোড</span>
                  </Button>
                </label>
              </div>

              <div className="space-y-2"><Label>শিরোনাম</Label><Input value={editing.heading || ""} onChange={(e) => setEditing({ ...editing, heading: e.target.value })} /></div>
              <div className="space-y-2"><Label>সাব-টেক্সট</Label><Input value={editing.subtext || ""} onChange={(e) => setEditing({ ...editing, subtext: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>CTA লেবেল</Label><Input value={editing.cta_label || ""} onChange={(e) => setEditing({ ...editing, cta_label: e.target.value })} placeholder="এখনই কিনুন" /></div>
                <div className="space-y-2"><Label>CTA লিঙ্ক</Label><Input value={editing.cta_link || ""} onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })} placeholder="/products" /></div>
              </div>
              <div className="space-y-2"><Label>ডিসপ্লে ক্রম</Label><Input type="number" value={editing.display_order || 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-2"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /><Label>সক্রিয়</Label></div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setEditing(null)}>বাতিল</Button>
                <Button onClick={saveBanner} disabled={uploading} className="brand-gradient text-primary-foreground hover:opacity-90">সংরক্ষণ</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBanners;
