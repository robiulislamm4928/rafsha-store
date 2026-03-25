import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Save, User, Package, Heart, Trash2, MapPin, Clock } from "lucide-react";
import AddressManager from "@/components/store/AddressManager";
import { Link } from "react-router-dom";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import { format } from "date-fns";

interface OrderItem { product_name_snapshot: string; variant_label_snapshot: string | null; unit_price_snapshot: number; quantity: number; item_total: number; }
interface Order { id: string; order_number: string; order_status: string; payment_status: string; total_amount: number; created_at: string; order_items: OrderItem[]; }

const statusColors: Record<string, string> = { Pending: "bg-yellow-100 text-yellow-800 border-yellow-200", Processing: "bg-blue-100 text-blue-800 border-blue-200", Shipped: "bg-purple-100 text-purple-800 border-purple-200", Delivered: "bg-green-100 text-green-800 border-green-200", Cancelled: "bg-red-100 text-red-800 border-red-200" };
const statusLabels: Record<string, string> = { Pending: "অপেক্ষমান", Processing: "প্রসেসিং", Shipped: "শিপড", Delivered: "ডেলিভারড", Cancelled: "বাতিল" };
const statusSteps = ["Pending", "Processing", "Shipped", "Delivered"];

const Profile = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<{ id: string; product_id: string; name: string; slug: string; price: number; image?: string }[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("users").select("full_name, phone, profile_image_url").eq("id", user.id).single().then(({ data }) => {
      if (data) { setFullName(data.full_name || ""); setPhone(data.phone || ""); setProfileImage(data.profile_image_url || null); }
    });
    supabase.from("orders").select("id, order_number, order_status, payment_status, total_amount, created_at, order_items(product_name_snapshot, variant_label_snapshot, unit_price_snapshot, quantity, item_total)").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => { setOrders((data as unknown as Order[]) || []); setOrdersLoading(false); });
    supabase.from("wishlists").select("id, product_id, products(name, slug, sale_price, regular_price, product_images(image_url))").eq("user_id", user.id).then(({ data }) => {
      const items = (data || []).map((w: any) => ({ id: w.id, product_id: w.product_id, name: w.products?.name || "", slug: w.products?.slug || "", price: w.products?.sale_price ?? w.products?.regular_price ?? 0, image: w.products?.product_images?.[0]?.image_url }));
      setWishlistItems(items); setWishlistLoading(false);
    });
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("ছবি ২MB এর কম হতে হবে"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("profile-images").upload(path, file, { upsert: true });
    if (error) { setUploading(false); toast.error("আপলোড ব্যর্থ"); return; }
    const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(path);
    const url = urlData.publicUrl + "?t=" + Date.now();
    await supabase.from("users").update({ profile_image_url: url }).eq("id", user.id);
    setProfileImage(url); setUploading(false); toast.success("প্রোফাইল ছবি আপডেট হয়েছে");
  };

  const handleSave = async () => {
    if (!user) return; setSaving(true);
    const { error } = await supabase.from("users").update({ full_name: fullName, phone: phone || null }).eq("id", user.id);
    setSaving(false); if (error) { toast.error("আপডেট ব্যর্থ"); return; } toast.success("প্রোফাইল আপডেট হয়েছে");
  };

  return (
    <div className="min-h-screen bg-background"><TopBar /><Header />
      <main className="container py-6 md:py-10 max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">আমার প্রোফাইল</h1>
        
        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6 mb-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                <AvatarImage src={profileImage || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl"><User className="h-10 w-10" /></AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-md">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            {uploading && <p className="text-xs text-muted-foreground">আপলোড হচ্ছে...</p>}
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2"><Label>পুরো নাম</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="আপনার নাম" maxLength={100} /></div>
            <div className="space-y-2"><Label>মোবাইল নম্বর</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" maxLength={11} /></div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full brand-gradient text-primary-foreground hover:opacity-90"><Save className="h-4 w-4 mr-2" /> {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="orders" className="gap-1.5"><Package className="h-4 w-4" /> অর্ডার</TabsTrigger>
            <TabsTrigger value="addresses" className="gap-1.5"><MapPin className="h-4 w-4" /> ঠিকানা</TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-1.5"><Heart className="h-4 w-4" /> উইশলিস্ট</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {ordersLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="bg-card rounded-xl border border-border p-4"><div className="h-4 skeleton-shimmer rounded w-1/3 mb-2" /><div className="h-3 skeleton-shimmer rounded w-1/2" /></div>)}</div>
            ) : orders.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">আপনার কোনো অর্ডার নেই</p>
                <Button asChild variant="outline" size="sm" className="mt-4"><Link to="/products">পণ্য দেখুন</Link></Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const currentStepIdx = statusSteps.indexOf(order.order_status);
                  const isCancelled = order.order_status === "Cancelled";
                  return (
                    <div key={order.id} className="bg-card rounded-xl border border-border overflow-hidden gradient-border-hover">
                      <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="w-full p-4 text-left hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">{order.order_number}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColors[order.order_status] || "bg-secondary text-foreground border-border"}`}>{statusLabels[order.order_status] || order.order_status}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{format(new Date(order.created_at), "dd MMM yyyy")}</span>
                              <span className="font-semibold text-foreground">৳{order.total_amount.toLocaleString()}</span>
                            </div>
                          </div>
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>

                        {/* Visual timeline */}
                        {!isCancelled && (
                          <div className="flex items-center gap-1 mt-3">
                            {statusSteps.map((step, idx) => (
                              <div key={step} className="flex items-center flex-1">
                                <div className={`w-3 h-3 rounded-full shrink-0 transition-colors ${idx <= currentStepIdx ? "bg-primary" : "bg-border"}`} />
                                {idx < statusSteps.length - 1 && <div className={`h-0.5 flex-1 transition-colors ${idx < currentStepIdx ? "bg-primary" : "bg-border"}`} />}
                              </div>
                            ))}
                          </div>
                        )}
                      </button>

                      {expandedOrder === order.id && (
                        <div className="border-t border-border px-4 py-3 bg-secondary/20 space-y-2">
                          {order.order_items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm">
                              <div className="flex-1 min-w-0"><p className="text-foreground truncate">{item.product_name_snapshot}</p>{item.variant_label_snapshot && <p className="text-xs text-muted-foreground">{item.variant_label_snapshot}</p>}</div>
                              <div className="text-right shrink-0 ml-3"><p className="text-foreground">৳{item.unit_price_snapshot} × {item.quantity}</p><p className="text-xs text-muted-foreground">৳{item.item_total.toLocaleString()}</p></div>
                            </div>
                          ))}
                          <div className="mt-3 pt-2 border-t border-border text-xs text-muted-foreground">পেমেন্ট: {order.payment_status}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses"><AddressManager /></TabsContent>

          <TabsContent value="wishlist">
            {wishlistLoading ? (
              <div className="bg-card rounded-xl border border-border p-4"><div className="h-4 skeleton-shimmer rounded w-1/3 mb-2" /><div className="h-3 skeleton-shimmer rounded w-1/2" /></div>
            ) : wishlistItems.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">আপনার উইশলিস্ট খালি</p>
                <Button asChild variant="outline" size="sm" className="mt-4"><Link to="/products">পণ্য দেখুন</Link></Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="bg-card rounded-xl border border-border overflow-hidden group gradient-border-hover">
                    <Link to={`/product/${item.slug}`} className="block aspect-square bg-secondary overflow-hidden">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/20"><Package className="h-8 w-8" /></div>}
                    </Link>
                    <div className="p-3">
                      <Link to={`/product/${item.slug}`} className="text-sm font-medium text-foreground line-clamp-1 hover:text-primary">{item.name}</Link>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-primary">৳{item.price}</span>
                        <button onClick={async () => { await supabase.from("wishlists").delete().eq("id", item.id); setWishlistItems((prev) => prev.filter((w) => w.id !== item.id)); toast.success("উইশলিস্ট থেকে সরানো হয়েছে"); }} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
