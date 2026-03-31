"use client";

import { useEffect } from "react";
import { WifiOff, RefreshCcw, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BusinessErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  // E regjistrojmë gabimin në prapaskenë për zhvilluesin
  useEffect(() => {
    console.error("Gabim në lidhjen me Serverin/Databazën:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-500">
      
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-red-50 border-4 border-red-100 w-28 h-28 rounded-full flex items-center justify-center shadow-sm">
          {error.message.includes("Prisma") || error.message.includes("fetch") ? (
            <WifiOff size={48} className="text-red-500" />
          ) : (
            <AlertTriangle size={48} className="text-red-500" />
          )}
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
        Mungon Lidhja me Serverin
      </h1>
      
      <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg font-medium leading-relaxed">
        Duket se keni humbur lidhjen me internetin ose databaza po vonon të përgjigjet. 
        Ju lutem kontrolloni rrjetin tuaj (WiFi/4G) dhe provoni përsëri.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm mx-auto">
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-gray-200 hover:scale-[1.02]"
        >
          <RefreshCcw size={20} /> Provo Sërish
        </button>
        
        <button
          onClick={() => router.refresh()}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold transition-all"
        >
          Rifresko Faqen
        </button>
      </div>

    </div>
  );
}