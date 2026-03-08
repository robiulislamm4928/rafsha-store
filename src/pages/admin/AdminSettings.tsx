import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Upload, X, Volume2 } from "lucide-react";

const SETTING_KEYS = [
  { key: "store_name", label: "স্টোরের নাম", type: "text" },
  { key: "store_logo_url", label: "লোগো", type: "image" },
  { key: "phone", label: "ফোন নম্বর", type: "text" },
  { key: "email", label: "ইমেইল", type: "text" },
  { key: "address", label: "ঠিকানা", type: "textarea" },
  { key: "about", label: "সাইটের বিবরণ", type: "textarea" },
  { key: "bkash_number", label: "বিকাশ নম্বর", type: "text" },
  { key: "nagad_number", label: "নগদ নম্বর", type: "text" },
  { key: "notification_sound_url", label: "নোটিফিকেশন সাউন্ড", type: "sound" },
  { key: "facebook_url", label: "ফেসবুক URL", type: "text" },
  { key: "youtube_url", label: "ইউটিউব URL", type: "text" },
  { key: "instagram_url", label: "ইনস্টাগ্রাম URL", type: "text" },
  { key: "tiktok_url", label: "টিকটক URL", type: "text" },
  { key: "twitter_url", label: "টুইটার/X URL", type: "text" },
];

const SOCIAL_KEYS = ["facebook_url", "youtube_url", "instagram_url", "tiktok_url", "twitter_url"];
const PAYMENT_KEYS = ["bkash_number", "nagad_number"];
const NOTIFICATION_KEYS = ["notification_sound_url"];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingSound, setUploadingSound] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const soundFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("site_settings").select("key, value").then(({ data }) => {
      const map: Record<string, string> = {};
      data?.forEach((s) => (map[s.key] = s.value));
      setSettings(map);
    });
  }, []);

  const uploadLogo = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("শুধু ছবি আপলোড করুন"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("ফাইল সাইজ ২MB এর কম হতে হবে"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `site-logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("banners").upload(path, file, { upsert: true });
    if (error) { setUploading(false); toast.error("আপলোড ব্যর্থ"); return; }
    const { data: urlData } = supabase.storage.from("banners").getPublicUrl(path);
    setSettings((prev) => ({ ...prev, store_logo_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("লোগো আপলোড হয়েছে");
  };

  const uploadSound = async (file: File) => {
    if (!file.type.startsWith("audio/")) { toast.error("শুধু অডিও ফাইল আপলোড করুন (MP3, WAV, OGG)"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("ফাইল সাইজ ৫MB এর কম হতে হবে"); return; }
    setUploadingSound(true);
    const ext = file.name.split(".").pop();
    const path = `notification-sound-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("banners").upload(path, file, { upsert: true });
    if (error) { setUploadingSound(false); toast.error("আপলোড ব্যর্থ"); return; }
    const { data: urlData } = supabase.storage.from("banners").getPublicUrl(path);
    setSettings((prev) => ({ ...prev, notification_sound_url: urlData.publicUrl }));
    setUploadingSound(false);
    toast.success("সাউন্ড আপলোড হয়েছে");
  };

  const playPreview = () => {
    const url = settings.notification_sound_url;
    if (!url) { toast.error("কোনো সাউন্ড সেট করা নেই"); return; }
    const audio = new Audio(url);
    audio.volume = 0.7;
    audio.play().catch(() => toast.error("সাউন্ড প্লে করা যায়নি"));
  };

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
    toast.success("সেটিংস সংরক্ষিত হয়েছে");
  };

  const generalKeys = SETTING_KEYS.filter(s => !SOCIAL_KEYS.includes(s.key) && !PAYMENT_KEYS.includes(s.key) && !NOTIFICATION_KEYS.includes(s.key));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-display font-bold text-foreground">সাইট সেটিংস</h1>
        <Button onClick={save} disabled={saving} className="brand-gradient text-primary-foreground hover:opacity-90 w-full sm:w-auto"><Save className="h-4 w-4 mr-1" /> {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}</Button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 md:p-6 space-y-4">
        <h2 className="font-display font-semibold text-foreground">সাধারণ তথ্য</h2>
        {generalKeys.map(({ key, label, type }) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            {type === "image" ? (
              <div className="flex items-center gap-4 flex-wrap">
                {settings[key] && (
                  <div className="relative">
                    <img src={settings[key]} alt="লোগো" className="h-16 w-auto rounded-lg border border-border" />
                    <button onClick={() => setSettings((p) => ({ ...p, [key]: "" }))} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"><X className="h-3 w-3" /></button>
                  </div>
                )}
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]); }} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload className="h-4 w-4 mr-1" /> {uploading ? "আপলোড হচ্ছে..." : "লোগো আপলোড"}
                </Button>
              </div>
            ) : type === "textarea" ? (
              <Textarea value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} rows={3} />
            ) : (
              <Input value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4 md:p-6 space-y-4">
        <h2 className="font-display font-semibold text-foreground">মোবাইল ব্যাংকিং পেমেন্ট নম্বর</h2>
        <p className="text-sm text-muted-foreground">এই নম্বরগুলো চেকআউট পেজে মোবাইল ব্যাংকিং পেমেন্ট অপশনে দেখানো হবে। গ্রাহক এই নম্বরে টাকা পাঠাবে।</p>
        {SETTING_KEYS.filter(s => PAYMENT_KEYS.includes(s.key)).map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <Input value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} placeholder="01XXXXXXXXX" />
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4 md:p-6 space-y-4">
        <h2 className="font-display font-semibold text-foreground">নোটিফিকেশন সাউন্ড</h2>
        <p className="text-sm text-muted-foreground">নতুন অর্ডার বা চ্যাট মেসেজ আসলে এই সাউন্ড বাজবে। MP3, WAV বা OGG ফরম্যাটের ফাইল আপলোড করুন (সর্বোচ্চ ৫MB)।</p>
        <div className="flex items-center gap-3 flex-wrap">
          {settings.notification_sound_url && (
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
              <Volume2 className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground truncate max-w-[200px]">সাউন্ড সেট আছে</span>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={playPreview}>
                প্লে
              </Button>
              <button onClick={() => setSettings((p) => ({ ...p, notification_sound_url: "" }))} className="text-destructive hover:text-destructive/80">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <input type="file" ref={soundFileRef} accept="audio/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadSound(e.target.files[0]); }} />
          <Button type="button" variant="outline" size="sm" onClick={() => soundFileRef.current?.click()} disabled={uploadingSound}>
            <Upload className="h-4 w-4 mr-1" /> {uploadingSound ? "আপলোড হচ্ছে..." : "সাউন্ড আপলোড"}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 md:p-6 space-y-4">
        <h2 className="font-display font-semibold text-foreground">সোশ্যাল মিডিয়া লিংক</h2>
        {SETTING_KEYS.filter(s => SOCIAL_KEYS.includes(s.key)).map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <Input value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} placeholder="https://..." />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
