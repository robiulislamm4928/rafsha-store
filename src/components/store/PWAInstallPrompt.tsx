import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import logo from "@/assets/logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return; // 3 days
    }

    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((navigator as any).standalone) return;

    // Check if mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    // iOS detection
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      // Show iOS prompt after delay
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }

    // Android - listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 animate-in fade-in duration-300">
      <div className="w-full max-w-md mx-4 mb-6 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom duration-500">
        {/* Header */}
        <div className="relative p-5 pb-3">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-md flex-shrink-0">
              <img src={logo} alt="রাফছা স্টোর" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">রাফছা স্টোর</h3>
              <p className="text-sm text-muted-foreground">অ্যাপ ইনস্টল করুন</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-4">
          <p className="text-sm text-muted-foreground mb-4">
            আমাদের অ্যাপটি ইনস্টল করলে দ্রুত অর্ডার করতে পারবেন এবং অফলাইনেও ব্রাউজ করতে পারবেন।
          </p>

          {isIOS ? (
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">কিভাবে ইনস্টল করবেন:</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">১</span>
                নিচের <span className="inline-flex items-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></span> Share বাটনে ট্যাপ করুন
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">২</span>
                "Add to Home Screen" সিলেক্ট করুন
              </div>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="w-full py-3 px-4 rounded-xl brand-gradient text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Download className="w-5 h-5" />
              এখনই ইনস্টল করুন
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4">
          <button
            onClick={handleDismiss}
            className="w-full text-center text-sm text-muted-foreground py-2"
          >
            পরে করব
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
