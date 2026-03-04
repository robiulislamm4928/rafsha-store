import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

const SETTING_KEYS = [
  { key: "store_name", label: "স্টোরের নাম", type: "text" },
  { key: "store_logo_url", label: "লোগো URL", type: "text" },
  { key: "phone", label: "ফোন নম্বর", type: "text" },
  { key: "email", label: "ইমেইল", type: "text" },
  { key: "address", label: "ঠিকানা", type: "textarea" },
  { key: "about", label: "সম্পর্কে", type: "textarea" },
  { key: "facebook_url", label: "ফেসবুক URL", type: "text" },
  { key: "whatsapp_number", label: "হোয়াটসঅ্যাপ নম্বর", type: "text" },
  { key: "live_chat_script", label: "লাইভ চ্যাট স্ক্রিপ্ট", type: "textarea" },
];

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("key, value").then(({ data }) => {
      const map: Record<string, string> = {};
      data?.forEach((s) => (map[s.key] = s.value));
      setSettings(map);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    for (const { key } of SETTING_KEYS) {
      const value = settings[key] || "";
      const { data: existing } = await supabase.from("site_settings").select("id").eq("key", key).maybeSingle();
      if (existing) {
        await supabase.from("site_settings").update({ value }).eq("key", key);
      } else {
        await supabase.from("site_settings").insert({ id: crypto.randomUUID(), key, value });
      }
    }
    setSaving(false);
    toast({ title: "সেটিংস সংরক্ষিত হয়েছে" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">সাইট সেটিংস</h1>
        <Button onClick={save} disabled={saving} className="honey-gradient text-primary-foreground hover:opacity-90"><Save className="h-4 w-4 mr-1" /> {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}</Button>
      </div>
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        {SETTING_KEYS.map(({ key, label, type }) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            {type === "textarea" ? (
              <Textarea value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} rows={3} />
            ) : (
              <Input value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
