"use client";

import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, Smartphone } from "lucide-react";
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

    if (isApp) return;

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

  if (isStandalone) return null;
  if (!isInstallable && !isIOS) return null;

  return (
    <div className="mt-10 w-full max-w-sm mx-auto animate-in slide-in-from-bottom-4 fade-in duration-700">
      <div className="bg-gradient-to-br from-indigo-50/80 to-white p-6 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-900/5 relative overflow-hidden">
        
        {/* Dekorim i sfondit për ta bërë më 'Premium' */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center text-center relative z-10">
          
          {/* Ikona e telefonit */}
          <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-indigo-50">
            <Smartphone size={24} strokeWidth={2.5} />
          </div>
          
          <h3 className="text-base font-black text-gray-900 mb-1 tracking-tight">
            {t("availableApp") || "Përvojë më e mirë në App"}
          </h3>
          <p className="text-xs text-gray-500 font-medium mb-6 px-4">
            Instalo platformën tonë në telefon për qasje të menjëhershme.
          </p>

          {/* PAMJA PËR ANDROID / PC */}
          {isInstallable && (
            <button 
              onClick={handleInstallClick}
              className="relative group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-3.5 rounded-xl text-sm font-black transition-all duration-300 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 active:scale-[0.98]"
            >
              <Download size={18} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
              {t("installBtn") || "Instalo Aplikacionin"}
            </button>
          )}

          {/* PAMJA PËR iOS / iPHONE */}
          {isIOS && !isInstallable && (
            <div className="w-full bg-white border border-gray-200 text-gray-700 p-4 rounded-xl text-xs font-medium text-left shadow-sm">
              <p className="mb-3 font-black text-gray-900 uppercase tracking-widest text-[10px]">Për iOS (iPhone):</p>
              <ol className="flex flex-col gap-2.5">
                <li className="flex items-center gap-3">
                  <span className="bg-indigo-50 text-indigo-700 w-6 h-6 rounded-lg flex items-center justify-center font-black">1</span>
                  <span className="flex items-center gap-1">Kliko <Share size={16} className="text-blue-500" /> <strong>Share</strong> në menu.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="bg-indigo-50 text-indigo-700 w-6 h-6 rounded-lg flex items-center justify-center font-black">2</span>
                  <span className="flex items-center gap-1">Zgjidh <PlusSquare size={16} className="text-gray-900" /> <strong>Add to Home Screen</strong>.</span>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}