import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, X, Inbox, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string; name: string; slug: string; short_description: string | null; full_description: string | null;
  sku: string | null; category_id: string | null; regular_price: number; sale_price: number | null;
  stock_quantity: number; is_active: boolean; is_featured: boolean;
}
interface Category { id: string; name: string; }
interface Variant { id: string; variant_label: string; variant_type: string; price_adjustment: number; stock_quantity: number; is_active: boolean; }
interface ProductImage { id: string; image_url: string; display_order: number; }

const emptyProduct = (): Partial<Product> => ({
  name: "", slug: "", short_description: "", full_description: "", sku: "", category_id: null,
  regular_price: 0, sale_price: null, stock_quantity: 0, is_active: true, is_featured: false,
});

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newVariant, setNewVariant] = useState({ variant_label: "", price_adjustment: 0, stock_quantity: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(500);
    setProducts((data as Product[]) || []);
    setLoading(false);
  };
  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name").eq("is_active", true);
    setCategories((data as Category[]) || []);
  };
  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const openEdit = async (product?: Product) => {
    if (product) {
      setEditing(product);
      const [vRes, iRes] = await Promise.all([
        supabase.from("product_variants").select("*").eq("product_id", product.id),
        supabase.from("product_images").select("*").eq("product_id", product.id).order("display_order"),
      ]);
      setVariants((vRes.data as Variant[]) || []);
      setImages((iRes.data as ProductImage[]) || []);
    } else {
      setEditing(emptyProduct());
      setVariants([]);
      setImages([]);
    }
  };

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

  const saveProduct = async () => {
    if (!editing) return;
    const isNew = !editing.id;
    const slug = editing.slug || autoSlug(editing.name || "");
    if (isNew) {
      const id = crypto.randomUUID();
      const { error } = await supabase.from("products").insert({ ...editing, id, slug } as any);
      if (error) { toast.error(error.message); return; }
      toast.success("পণ্য তৈরি হয়েছে");
    } else {
      const { error } = await supabase.from("products").update({ ...editing, slug } as any).eq("id", editing.id!);
      if (error) { toast.error(error.message); return; }
      toast.success("পণ্য আপডেট হয়েছে");
    }
    setEditing(null);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast.success("পণ্য মুছে ফেলা হয়েছে");
    fetchProducts();
  };

  const addVariant = async () => {
    if (!editing?.id || !newVariant.variant_label) return;
    await supabase.from("product_variants").insert({ ...newVariant, product_id: editing.id, id: crypto.randomUUID() });
    setNewVariant({ variant_label: "", price_adjustment: 0, stock_quantity: 0 });
    const { data } = await supabase.from("product_variants").select("*").eq("product_id", editing.id);
    setVariants((data as Variant[]) || []);
    toast.success("ভ্যারিয়েন্ট যোগ হয়েছে");
  };

  const deleteVariant = async (vId: string) => {
    await supabase.from("product_variants").delete().eq("id", vId);
    setVariants((prev) => prev.filter((v) => v.id !== vId));
    toast.success("ভ্যারিয়েন্ট মুছে ফেলা হয়েছে");
  };

  const uploadImage = async (file: File) => {
    if (!editing?.id) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${editing.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(filePath, file);
    if (error) { toast.error("আপলোড ব্যর্থ: " + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
    
    await supabase.from("product_images").insert({
      product_id: editing.id,
      image_url: urlData.publicUrl,
      display_order: images.length,
      id: crypto.randomUUID(),
    });
    
    const { data } = await supabase.from("product_images").select("*").eq("product_id", editing.id).order("display_order");
    setImages((data as ProductImage[]) || []);
    setUploading(false);
    toast.success("ছবি যোগ হয়েছে");
  };

  const deleteImage = async (imgId: string) => {
    await supabase.from("product_images").delete().eq("id", imgId);
    setImages((prev) => prev.filter((i) => i.id !== imgId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">পণ্য ম্যানেজমেন্ট</h1>
        <Button onClick={() => openEdit()} className="brand-gradient text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4 mr-1" /> নতুন পণ্য</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-3 font-medium text-muted-foreground">পণ্য</th>
              <th className="p-3 font-medium text-muted-foreground">দাম</th>
              <th className="p-3 font-medium text-muted-foreground">স্টক</th>
              <th className="p-3 font-medium text-muted-foreground">স্ট্যাটাস</th>
              <th className="p-3 font-medium text-muted-foreground">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4"><div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center"><Inbox className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" /><p className="text-muted-foreground">কোনো পণ্য নেই</p></td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.slug}</p>
                </td>
                <td className="p-3">
                  <span className="font-medium">৳{p.sale_price ?? p.regular_price}</span>
                  {p.sale_price && <span className="text-xs text-muted-foreground line-through ml-1">৳{p.regular_price}</span>}
                </td>
                <td className="p-3">{p.stock_quantity === -1 ? <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">আনলিমিটেড</span> : p.stock_quantity}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>
                    {p.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>পণ্য মুছে ফেলতে চান?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProduct(p.id)} className="bg-destructive text-destructive-foreground">মুছুন</AlertDialogAction>
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

      {/* Product Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing?.id ? "পণ্য সম্পাদনা" : "নতুন পণ্য"}</DialogTitle></DialogHeader>
          {editing && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="general">সাধারণ</TabsTrigger>
                <TabsTrigger value="inventory">ইনভেন্টরি</TabsTrigger>
                <TabsTrigger value="variants" disabled={!editing.id}>ভ্যারিয়েন্ট</TabsTrigger>
                <TabsTrigger value="media" disabled={!editing.id}>মিডিয়া</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-3 mt-4">
                <div className="space-y-2"><Label>নাম</Label><Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>স্লাগ</Label><Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="auto-generated" /></div>
                <div className="space-y-2"><Label>ক্যাটাগরি</Label>
                  <Select value={editing.category_id || ""} onValueChange={(v) => setEditing({ ...editing, category_id: v || null })}>
                    <SelectTrigger><SelectValue placeholder="ক্যাটাগরি বেছে নিন" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>নিয়মিত দাম</Label><Input type="number" value={editing.regular_price || 0} onChange={(e) => setEditing({ ...editing, regular_price: Number(e.target.value) })} /></div>
                  <div className="space-y-2"><Label>সেল দাম</Label><Input type="number" value={editing.sale_price ?? ""} onChange={(e) => setEditing({ ...editing, sale_price: e.target.value ? Number(e.target.value) : null })} placeholder="ঐচ্ছিক" /></div>
                </div>
                <div className="space-y-2"><Label>সংক্ষিপ্ত বিবরণ</Label><Textarea value={editing.short_description || ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} rows={2} /></div>
                <div className="space-y-2"><Label>বিস্তারিত বিবরণ</Label><Textarea value={editing.full_description || ""} onChange={(e) => setEditing({ ...editing, full_description: e.target.value })} rows={4} /></div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /><Label>সক্রিয়</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={editing.is_featured ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_featured: v })} /><Label>ফিচার্ড</Label></div>
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-3 mt-4">
                <div className="space-y-2"><Label>SKU</Label><Input value={editing.sku || ""} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} /></div>
                <div className="flex items-center gap-2 mt-2">
                  <Switch checked={editing.stock_quantity === -1} onCheckedChange={(v) => setEditing({ ...editing, stock_quantity: v ? -1 : 0 })} />
                  <Label>আনলিমিটেড স্টক</Label>
                </div>
                {editing.stock_quantity !== -1 && (
                  <div className="space-y-2"><Label>স্টক পরিমাণ</Label><Input type="number" value={editing.stock_quantity || 0} onChange={(e) => setEditing({ ...editing, stock_quantity: Number(e.target.value) })} /></div>
                )}
              </TabsContent>

              <TabsContent value="variants" className="space-y-3 mt-4">
                {variants.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
                    <span className="flex-1 font-medium text-sm">{v.variant_label}</span>
                    <span className="text-xs text-muted-foreground">মূল্য: {v.price_adjustment >= 0 ? "+" : ""}৳{v.price_adjustment}</span>
                    <span className="text-xs text-muted-foreground">স্টক: {v.stock_quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteVariant(v.id)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="লেবেল" value={newVariant.variant_label} onChange={(e) => setNewVariant({ ...newVariant, variant_label: e.target.value })} />
                  <Input type="number" placeholder="মূল্য ±" value={newVariant.price_adjustment} onChange={(e) => setNewVariant({ ...newVariant, price_adjustment: Number(e.target.value) })} />
                  <Input type="number" placeholder="স্টক" value={newVariant.stock_quantity} onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: Number(e.target.value) })} />
                </div>
                <Button size="sm" onClick={addVariant} disabled={!newVariant.variant_label}><Plus className="h-3.5 w-3.5 mr-1" /> যোগ করুন</Button>
              </TabsContent>

              <TabsContent value="media" className="space-y-3 mt-4">
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img) => (
                    <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => deleteImage(img.id)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file);
                      e.target.value = "";
                    }}
                  />
                  <Button type="button" variant="outline" className="w-full" disabled={uploading} asChild>
                    <span><Upload className="h-4 w-4 mr-1" />{uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}</span>
                  </Button>
                </label>
              </TabsContent>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setEditing(null)}>বাতিল</Button>
                <Button onClick={saveProduct} className="brand-gradient text-primary-foreground hover:opacity-90">সংরক্ষণ</Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
