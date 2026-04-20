"use client";

import { useState, useEffect } from "react";
import { Download, Share, PlusSquare } from "lucide-react";
import { useTranslations } from "next-intl";

export default function InstallPWA() {
  const t = useTranslations("PWA");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Kontrollojmë nëse aplikacioni është hapur tashmë si App (jo në browser)
    const isApp = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(isApp);

    if (isApp) return; // Nëse është instaluar, nuk bëjmë asgjë

    // 1. Logjika për Android / Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 2. Logjika për zbulimin e iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIOSDevice) {
      setIsIOS(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // Nëse është instaluar tashmë, mos shfaq asgjë
  if (isStandalone) return null;

  // Nëse s'ka prompt (dhe s'është iOS), mos shfaq asgjë
  if (!isInstallable && !isIOS) return null;

  return (
    <div className="mt-8 flex flex-col items-center animate-in fade-in duration-500 bg-white/50 p-5 rounded-2xl border border-gray-100 shadow-sm">
      <p className="text-[10px] text-gray-500 font-bold mb-3 uppercase tracking-widest text-center">
        {t("availableApp") || "Aplikacioni i Disponueshëm"}
      </p>

      {/* PAMJA PËR ANDROID / PC */}
      {isInstallable && (
        <button 
          onClick={handleInstallClick}
          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm group w-full justify-center"
        >
          <Download size={18} className="group-hover:scale-110 transition-transform" />
          {t("installBtn") || "Instalo Aplikacionin"}
        </button>
      )}

      {/* PAMJA PËR iOS / iPHONE */}
      {isIOS && !isInstallable && (
        <div className="bg-indigo-50/50 border border-indigo-100 text-indigo-800 px-4 py-3 rounded-xl text-xs font-medium w-full text-center">
          Për të instaluar aplikacionin, kliko butonin <Share size={14} className="inline mx-1 mb-0.5" /> <strong>Share</strong> dhe zgjidh <PlusSquare size={14} className="inline mx-1 mb-0.5" /> <strong>Add to Home Screen</strong>.
        </div>
      )}
    </div>
  );
}