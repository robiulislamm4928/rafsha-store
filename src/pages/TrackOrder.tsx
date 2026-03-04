import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Package, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";

const trackSchema = z.object({
  order_number: z.string().trim().min(1, "অর্ডার নম্বর প্রয়োজন"),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন"),
});

interface OrderResult {
  success: boolean;
  message?: string;
  order?: {
    order_number: string;
    customer_name: string;
    order_status: string;
    payment_status: string;
    total_amount: number;
    due_on_delivery: number;
    created_at: string;
  };
  items?: {
    product_name_snapshot: string;
    variant_label_snapshot: string | null;
    unit_price_snapshot: number;
    quantity: number;
    item_total: number;
  }[];
  history?: {
    status: string;
    note: string | null;
    changed_at: string;
  }[];
}

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const { toast } = useToast();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = trackSchema.safeParse({ order_number: orderNumber, phone });
    if (!parsed.success) {
      toast({ title: "ত্রুটি", description: parsed.error.errors[0]?.message, variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc("track_order", {
      p_order_number: parsed.data.order_number,
      p_phone: parsed.data.phone,
    });

    setLoading(false);

    if (error) {
      toast({ title: "ত্রুটি", description: "ট্র্যাক করতে সমস্যা হয়েছে", variant: "destructive" });
      return;
    }

    const res = data as unknown as OrderResult;
    setResult(res);

    if (!res.success) {
      toast({ title: "পাওয়া যায়নি", description: res.message || "অর্ডার পাওয়া যায়নি", variant: "destructive" });
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-honey-gold/20 text-honey-deep";
      case "Processing": return "bg-primary/10 text-primary";
      case "Shipped": return "bg-blue-100 text-blue-700";
      case "Delivered": return "bg-green-100 text-green-700";
      case "Cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <Header />

      <div className="container py-10 md:py-16 flex-1 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">📦 অর্ডার ট্র্যাক করুন</h1>
          <p className="text-muted-foreground mt-2">আপনার অর্ডার নম্বর এবং ফোন নম্বর দিয়ে অর্ডারের অবস্থা জানুন।</p>
        </div>

        <form onSubmit={handleTrack} className="bg-card rounded-xl border border-border p-6 space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="on">অর্ডার নম্বর</Label>
              <Input id="on" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="ORD-XXXXXXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ph">ফোন নম্বর</Label>
              <Input id="ph" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" maxLength={11} />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full honey-gradient text-primary-foreground hover:opacity-90">
            <Search className="h-4 w-4 mr-2" />
            {loading ? "খুঁজছে..." : "ট্র্যাক করুন"}
          </Button>
        </form>

        {result?.success && result.order && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Order info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">অর্ডার নম্বর</p>
                  <p className="font-bold text-primary text-lg">{result.order.order_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(result.order.order_status)}`}>
                  {result.order.order_status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">গ্রাহক:</span> <span className="font-medium">{result.order.customer_name}</span></div>
                <div><span className="text-muted-foreground">পেমেন্ট:</span> <span className="font-medium">{result.order.payment_status}</span></div>
                <div><span className="text-muted-foreground">মোট:</span> <span className="font-bold text-primary">৳{result.order.total_amount}</span></div>
                <div><span className="text-muted-foreground">বাকি:</span> <span className="font-medium">৳{result.order.due_on_delivery}</span></div>
              </div>
            </div>

            {/* Items */}
            {result.items && result.items.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Package className="h-4 w-4" /> পণ্যসমূহ</h3>
                <div className="space-y-2">
                  {result.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-foreground">{item.product_name_snapshot}</p>
                        {item.variant_label_snapshot && <p className="text-xs text-muted-foreground">{item.variant_label_snapshot}</p>}
                        <p className="text-xs text-muted-foreground">৳{item.unit_price_snapshot} × {item.quantity}</p>
                      </div>
                      <span className="font-medium text-foreground">৳{item.item_total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status history */}
            {result.history && result.history.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Clock className="h-4 w-4" /> স্ট্যাটাস হিস্টরি</h3>
                <div className="space-y-4">
                  {result.history.map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full honey-gradient shrink-0 mt-1" />
                        {i < result.history!.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-foreground text-sm">{h.status}</p>
                        {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(h.changed_at).toLocaleString("bn-BD")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TrackOrder;
