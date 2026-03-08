import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Check, X, Trash2, MessageSquare, Plus, Upload, Pencil } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: string; reviewer_name: string; reviewer_location: string | null;
  rating: number; review_text: string | null; is_approved: boolean;
   created_at: string; product_id: string; user_id: string | null;
  reviewer_image_url: string | null; social_link: string | null; social_platform: string | null;
}

interface Product { id: string; name: string; }

const socialPlatforms = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "Twitter" },
];

const emptyForm = {
  reviewer_name: "", reviewer_location: "", rating: 5, review_text: "",
  product_id: "", reviewer_image_url: "", social_link: "", social_platform: "",
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchData = async () => {
    const [rRes, pRes] = await Promise.all([
      supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("products").select("id, name").eq("is_active", true),
    ]);
    setReviews((rRes.data as Review[]) || []);
    setProducts((pRes.data as Product[]) || []);
  };
  useEffect(() => { fetchData(); }, []);

  const approve = async (id: string, val: boolean) => {
    await supabase.from("reviews").update({ is_approved: val }).eq("id", id);
    toast.success(val ? "অনুমোদিত হয়েছে" : "প্রত্যাখ্যাত হয়েছে"); fetchData();
  };

  const del = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    toast.success("রিভিউ মুছে ফেলা হয়েছে"); fetchData();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("review-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("review-images").getPublicUrl(path);
    setForm((prev) => ({ ...prev, reviewer_image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditing(null);
    setAdding(true);
  };

  const openEdit = (r: Review) => {
    setForm({
      reviewer_name: r.reviewer_name,
      reviewer_location: r.reviewer_location || "",
      rating: r.rating,
      review_text: r.review_text || "",
      product_id: r.product_id,
      reviewer_image_url: r.reviewer_image_url || "",
      social_link: r.social_link || "",
      social_platform: r.social_platform || "",
    });
    setEditing(r.id);
    setAdding(true);
  };

  const handleSave = async () => {
    if (!form.product_id || !form.reviewer_name) {
      toast.error("পণ্য ও নাম আবশ্যক"); return;
    }
    const payload = {
      product_id: form.product_id,
      reviewer_name: form.reviewer_name,
      reviewer_location: form.reviewer_location || null,
      rating: form.rating,
      review_text: form.review_text || null,
      reviewer_image_url: form.reviewer_image_url || null,
      social_link: form.social_link || null,
      social_platform: form.social_platform || null,
      review_image_url: form.review_image_url || null,
    };

    if (editing) {
      const { error } = await supabase.from("reviews").update(payload).eq("id", editing);
      if (error) { toast.error(error.message); return; }
      toast.success("রিভিউ আপডেট হয়েছে");
    } else {
      const { error } = await supabase.from("reviews").insert({ id: crypto.randomUUID(), ...payload, is_approved: true });
      if (error) { toast.error(error.message); return; }
      toast.success("রিভিউ যোগ হয়েছে");
    }
    setAdding(false);
    setEditing(null);
    setForm({ ...emptyForm });
    fetchData();
  };

  const getProductName = (pid: string) => products.find(p => p.id === pid)?.name || "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">রিভিউ ম্যানেজমেন্ট</h1>
        <Button onClick={openAdd} className="brand-gradient text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4 mr-1" /> রিভিউ যোগ করুন
        </Button>
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">কোনো রিভিউ নেই</p>
          </div>
        ) : reviews.map((r) => (
          <div key={r.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3 flex-1">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={r.reviewer_image_url || undefined} />
                  <AvatarFallback className="text-xs">{r.reviewer_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "text-accent fill-accent" : "text-border"}`} />
                    ))}
                  </div>
                  {r.review_text && <p className="text-sm text-foreground/80 mb-2">"{r.review_text}"</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="font-medium text-foreground">{r.reviewer_name}</span>
                    {r.reviewer_location && <span>{r.reviewer_location}</span>}
                    <span className="text-primary/70">{getProductName(r.product_id)}</span>
                    {r.social_platform && <span className="text-accent">{r.social_platform}</span>}
                    <span>{new Date(r.created_at).toLocaleDateString("bn-BD")}</span>
                    <span className={`px-2 py-0.5 rounded-full ${r.is_approved ? "bg-success/10 text-success" : "bg-accent/20 text-accent"}`}>
                      {r.is_approved ? "অনুমোদিত" : "পেন্ডিং"}
                    </span>
                    {r.user_id && <span className="text-primary/50">গ্রাহক রিভিউ</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0 ml-3">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => openEdit(r)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {!r.is_approved && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => approve(r.id, true)}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                {r.is_approved && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-accent" onClick={() => approve(r.id, false)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>মুছে ফেলতে চান?</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল</AlertDialogCancel>
                      <AlertDialogAction onClick={() => del(r.id)} className="bg-destructive text-destructive-foreground">মুছুন</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Review Dialog */}
      <Dialog open={adding} onOpenChange={(open) => { setAdding(open); if (!open) setEditing(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing ? "রিভিউ সম্পাদনা করুন" : "নতুন রিভিউ যোগ করুন"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>পণ্য *</Label>
              <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                <SelectTrigger><SelectValue placeholder="পণ্য বেছে নিন" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>রিভিউয়ার নাম *</Label><Input value={form.reviewer_name} onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>লোকেশন</Label><Input value={form.reviewer_location} onChange={(e) => setForm({ ...form, reviewer_location: e.target.value })} placeholder="ঢাকা" /></div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label>রিভিউয়ারের ছবি</Label>
              <div className="flex items-center gap-3">
                {form.reviewer_image_url && (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={form.reviewer_image_url} />
                    <AvatarFallback>{form.reviewer_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm hover:bg-muted transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "reviewer_image_url")} disabled={uploading} />
                </label>
              </div>
            </div>

            {/* Product review image upload */}
            <div className="space-y-2">
              <Label>পণ্যের ছবি (ঐচ্ছিক)</Label>
              <div className="flex items-center gap-3">
                {form.review_image_url && (
                  <img src={form.review_image_url} alt="product" className="h-16 w-16 rounded-lg object-cover border border-border" />
                )}
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm hover:bg-muted transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "আপলোড হচ্ছে..." : "পণ্যের ছবি আপলোড"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "review_image_url")} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>রেটিং</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}>
                    <Star className={`h-6 w-6 cursor-pointer ${s <= form.rating ? "text-accent fill-accent" : "text-border"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2"><Label>রিভিউ টেক্সট</Label><Textarea value={form.review_text} onChange={(e) => setForm({ ...form, review_text: e.target.value })} rows={3} /></div>

            {/* Social link */}
            <div className="space-y-2">
              <Label>সোশ্যাল প্ল্যাটফর্ম</Label>
              <Select value={form.social_platform} onValueChange={(v) => setForm({ ...form, social_platform: v })}>
                <SelectTrigger><SelectValue placeholder="প্ল্যাটফর্ম বেছে নিন (ঐচ্ছিক)" /></SelectTrigger>
                <SelectContent>
                  {socialPlatforms.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>সোশ্যাল লিংক</Label><Input value={form.social_link} onChange={(e) => setForm({ ...form, social_link: e.target.value })} placeholder="https://facebook.com/..." /></div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setAdding(false); setEditing(null); }}>বাতিল</Button>
              <Button onClick={handleSave} className="brand-gradient text-primary-foreground hover:opacity-90">{editing ? "আপডেট করুন" : "যোগ করুন"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
