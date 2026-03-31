"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRightCircle } from "lucide-react";

export default function WelcomeTourModal({ locale, hasDemo }: { locale: string, hasDemo: boolean }) {
  const [isOpen, setIsOpen] = useState(hasDemo);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 relative animate-in zoom-in-95 duration-300">
        
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
          <Sparkles size={32} />
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-3 leading-tight">Mirësevini në Sistemin Tuaj të Ri! 🎉</h2>
        
        <p className="text-gray-600 font-medium leading-relaxed mb-8">
          Për t'ju ndihmuar të kuptoni se si duket platforma kur është plot me rezervime, ne kemi krijuar disa të dhëna <strong>Demo</strong> (një sallë, një menu dhe një event). <br/><br/>
          Le t'i zëvendësojmë këto me të dhënat e biznesit tuaj të vërtetë!
        </p>

        <Link 
          href={`/${locale}/biznes/sallat/shto`}
          onClick={() => setIsOpen(false)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
        >
          Fillo Duke Shtuar Sallën <ArrowRightCircle size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <button 
          onClick={() => setIsOpen(false)}
          className="w-full text-center mt-4 text-sm font-bold text-gray-400 hover:text-gray-600"
        >
          Do ta bëj më vonë
        </button>
      </div>
    </div>
  );
}