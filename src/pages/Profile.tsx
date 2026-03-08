import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, User } from "lucide-react";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";

const Profile = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("users").select("full_name, phone, profile_image_url").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || "");
          setPhone(data.phone || "");
          setProfileImage(data.profile_image_url || null);
        }
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
    setProfileImage(url);
    setUploading(false);
    toast.success("প্রোফাইল ছবি আপডেট হয়েছে");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("users").update({ full_name: fullName, phone: phone || null }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error("আপডেট ব্যর্থ"); return; }
    toast.success("প্রোফাইল আপডেট হয়েছে");
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar /><Header />
      <main className="container py-6 md:py-10 max-w-lg mx-auto">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">আমার প্রোফাইল</h1>
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl"><User className="h-10 w-10" /></AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            {uploading && <p className="text-xs text-muted-foreground">আপলোড হচ্ছে...</p>}
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>পুরো নাম</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="আপনার নাম" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>মোবাইল নম্বর</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" maxLength={11} />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full brand-gradient text-primary-foreground hover:opacity-90">
            <Save className="h-4 w-4 mr-2" /> {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
