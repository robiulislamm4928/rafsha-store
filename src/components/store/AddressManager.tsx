import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus, Trash2, Star, Edit2, X } from "lucide-react";
import { BD_DISTRICTS as DISTRICTS } from "@/lib/districts";

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  district: string;
  address: string;
  is_default: boolean;
}

const AddressManager = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "Home", full_name: "", phone: "", district: "", address: "" });
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
    setAddresses((data as Address[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, [user]);

  const resetForm = () => {
    setForm({ label: "Home", full_name: "", phone: "", district: "", address: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!user || !form.full_name.trim() || !form.phone.trim() || !form.district || !form.address.trim()) {
      toast.error("সব ফিল্ড পূরণ করুন"); return;
    }
    setSaving(true);
    if (editId) {
      await supabase.from("user_addresses").update({ ...form }).eq("id", editId);
    } else {
      const isFirst = addresses.length === 0;
      await supabase.from("user_addresses").insert({ ...form, user_id: user.id, is_default: isFirst });
    }
    setSaving(false);
    toast.success(editId ? "ঠিকানা আপডেট হয়েছে" : "ঠিকানা যোগ হয়েছে");
    resetForm();
    fetchAddresses();
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("user_addresses").update({ is_default: true }).eq("id", id);
    toast.success("ডিফল্ট ঠিকানা সেট হয়েছে");
    fetchAddresses();
  };

  const deleteAddress = async (id: string) => {
    await supabase.from("user_addresses").delete().eq("id", id);
    toast.success("ঠিকানা মুছে ফেলা হয়েছে");
    fetchAddresses();
  };

  const startEdit = (addr: Address) => {
    setForm({ label: addr.label, full_name: addr.full_name, phone: addr.phone, district: addr.district, address: addr.address });
    setEditId(addr.id);
    setShowForm(true);
  };

  if (loading) return <div className="h-20 bg-secondary/30 rounded-xl animate-pulse" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> সংরক্ষিত ঠিকানা
        </h2>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> নতুন ঠিকানা
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-secondary/30 rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{editId ? "ঠিকানা এডিট" : "নতুন ঠিকানা"}</p>
            <button onClick={resetForm}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">লেবেল</Label>
              <Select value={form.label} onValueChange={(v) => setForm(p => ({ ...p, label: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">বাসা</SelectItem>
                  <SelectItem value="Office">অফিস</SelectItem>
                  <SelectItem value="Other">অন্যান্য</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">নাম</Label>
              <Input value={form.full_name} onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="রিসিভারের নাম" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">ফোন</Label>
              <Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="01XXXXXXXXX" maxLength={11} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">জেলা</Label>
              <Select value={form.district} onValueChange={(v) => setForm(p => ({ ...p, district: v }))}>
                <SelectTrigger><SelectValue placeholder="জেলা নির্বাচন" /></SelectTrigger>
                <SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">পূর্ণ ঠিকানা</Label>
            <Input value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} placeholder="বিস্তারিত ঠিকানা" />
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm" className="brand-gradient text-primary-foreground">
            {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
          </Button>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <MapPin className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">কোনো সংরক্ষিত ঠিকানা নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-card rounded-xl border p-4 ${addr.is_default ? "border-primary/50 ring-1 ring-primary/20" : "border-border"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{addr.label === "Home" ? "🏠 বাসা" : addr.label === "Office" ? "🏢 অফিস" : "📍 " + addr.label}</span>
                    {addr.is_default && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">ডিফল্ট</span>}
                  </div>
                  <p className="text-sm text-foreground mt-1">{addr.full_name} • {addr.phone}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{addr.address}, {addr.district}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!addr.is_default && <button onClick={() => setDefault(addr.id)} title="ডিফল্ট করুন" className="p-1.5 rounded hover:bg-secondary"><Star className="h-3.5 w-3.5 text-muted-foreground" /></button>}
                  <button onClick={() => startEdit(addr)} className="p-1.5 rounded hover:bg-secondary"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => deleteAddress(addr.id)} className="p-1.5 rounded hover:bg-secondary"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
