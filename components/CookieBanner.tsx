"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[200] animate-in slide-in-from-bottom-10 duration-700">
      <div className="max-w-4xl mx-auto bg-[#0F172A] text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400">
            <Cookie size={28} />
          </div>
          <div>
            <h4 className="font-bold text-lg">Privatësia juaj ka rëndësi</h4>
            <p className="text-gray-400 text-sm max-w-xl">
              Ne përdorim cookies për të përmirësuar përvojën tuaj dhe për të siguruar që platforma Flow AI funksionon në mënyrë optimale.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={acceptCookies}
            className="flex-1 md:flex-none bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-2xl transition-all whitespace-nowrap"
          >
            Pranoj të gjitha
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-3 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}