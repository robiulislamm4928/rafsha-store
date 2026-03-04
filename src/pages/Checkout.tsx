import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BD_DISTRICTS } from "@/lib/districts";
import { z } from "zod";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(1, "নাম প্রয়োজন").max(100),
  customer_phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন (01X-XXXXXXXX)"),
  customer_email: z.string().trim().email("সঠিক ইমেইল দিন").max(255).optional().or(z.literal("")),
  district: z.string().min(1, "জেলা নির্বাচন করুন"),
  delivery_address: z.string().trim().min(5, "সম্পূর্ণ ঠিকানা দিন").max(500),
  delivery_note: z.string().trim().max(500).optional(),
  payment_method: z.enum(["COD", "PARTIAL_ONLINE"]),
});

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    district: "",
    delivery_address: "",
    delivery_note: "",
    payment_method: "COD" as "COD" | "PARTIAL_ONLINE",
  });
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch delivery charge when district changes
  useEffect(() => {
    if (!form.district) {
      setDeliveryCharge(0);
      return;
    }
    supabase
      .from("shipping_zones")
      .select("delivery_charge")
      .eq("zone_name", form.district)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        setDeliveryCharge(data?.delivery_charge ?? 0);
      });
  }, [form.district]);

  const grandTotal = total + deliveryCharge;

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (items.length === 0) {
      toast({ title: "ত্রুটি", description: "আপনার কার্ট খালি", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const orderId = crypto.randomUUID();
    const orderNumber = `ORD-${Date.now()}`;
    const email = parsed.data.customer_email || null;

    // Insert order - no .select() to avoid RLS issues
    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      order_number: orderNumber,
      customer_name: parsed.data.customer_name,
      customer_phone: parsed.data.customer_phone,
      customer_email: email,
      delivery_address: parsed.data.delivery_address,
      district: parsed.data.district,
      subtotal: total,
      delivery_charge: deliveryCharge,
      discount_amount: 0,
      total_amount: grandTotal,
      advance_paid: 0,
      due_on_delivery: grandTotal,
      payment_method: parsed.data.payment_method,
      payment_status: "Pending",
      order_status: "Pending",
      user_id: user?.id || null,
      delivery_note: parsed.data.delivery_note || null,
    });

    if (orderError) {
      setSubmitting(false);
      toast({ title: "অর্ডার ব্যর্থ", description: orderError.message, variant: "destructive" });
      return;
    }

    // Insert order items
    const orderItems = items.map((item) => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: item.productId,
      product_name_snapshot: item.productName,
      variant_label_snapshot: item.variantLabel || null,
      unit_price_snapshot: item.price,
      quantity: item.quantity,
      item_total: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      setSubmitting(false);
      toast({ title: "আইটেম সংরক্ষণে সমস্যা", description: itemsError.message, variant: "destructive" });
      return;
    }

    // Insert initial status history
    await supabase.from("order_status_history").insert({
      id: crypto.randomUUID(),
      order_id: orderId,
      status: "Pending",
      note: "অর্ডার গৃহীত হয়েছে",
    });

    setSubmitting(false);
    clearCart();

    // Navigate to success with order data
    navigate("/order-success", {
      state: {
        orderNumber,
        customerName: parsed.data.customer_name,
        customerPhone: parsed.data.customer_phone,
        items,
        subtotal: total,
        deliveryCharge,
        grandTotal,
        paymentMethod: parsed.data.payment_method,
        district: parsed.data.district,
        address: parsed.data.delivery_address,
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">আপনার কার্ট খালি</h2>
          <Button asChild className="mt-4 honey-gradient text-primary-foreground hover:opacity-90">
            <a href="/">শপিং করুন</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <div className="container py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">📦 চেকআউট</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Customer form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-display font-bold text-lg text-foreground">ডেলিভারি তথ্য</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">নাম *</Label>
                    <Input id="name" value={form.customer_name} onChange={(e) => updateField("customer_name", e.target.value)} placeholder="আপনার পুরো নাম" maxLength={100} />
                    {errors.customer_name && <p className="text-xs text-destructive">{errors.customer_name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">ফোন নম্বর *</Label>
                    <Input id="phone" value={form.customer_phone} onChange={(e) => updateField("customer_phone", e.target.value)} placeholder="01XXXXXXXXX" maxLength={11} />
                    {errors.customer_phone && <p className="text-xs text-destructive">{errors.customer_phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
                  <Input id="email" type="email" value={form.customer_email} onChange={(e) => updateField("customer_email", e.target.value)} placeholder="email@example.com" maxLength={255} />
                  {errors.customer_email && <p className="text-xs text-destructive">{errors.customer_email}</p>}
                </div>

                <div className="space-y-2">
                  <Label>জেলা *</Label>
                  <Select value={form.district} onValueChange={(v) => updateField("district", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="জেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {BD_DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">সম্পূর্ণ ঠিকানা *</Label>
                  <Textarea id="address" value={form.delivery_address} onChange={(e) => updateField("delivery_address", e.target.value)} placeholder="বাড়ি নং, রোড, এলাকা, থানা..." maxLength={500} rows={3} />
                  {errors.delivery_address && <p className="text-xs text-destructive">{errors.delivery_address}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">ডেলিভারি নোট (ঐচ্ছিক)</Label>
                  <Textarea id="note" value={form.delivery_note} onChange={(e) => updateField("delivery_note", e.target.value)} placeholder="বিশেষ কোনো নির্দেশনা..." maxLength={500} rows={2} />
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-display font-bold text-lg text-foreground">পেমেন্ট পদ্ধতি</h2>
                <RadioGroup value={form.payment_method} onValueChange={(v) => updateField("payment_method", v)} className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="COD" id="cod" />
                    <Label htmlFor="cod" className="cursor-pointer flex-1">
                      <span className="font-medium">ক্যাশ অন ডেলিভারি (COD)</span>
                      <p className="text-xs text-muted-foreground">পণ্য হাতে পেয়ে টাকা দিন</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="PARTIAL_ONLINE" id="partial" />
                    <Label htmlFor="partial" className="cursor-pointer flex-1">
                      <span className="font-medium">আংশিক অনলাইন পেমেন্ট</span>
                      <p className="text-xs text-muted-foreground">অগ্রিম কিছু টাকা অনলাইনে পরিশোধ করুন</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24 space-y-4">
                <h3 className="font-display font-bold text-lg text-foreground">অর্ডার সারাংশ</h3>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantLabel || ""}`} className="flex justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-foreground">{item.productName}</p>
                        {item.variantLabel && <p className="text-xs text-muted-foreground">{item.variantLabel}</p>}
                        <p className="text-xs text-muted-foreground">৳{item.price} × {item.quantity}</p>
                      </div>
                      <span className="font-medium text-foreground shrink-0 ml-2">৳{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-foreground/80">
                    <span>সাবটোটাল</span>
                    <span>৳{total}</span>
                  </div>
                  <div className="flex justify-between text-foreground/80">
                    <span>ডেলিভারি চার্জ</span>
                    <span>{form.district ? `৳${deliveryCharge}` : "—"}</span>
                  </div>
                  <div className="flex justify-between text-foreground/80">
                    <span>ছাড়</span>
                    <span>৳0</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-bold text-foreground text-lg">মোট</span>
                  <span className="font-bold text-primary text-xl">৳{grandTotal}</span>
                </div>

                <div className="text-sm space-y-1 text-foreground/70">
                  <div className="flex justify-between"><span>অগ্রিম</span><span>৳0</span></div>
                  <div className="flex justify-between font-medium text-foreground"><span>ডেলিভারিতে দিতে হবে</span><span>৳{grandTotal}</span></div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full honey-gradient text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity"
                  disabled={submitting}
                >
                  {submitting ? "অর্ডার হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
