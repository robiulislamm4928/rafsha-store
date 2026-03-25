import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Eye, Trash2, Download, Inbox, FileDown, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { openInvoice } from "@/lib/generateInvoice";

interface Order {
  id: string; order_number: string; customer_name: string; customer_phone: string;
  customer_email: string | null; delivery_address: string; district: string;
  subtotal: number; delivery_charge: number; discount_amount: number; total_amount: number;
  advance_paid: number; due_on_delivery: number; payment_method: string; payment_status: string;
  order_status: string; admin_note: string | null; delivery_note: string | null; created_at: string;
}
interface OrderItem { id: string; product_name_snapshot: string; variant_label_snapshot: string | null; unit_price_snapshot: number; quantity: number; item_total: number; }
interface StatusHistory { id: string; status: string; note: string | null; changed_at: string; }

const STATUSES = ["Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled", "Returned"];
const PAYMENT_STATUSES = ["Pending", "Partial", "Paid", "Refunded"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (statusFilter !== "all") query = query.eq("order_status", statusFilter);
    const { data } = await query;
    setOrders((data as Order[]) || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.customer_name.toLowerCase().includes(s) || o.customer_phone.includes(s) || o.order_number.toLowerCase().includes(s);
  });

  const openDetail = async (order: Order) => {
    setSelectedOrder(order);
    setAdminNote(order.admin_note || "");
    const [itemsRes, histRes] = await Promise.all([
      supabase.from("order_items").select("*").eq("order_id", order.id),
      supabase.from("order_status_history").select("*").eq("order_id", order.id).order("changed_at"),
    ]);
    setOrderItems((itemsRes.data as OrderItem[]) || []);
    setStatusHistory((histRes.data as StatusHistory[]) || []);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    await supabase.from("orders").update({ order_status: newStatus }).eq("id", orderId);
    await supabase.from("order_status_history").insert({ id: crypto.randomUUID(), order_id: orderId, status: newStatus });
    toast.success("স্ট্যাটাস আপডেট হয়েছে");
    fetchOrders();
    if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, order_status: newStatus });
  };

  const updatePaymentStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ payment_status: status }).eq("id", orderId);
    toast.success("পেমেন্ট স্ট্যাটাস আপডেট হয়েছে");
    fetchOrders();
  };

  const saveAdminNote = async () => {
    if (!selectedOrder) return;
    await supabase.from("orders").update({ admin_note: adminNote }).eq("id", selectedOrder.id);
    toast.success("নোট সংরক্ষিত");
  };

  const deleteOrder = async (id: string) => {
    await supabase.from("orders").delete().eq("id", id);
    toast.success("অর্ডার মুছে ফেলা হয়েছে");
    fetchOrders();
    if (selectedOrder?.id === id) setSelectedOrder(null);
  };

  const downloadInvoice = async (order: Order) => {
    const [settingsRes, itemsRes] = await Promise.all([
      supabase.from("site_settings").select("key, value").in("key", ["store_name", "address"]),
      supabase.from("order_items").select("*").eq("order_id", order.id),
    ]);
    const s: Record<string, string> = {};
    settingsRes.data?.forEach((r) => { s[r.key] = r.value; });
    const items = (itemsRes.data as OrderItem[]) || [];

    openInvoice({
      storeName: s.store_name || "রাফছা স্টোর",
      storeAddress: s.address,
      orderNumber: order.order_number,
      date: new Date(order.created_at).toLocaleDateString("bn-BD"),
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email || undefined,
      district: order.district,
      address: order.delivery_address,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,
      items: items.map(item => ({
        name: item.product_name_snapshot,
        variant: item.variant_label_snapshot,
        quantity: item.quantity,
        unitPrice: item.unit_price_snapshot,
        total: item.item_total,
      })),
      subtotal: order.subtotal,
      deliveryCharge: order.delivery_charge,
      discount: order.discount_amount,
      total: order.total_amount,
      advancePaid: order.advance_paid,
      due: order.due_on_delivery,
    });
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      Pending: "bg-amber-100 text-amber-700",
      Processing: "bg-blue-100 text-blue-700",
      Confirmed: "bg-indigo-100 text-indigo-700",
      Shipped: "bg-cyan-100 text-cyan-700",
      Delivered: "bg-emerald-100 text-emerald-700",
      Cancelled: "bg-red-100 text-red-700",
      Returned: "bg-orange-100 text-orange-700",
    };
    return map[s] || "bg-gray-100 text-gray-600";
  };

  const exportCSV = () => {
    const headers = ["Order Number","Customer","Phone","Email","District","Total","Delivery","Discount","Payment Method","Payment Status","Order Status","Date"];
    const rows = filtered.map(o => [o.order_number, o.customer_name, o.customer_phone, o.customer_email || "", o.district, o.total_amount, o.delivery_charge, o.discount_amount, o.payment_method, o.payment_status, o.order_status, new Date(o.created_at).toLocaleDateString("en-GB")]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV ডাউনলোড হয়েছে");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">অর্ডার ম্যানেজমেন্ট</h1>
            <p className="text-sm text-gray-400">Order Management</p>
          </div>
        </div>
        <Button onClick={exportCSV} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
          <FileDown className="h-4 w-4 mr-1.5" /> CSV এক্সপোর্ট
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="নাম, ফোন বা অর্ডার নম্বর খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white border-gray-200 rounded-xl h-11" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-44 bg-white border-gray-200 rounded-xl h-11"><SelectValue placeholder="স্ট্যাটাস" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">অর্ডার</th>
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">গ্রাহক</th>
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ফোন</th>
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">মোট</th>
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">পেমেন্ট</th>
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">স্ট্যাটাস</th>
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">তারিখ</th>
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-4"><div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <Inbox className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-400">কোনো অর্ডার পাওয়া যায়নি</p>
              </td></tr>
            ) : filtered.map((o, i) => (
              <tr key={o.id} className={`hover:bg-gray-50/50 transition-colors ${i !== filtered.length - 1 ? "border-b border-gray-50" : ""}`}>
                <td className="p-4 font-semibold text-blue-600">{o.order_number}</td>
                <td className="p-4 text-gray-700 font-medium">{o.customer_name}</td>
                <td className="p-4 text-gray-600">{o.customer_phone}</td>
                <td className="p-4 font-bold text-gray-800">৳{o.total_amount.toLocaleString()}</td>
                <td className="p-4">
                  <Select value={o.payment_status} onValueChange={(v) => updatePaymentStatus(o.id, v)}>
                    <SelectTrigger className="h-7 text-xs w-24 rounded-lg border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-4">
                  <Select value={o.order_status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className={`h-7 text-xs w-28 rounded-full font-bold ${statusColor(o.order_status)}`}><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-4 text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString("bn-BD")}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600" onClick={() => openDetail(o)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-green-50 hover:text-green-600" onClick={() => downloadInvoice(o)}><Download className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>অর্ডার মুছে ফেলতে চান?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteOrder(o.id)} className="bg-red-500 text-white hover:bg-red-600">মুছুন</AlertDialogAction>
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

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">অর্ডার: {selectedOrder.order_number}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">গ্রাহক:</span> <span className="font-medium">{selectedOrder.customer_name}</span></div>
                  <div><span className="text-muted-foreground">ফোন:</span> <span className="font-medium">{selectedOrder.customer_phone}</span></div>
                  <div><span className="text-muted-foreground">ইমেইল:</span> <span className="font-medium">{selectedOrder.customer_email || "—"}</span></div>
                  <div><span className="text-muted-foreground">জেলা:</span> <span className="font-medium">{selectedOrder.district}</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">ঠিকানা:</span> <span className="font-medium">{selectedOrder.delivery_address}</span></div>
                  {selectedOrder.delivery_note && <div className="col-span-2"><span className="text-muted-foreground">নোট:</span> <span className="font-medium">{selectedOrder.delivery_note}</span></div>}
                </div>

                <div className="border-t border-border pt-3">
                  <h4 className="font-semibold mb-2">পণ্যসমূহ</h4>
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-1.5 border-b border-border last:border-0">
                      <span>{item.product_name_snapshot} {item.variant_label_snapshot ? `(${item.variant_label_snapshot})` : ""} × {item.quantity}</span>
                      <span className="font-medium">৳{item.item_total}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 space-y-1">
                  <div className="flex justify-between"><span>সাবটোটাল</span><span>৳{selectedOrder.subtotal}</span></div>
                  <div className="flex justify-between"><span>ডেলিভারি</span><span>৳{selectedOrder.delivery_charge}</span></div>
                  <div className="flex justify-between"><span>ছাড়</span><span>-৳{selectedOrder.discount_amount}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-2"><span>মোট</span><span className="text-primary">৳{selectedOrder.total_amount}</span></div>
                  <div className="flex justify-between text-xs"><span>অগ্রিম</span><span>৳{selectedOrder.advance_paid}</span></div>
                  <div className="flex justify-between text-xs"><span>বাকি</span><span>৳{selectedOrder.due_on_delivery}</span></div>
                </div>

                {statusHistory.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <h4 className="font-semibold mb-2">স্ট্যাটাস হিস্টরি</h4>
                    {statusHistory.map((h) => (
                      <div key={h.id} className="flex gap-2 py-1 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${statusColor(h.status)}`}>{h.status}</span>
                        <span className="text-muted-foreground">{new Date(h.changed_at).toLocaleString("bn-BD")}</span>
                        {h.note && <span className="text-foreground/70">— {h.note}</span>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-border pt-3 space-y-2">
                  <h4 className="font-semibold">অ্যাডমিন নোট</h4>
                  <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2} placeholder="অ্যাডমিন নোট লিখুন..." />
                  <Button size="sm" onClick={saveAdminNote} className="brand-gradient text-primary-foreground hover:opacity-90">সংরক্ষণ</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
