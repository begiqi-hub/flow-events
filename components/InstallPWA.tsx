"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl"; // <--- Shtuam Përkthimet

export default function InstallPWA() {
  const t = useTranslations("PWA"); // Lidhja me fjalorin JSON
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
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

  if (!isInstallable) return null;

  return (
    <div className="mt-8 flex flex-col items-center animate-in fade-in duration-500 bg-white/50 p-4 rounded-2xl border border-gray-100">
      <p className="text-[10px] text-gray-500 font-bold mb-3 uppercase tracking-widest">
        {t("availableApp")} {/* Psh: "Aplikacioni i Disponueshëm" */}
      </p>
      <button 
        onClick={handleInstallClick}
        className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm group w-full justify-center"
      >
        <Download size={18} className="group-hover:scale-110 transition-transform" />
        {t("installBtn")} {/* Psh: "Instalo Aplikacionin" */}
      </button>
    </div>
  );
}