import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { z } from "zod";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import { ShoppingCart, ArrowLeft, Package, Tag, X, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(1, "নাম প্রয়োজন").max(100),
  customer_phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন (01X-XXXXXXXX)"),
  customer_email: z.string().trim().email("সঠিক ইমেইল দিন").max(255).optional().or(z.literal("")),
  district: z.string().min(1, "জেলা নির্বাচন করুন"),
  delivery_address: z.string().trim().min(5, "সম্পূর্ণ ঠিকানা দিন").max(500),
  delivery_note: z.string().trim().max(500).optional(),
  payment_method: z.enum(["COD", "MOBILE_BANKING"]),
});

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_email: "", district: "",
    delivery_address: "", delivery_note: "", payment_method: "COD" as "COD" | "MOBILE_BANKING",
  });
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);
  const [rawDeliveryCharge, setRawDeliveryCharge] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mobile banking state
  const [mobileBankingMethod, setMobileBankingMethod] = useState<"bkash" | "nagad" | null>(null);
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingZones, setShippingZones] = useState<{ zone_name: string; delivery_charge: number }[]>([]);

  // Load shipping zones + payment numbers
  useEffect(() => {
    supabase.from("shipping_zones").select("zone_name, delivery_charge").eq("is_active", true).order("zone_name")
      .then(({ data }) => { if (data) setShippingZones(data); });

    supabase.from("site_settings").select("key, value").in("key", ["bkash_number", "nagad_number", "free_delivery_threshold"])
      .then(({ data }) => {
        data?.forEach((s) => {
          if (s.key === "bkash_number") setBkashNumber(s.value);
          if (s.key === "nagad_number") setNagadNumber(s.value);
          if (s.key === "free_delivery_threshold") setFreeDeliveryThreshold(Number(s.value) || 0);
        });
      });
  }, []);

  useEffect(() => {
    if (!form.district) { setDeliveryCharge(0); return; }
    supabase.from("shipping_zones").select("delivery_charge").eq("zone_name", form.district).eq("is_active", true).maybeSingle()
      .then(({ data }) => { setRawDeliveryCharge(data?.delivery_charge ?? 0); });
  }, [form.district]);

  // Apply free delivery logic
  useEffect(() => {
    if (freeDeliveryThreshold > 0 && total >= freeDeliveryThreshold) {
      setDeliveryCharge(0);
    } else {
      setDeliveryCharge(rawDeliveryCharge);
    }
  }, [total, rawDeliveryCharge, freeDeliveryThreshold]);

  useEffect(() => {
    if (!appliedCoupon) { setDiscountAmount(0); return; }
    if (appliedCoupon.discount_type === "percentage") {
      setDiscountAmount(Math.round(total * appliedCoupon.discount_value / 100));
    } else {
      setDiscountAmount(Math.min(appliedCoupon.discount_value, total));
    }
  }, [appliedCoupon, total]);

  const grandTotal = total + deliveryCharge - discountAmount;

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const { data, error } = await supabase
      .from("coupons").select("*").eq("code", couponCode.trim().toUpperCase()).eq("is_active", true).maybeSingle();
    setCouponLoading(false);
    if (error || !data) { toast.error("কুপন কোড সঠিক নয়"); return; }
    const coupon = data as any;
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) { toast.error("কুপনের মেয়াদ শেষ"); return; }
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) { toast.error("কুপনের সর্বোচ্চ ব্যবহার সীমা পূর্ণ"); return; }
    if (total < coupon.min_order_amount) { toast.error(`মিনিমাম অর্ডার ৳${coupon.min_order_amount} হতে হবে`); return; }
    setAppliedCoupon({ code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value });
    toast.success(`কুপন "${coupon.code}" প্রয়োগ করা হয়েছে!`);
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(""); setDiscountAmount(0); };

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    toast.success("নম্বর কপি হয়েছে");
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors); return;
    }
    if (items.length === 0) { toast.error("আপনার কার্ট খালি"); return; }
    if (form.payment_method === "MOBILE_BANKING" && !mobileBankingMethod) {
      toast.error("বিকাশ অথবা নগদ সিলেক্ট করুন"); return;
    }

    setSubmitting(true);
    const orderItems = items.map((item) => ({
      product_id: item.productId, variant_label: item.variantLabel || null, quantity: item.quantity,
    }));

    try {
      const { data, error } = await supabase.rpc("create_order", {
        p_customer_name: parsed.data.customer_name,
        p_customer_phone: parsed.data.customer_phone,
        p_customer_email: parsed.data.customer_email || "",
        p_district: parsed.data.district,
        p_delivery_address: parsed.data.delivery_address,
        p_delivery_note: parsed.data.delivery_note || "",
        p_payment_method: form.payment_method === "MOBILE_BANKING" ? `MOBILE_BANKING_${mobileBankingMethod?.toUpperCase()}` : "COD",
        p_user_id: user?.id || "00000000-0000-0000-0000-000000000000",
        p_items: orderItems,
      } as any);

      if (error) { setSubmitting(false); toast.error("অর্ডার ব্যর্থ: " + error.message); return; }
      const result = data as { success: boolean; message?: string; order_number?: string; total_amount?: number; subtotal?: number; delivery_charge?: number };
      if (!result.success) { setSubmitting(false); toast.error(result.message || "অর্ডার ব্যর্থ হয়েছে"); return; }

      if (appliedCoupon) {
        await supabase.from("coupons").update({ used_count: undefined as any }).eq("code", appliedCoupon.code);
      }

      setSubmitting(false);
      clearCart();
      toast.success("অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
      navigate("/order-success", {
        state: {
          orderNumber: result.order_number, customerName: parsed.data.customer_name, customerPhone: parsed.data.customer_phone,
          items, subtotal: result.subtotal, deliveryCharge: result.delivery_charge, grandTotal: result.total_amount,
          paymentMethod: form.payment_method === "MOBILE_BANKING" ? `মোবাইল ব্যাংকিং (${mobileBankingMethod === "bkash" ? "বিকাশ" : "নগদ"})` : "ক্যাশ অন ডেলিভারি",
          district: parsed.data.district, address: parsed.data.delivery_address,
        },
      });
    } catch (err: any) {
      setSubmitting(false);
      toast.error("অর্ডার ব্যর্থ হয়েছে: " + (err?.message || "অজানা ত্রুটি"));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar /><Header />
        <div className="container py-20 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">আপনার কার্ট খালি</h2>
          <Button asChild className="mt-4 brand-gradient text-primary-foreground hover:opacity-90">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> শপিং করুন</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const activePaymentNumber = mobileBankingMethod === "bkash" ? bkashNumber : mobileBankingMethod === "nagad" ? nagadNumber : "";

  return (
    <div className="min-h-screen bg-background">
      <TopBar /><Header />
      <main className="container py-6 md:py-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground mb-6 flex items-center gap-2"><Package className="h-6 w-6 md:h-7 md:w-7 text-primary" /> চেকআউট</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border border-border p-4 md:p-6 space-y-4">
                <h2 className="font-display font-bold text-lg text-foreground">ডেলিভারি তথ্য</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="name">নাম *</Label><Input id="name" value={form.customer_name} onChange={(e) => updateField("customer_name", e.target.value)} placeholder="আপনার পুরো নাম" maxLength={100} />{errors.customer_name && <p className="text-xs text-destructive">{errors.customer_name}</p>}</div>
                  <div className="space-y-2"><Label htmlFor="phone">ফোন নম্বর *</Label><Input id="phone" value={form.customer_phone} onChange={(e) => updateField("customer_phone", e.target.value)} placeholder="01XXXXXXXXX" maxLength={11} />{errors.customer_phone && <p className="text-xs text-destructive">{errors.customer_phone}</p>}</div>
                </div>
                <div className="space-y-2"><Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label><Input id="email" type="email" value={form.customer_email} onChange={(e) => updateField("customer_email", e.target.value)} placeholder="email@example.com" maxLength={255} />{errors.customer_email && <p className="text-xs text-destructive">{errors.customer_email}</p>}</div>
                <div className="space-y-2"><Label>জেলা / শিপিং জোন *</Label>
                  <Select value={form.district} onValueChange={(v) => updateField("district", v)}>
                    <SelectTrigger><SelectValue placeholder="জোন নির্বাচন করুন" /></SelectTrigger>
                    <SelectContent className="max-h-60">{shippingZones.map((z) => <SelectItem key={z.zone_name} value={z.zone_name}>{z.zone_name} (৳{z.delivery_charge})</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
                </div>
                <div className="space-y-2"><Label htmlFor="address">সম্পূর্ণ ঠিকানা *</Label><Textarea id="address" value={form.delivery_address} onChange={(e) => updateField("delivery_address", e.target.value)} placeholder="বাড়ি নং, রোড, এলাকা, থানা..." maxLength={500} rows={3} />{errors.delivery_address && <p className="text-xs text-destructive">{errors.delivery_address}</p>}</div>
                <div className="space-y-2"><Label htmlFor="note">ডেলিভারি নোট (ঐচ্ছিক)</Label><Textarea id="note" value={form.delivery_note} onChange={(e) => updateField("delivery_note", e.target.value)} placeholder="বিশেষ কোনো নির্দেশনা..." maxLength={500} rows={2} /></div>
              </div>

              {/* Payment method */}
              <div className="bg-card rounded-xl border border-border p-4 md:p-6 space-y-4">
                <h2 className="font-display font-bold text-lg text-foreground">পেমেন্ট পদ্ধতি</h2>
                <RadioGroup value={form.payment_method} onValueChange={(v) => { updateField("payment_method", v); if (v === "COD") setMobileBankingMethod(null); }} className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="COD" id="cod" className="mt-0.5" />
                    <Label htmlFor="cod" className="cursor-pointer flex-1">
                      <span className="font-medium">ক্যাশ অন ডেলিভারি (COD)</span>
                      <p className="text-xs text-muted-foreground mt-1">পণ্য হাতে পেয়ে সম্পূর্ণ টাকা পরিশোধ করুন</p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="MOBILE_BANKING" id="mobile_banking" className="mt-0.5" />
                    <Label htmlFor="mobile_banking" className="cursor-pointer flex-1">
                      <span className="font-medium">মোবাইল ব্যাংকিং</span>
                      <p className="text-xs text-muted-foreground mt-1">বিকাশ অথবা নগদের মাধ্যমে পেমেন্ট করুন</p>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Mobile Banking sub-options */}
                {form.payment_method === "MOBILE_BANKING" && (
                  <div className="ml-4 sm:ml-8 space-y-4 border-l-2 border-primary/20 pl-4">
                    <p className="text-sm font-medium text-foreground">পেমেন্ট মেথড নির্বাচন করুন:</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setMobileBankingMethod("bkash")}
                        className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${mobileBankingMethod === "bkash" ? "border-[#E2136E] bg-[#E2136E]/5" : "border-border hover:border-[#E2136E]/50"}`}
                      >
                        <span className="font-bold text-[#E2136E]">বিকাশ</span>
                        <p className="text-xs text-muted-foreground mt-1">বিকাশ অ্যাপ দিয়ে পেমেন্ট করুন</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileBankingMethod("nagad")}
                        className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${mobileBankingMethod === "nagad" ? "border-[#F6921E] bg-[#F6921E]/5" : "border-border hover:border-[#F6921E]/50"}`}
                      >
                        <span className="font-bold text-[#F6921E]">নগদ</span>
                        <p className="text-xs text-muted-foreground mt-1">নগদ অ্যাপ দিয়ে পেমেন্ট করুন</p>
                      </button>
                    </div>

                    {mobileBankingMethod && activePaymentNumber && (
                      <div className={`rounded-lg p-4 space-y-3 ${mobileBankingMethod === "bkash" ? "bg-[#E2136E]/5 border border-[#E2136E]/20" : "bg-[#F6921E]/5 border border-[#F6921E]/20"}`}>
                        <h4 className="font-semibold text-foreground text-sm">
                          {mobileBankingMethod === "bkash" ? "বিকাশ" : "নগদ"} পেমেন্ট নির্দেশনা:
                        </h4>
                        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                          <li>আপনার {mobileBankingMethod === "bkash" ? "বিকাশ" : "নগদ"} অ্যাপ ওপেন করুন</li>
                          <li>"সেন্ড মানি" অপশনে যান</li>
                          <li>নিচের নম্বরে <strong>৳{grandTotal}</strong> টাকা পাঠান</li>
                          <li>টাকা পাঠানোর পর "অর্ডার নিশ্চিত করুন" বাটনে ক্লিক করুন</li>
                          <li>অ্যাডমিন পেমেন্ট ভেরিফাই করে অর্ডার কনফার্ম করবে</li>
                        </ol>
                        <div className="flex items-center gap-2 bg-background rounded-lg p-3 border border-border">
                          <span className="text-sm text-muted-foreground">নম্বর:</span>
                          <span className="font-bold text-foreground text-lg tracking-wider flex-1">{activePaymentNumber}</span>
                          <Button type="button" variant="outline" size="sm" onClick={() => copyNumber(activePaymentNumber)} className="shrink-0">
                            {copiedNumber ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            <span className="ml-1 text-xs">{copiedNumber ? "কপি হয়েছে" : "কপি"}</span>
                          </Button>
                        </div>
                      </div>
                    )}

                    {mobileBankingMethod && !activePaymentNumber && (
                      <div className="rounded-lg p-4 bg-destructive/5 border border-destructive/20 text-sm text-destructive">
                        {mobileBankingMethod === "bkash" ? "বিকাশ" : "নগদ"} নম্বর এখনো সেট করা হয়নি। অনুগ্রহ করে অন্য পদ্ধতি ব্যবহার করুন।
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-4 md:p-6 sticky top-24 space-y-4">
                <h3 className="font-display font-bold text-lg text-foreground">অর্ডার সারাংশ</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantLabel || ""}`} className="flex justify-between text-sm">
                      <div className="flex-1 min-w-0"><p className="truncate text-foreground">{item.productName}</p>{item.variantLabel && <p className="text-xs text-muted-foreground">{item.variantLabel}</p>}<p className="text-xs text-muted-foreground">৳{item.price} × {item.quantity}</p></div>
                      <span className="font-medium text-foreground shrink-0 ml-2">৳{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="border-t border-border pt-3">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{appliedCoupon.code}</span>
                        <span className="text-xs text-muted-foreground">(-৳{discountAmount})</span>
                      </div>
                      <button type="button" onClick={removeCoupon} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="কুপন কোড" className="text-sm" />
                      <Button type="button" variant="outline" size="sm" onClick={applyCoupon} disabled={couponLoading} className="shrink-0">
                        {couponLoading ? "..." : "প্রয়োগ"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-foreground/80"><span>সাবটোটাল</span><span>৳{total}</span></div>
                  <div className="flex justify-between text-foreground/80"><span>ডেলিভারি চার্জ</span><span>{form.district ? `৳${deliveryCharge}` : "—"}</span></div>
                  {discountAmount > 0 && <div className="flex justify-between text-foreground/80"><span>ছাড়</span><span className="text-primary font-medium">-৳{discountAmount}</span></div>}
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center"><span className="font-bold text-foreground text-lg">মোট</span><span className="font-bold text-primary text-xl">৳{grandTotal}</span></div>
                
                {form.payment_method === "COD" && (
                  <div className="text-sm space-y-1 text-foreground/70">
                    <div className="flex justify-between font-medium text-foreground"><span>ডেলিভারিতে দিতে হবে</span><span>৳{grandTotal}</span></div>
                  </div>
                )}
                {form.payment_method === "MOBILE_BANKING" && mobileBankingMethod && (
                  <div className="text-sm text-foreground/70 bg-muted/50 rounded-lg p-2 text-center">
                    {mobileBankingMethod === "bkash" ? "বিকাশ" : "নগদ"} এ ৳{grandTotal} পাঠিয়ে অর্ডার নিশ্চিত করুন
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full brand-gradient text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity" disabled={submitting}>
                  {submitting ? "অর্ডার হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
