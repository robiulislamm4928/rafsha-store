import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Download, Smartphone, CheckCircle2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <>
      <Helmet>
        <title>অ্যাপ ইনস্টল করুন — রাফছা স্টোর</title>
        <meta name="description" content="রাফছা স্টোর অ্যাপ আপনার ফোনে ইনস্টল করুন — দ্রুত অর্ডার, অফলাইন ব্রাউজিং!" />
      </Helmet>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground font-heading">
            রাফছা স্টোর অ্যাপ ইনস্টল করুন
          </h1>
          <p className="text-muted-foreground">
            আপনার মোবাইলে অ্যাপের মতো ব্যবহার করুন — দ্রুত লোড, অফলাইন সাপোর্ট এবং সহজ অর্ডার!
          </p>

          {installed ? (
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-green-50 border border-green-200">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <p className="font-semibold text-green-800">অ্যাপ সফলভাবে ইনস্টল হয়েছে! 🎉</p>
            </div>
          ) : isIOS ? (
            <div className="p-6 rounded-xl bg-secondary border border-border space-y-4 text-left">
              <p className="font-semibold text-foreground">iOS এ ইনস্টল করতে:</p>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                  Safari ব্রাউজারে এই পেজ ওপেন করুন
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                  <span className="flex items-center gap-1">নিচের <Share className="h-4 w-4 inline" /> (Share) বাটনে ক্লিক করুন</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                  "Add to Home Screen" সিলেক্ট করুন
                </li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            <Button onClick={handleInstall} size="lg" className="gap-2 text-base w-full">
              <Download className="h-5 w-5" />
              এখনই ইনস্টল করুন
            </Button>
          ) : (
            <div className="p-6 rounded-xl bg-secondary border border-border space-y-3">
              <p className="text-sm text-muted-foreground">
                ব্রাউজারের মেনু থেকে "Add to Home Screen" বা "Install App" অপশনটি ব্যবহার করুন।
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { icon: "⚡", label: "দ্রুত লোড" },
              { icon: "📴", label: "অফলাইন সাপোর্ট" },
              { icon: "🔔", label: "নোটিফিকেশন" },
            ].map((f) => (
              <div key={f.label} className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-xs text-muted-foreground">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Install;