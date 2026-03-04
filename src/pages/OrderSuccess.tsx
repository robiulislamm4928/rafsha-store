import { useLocation, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Home } from "lucide-react";
import { CartItem } from "@/contexts/CartContext";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";

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

    // Simple invoice layout (jsPDF doesn't support Bengali natively, use transliteration)
    doc.setFontSize(20);
    doc.text("MODHUGHOR - Invoice", 20, 25);

    doc.setFontSize(10);
    doc.text(`Order: ${order.orderNumber}`, 20, 40);
    doc.text(`Customer: ${order.customerName}`, 20, 48);
    doc.text(`Phone: ${order.customerPhone}`, 20, 56);
    doc.text(`District: ${order.district}`, 20, 64);
    doc.text(`Address: ${order.address.substring(0, 80)}`, 20, 72);
    doc.text(`Payment: ${order.paymentMethod}`, 20, 80);

    // Items table
    doc.setFontSize(12);
    doc.text("Items:", 20, 95);
    doc.setFontSize(9);

    let y = 105;
    doc.text("Product", 20, y);
    doc.text("Qty", 120, y);
    doc.text("Price", 140, y);
    doc.text("Total", 170, y);
    y += 5;
    doc.line(20, y, 190, y);
    y += 5;

    order.items.forEach((item) => {
      const name = item.productName.substring(0, 40);
      doc.text(name, 20, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(`${item.price}`, 140, y);
      doc.text(`${item.price * item.quantity}`, 170, y);
      y += 8;
    });

    y += 5;
    doc.line(20, y, 190, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${order.subtotal} BDT`, 140, y);
    y += 7;
    doc.text(`Delivery: ${order.deliveryCharge} BDT`, 140, y);
    y += 7;
    doc.setFontSize(12);
    doc.text(`Total: ${order.grandTotal} BDT`, 140, y);

    doc.save(`invoice-${order.orderNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <div className="container py-10 md:py-16 max-w-2xl">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 rounded-full honey-gradient mx-auto flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            অর্ডার সফলভাবে সম্পন্ন! 🎉
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
          <Button asChild className="flex-1 honey-gradient text-primary-foreground hover:opacity-90">
            <Link to="/"><Home className="h-4 w-4 mr-2" /> হোমে ফিরুন</Link>
          </Button>
        </div>

        <div className="text-center mt-6">
          <Link to="/track-order" className="text-sm text-primary underline">অর্ডার ট্র্যাক করুন →</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
