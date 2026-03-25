import { useLocation, Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Home } from "lucide-react";
import { CartItem } from "@/contexts/CartContext";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import { openInvoice } from "@/lib/generateInvoice";

interface OrderState {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: string;
  district: string;
  address: string;
}

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state as OrderState | null;

  if (!order) return <Navigate to="/" replace />;

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Fetch site settings for branding
    const { data: settings } = await supabase.from("site_settings").select("key, value").in("key", [
      "store_name", "store_phone", "store_email", "store_address"
    ]);
    const s: Record<string, string> = {};
    settings?.forEach((r) => { s[r.key] = r.value; });
    const storeName = s.store_name || "Rafcha Store";

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(storeName, 20, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("INVOICE", 170, 22, { align: "right" });

    // Store info
    let headerY = 30;
    if (s.store_phone) { doc.text(`Phone: ${s.store_phone}`, 20, headerY); headerY += 5; }
    if (s.store_email) { doc.text(`Email: ${s.store_email}`, 20, headerY); headerY += 5; }
    if (s.store_address) { doc.text(`Address: ${s.store_address}`, 20, headerY); headerY += 5; }

    // Divider
    headerY += 3;
    doc.setDrawColor(200);
    doc.line(20, headerY, 190, headerY);
    headerY += 8;

    // Order details
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Order Details", 20, headerY);
    headerY += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Order Number: ${order.orderNumber}`, 20, headerY);
    doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 140, headerY);
    headerY += 6;
    doc.text(`Customer: ${order.customerName}`, 20, headerY);
    headerY += 5;
    doc.text(`Phone: ${order.customerPhone}`, 20, headerY);
    headerY += 5;
    doc.text(`District: ${order.district}`, 20, headerY);
    headerY += 5;
    doc.text(`Address: ${order.address.substring(0, 80)}`, 20, headerY);
    headerY += 5;
    doc.text(`Payment: ${order.paymentMethod}`, 20, headerY);
    headerY += 8;

    // Items table header
    doc.setDrawColor(180);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, headerY - 1, 170, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Product", 22, headerY + 4);
    doc.text("Qty", 125, headerY + 4, { align: "center" });
    doc.text("Price", 150, headerY + 4, { align: "right" });
    doc.text("Total", 188, headerY + 4, { align: "right" });
    headerY += 10;

    // Items
    doc.setFont("helvetica", "normal");
    order.items.forEach((item) => {
      const name = `${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ""}`.substring(0, 50);
      doc.text(name, 22, headerY + 4);
      doc.text(String(item.quantity), 125, headerY + 4, { align: "center" });
      doc.text(`${item.price}`, 150, headerY + 4, { align: "right" });
      doc.text(`${item.price * item.quantity}`, 188, headerY + 4, { align: "right" });
      headerY += 7;
    });

    // Totals
    headerY += 3;
    doc.line(120, headerY, 190, headerY);
    headerY += 7;
    doc.setFontSize(10);
    doc.text("Subtotal:", 140, headerY); doc.text(`${order.subtotal} BDT`, 188, headerY, { align: "right" });
    headerY += 6;
    doc.text("Delivery:", 140, headerY); doc.text(`${order.deliveryCharge} BDT`, 188, headerY, { align: "right" });
    headerY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total:", 140, headerY); doc.text(`${order.grandTotal} BDT`, 188, headerY, { align: "right" });

    // Footer
    headerY += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text("Thank you for your order!", 105, headerY, { align: "center" });

    doc.save(`invoice-${order.orderNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <div className="container py-10 md:py-16 max-w-2xl">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 rounded-full brand-gradient mx-auto flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            অর্ডার সফলভাবে সম্পন্ন!
          </h1>
          <p className="text-muted-foreground mt-2">আপনার অর্ডার গৃহীত হয়েছে। শীঘ্রই আমরা যোগাযোগ করব।</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">অর্ডার নম্বর</p>
              <p className="font-bold text-primary text-lg">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">পেমেন্ট</p>
              <p className="font-medium text-foreground">{order.paymentMethod === "COD" ? "ক্যাশ অন ডেলিভারি" : "আংশিক অনলাইন"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">নাম</p>
              <p className="font-medium text-foreground">{order.customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ফোন</p>
              <p className="font-medium text-foreground">{order.customerPhone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">ঠিকানা</p>
              <p className="font-medium text-foreground">{order.address}, {order.district}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-foreground mb-3">পণ্যসমূহ</h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-foreground/80">
                    {item.productName} {item.variantLabel ? `(${item.variantLabel})` : ""} × {item.quantity}
                  </span>
                  <span className="font-medium text-foreground">৳{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-foreground/80">সাবটোটাল</span><span>৳{order.subtotal}</span></div>
            <div className="flex justify-between"><span className="text-foreground/80">ডেলিভারি চার্জ</span><span>৳{order.deliveryCharge}</span></div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span className="text-foreground">মোট</span>
              <span className="text-primary">৳{order.grandTotal}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" /> ইনভয়েস ডাউনলোড
          </Button>
          <Button asChild className="flex-1 brand-gradient text-primary-foreground hover:opacity-90">
            <Link to="/"><Home className="h-4 w-4 mr-2" /> হোমে ফিরুন</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
