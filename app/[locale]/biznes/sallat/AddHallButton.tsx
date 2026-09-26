"use client";

import { useState } from "react";
import { PlusCircle, AlertCircle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddHallButtonProps {
  currentHallsCount: number;
  maxPublicHalls: number;
  locale: string;
}

export default function AddHallButton({ currentHallsCount, maxPublicHalls, locale }: AddHallButtonProps) {
  const router = useRouter();
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleAddClick = () => {
    if (currentHallsCount >= maxPublicHalls) {
      setShowLimitModal(true); // Bllokon dhe shfaq modalin
    } else {
      router.push(`/${locale}/biznes/sallat/shto`); // Lejon kalimin te forma
    }
  };

  return (
    <>
      <button 
        onClick={handleAddClick}
        className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
      >
        <PlusCircle size={20} /> Shto Sallë
      </button>

      {/* MODALI I BLLOKIMIT */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Limiti Maksimal u Arrit!</h3>
              <p className="text-sm text-gray-500 mb-6">
                Ju keni arritur limitin maksimal prej <strong>{maxPublicHalls} sallash</strong> në platformë. 
                Për të shtuar një sallë të re, ju lutem fshini një nga sallat ekzistuese.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLimitModal(false)} 
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Kuptova, Kthehu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}