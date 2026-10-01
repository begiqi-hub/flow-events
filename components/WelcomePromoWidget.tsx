"use client";

import { useState, useEffect } from "react";
import { Gift, Clock, X, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// SHTUAM discountText SI PARAMETËR DINAMIK
export default function WelcomePromoWidget({ 
  promoCode = "HALLEVO20", 
  discountText = "20%" 
}: { 
  promoCode?: string, 
  discountText?: string 
}) {
  const params = useParams();
  const locale = (params?.locale as string) || "sq";

  const [showPopup, setShowPopup] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const PROMO_DURATION = 48 * 60 * 60 * 1000;
    let startTime = localStorage.getItem("hallevo_promo_start");
    
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem("hallevo_promo_start", startTime);
      
      if (!localStorage.getItem("hallevo_promo_popup_closed")) {
        setTimeout(() => setShowPopup(true), 2000);
      }
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const expiration = parseInt(startTime!) + PROMO_DURATION;
      const difference = expiration - now;

      if (difference <= 0) {
        setShowBanner(false);
        return null;
      }

      setShowBanner(true);
      return {
        h: Math.floor((difference / (1000 * 60 * 60)) % 48),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    localStorage.setItem("hallevo_promo_popup_closed", "true");
  };

  const closeBanner = () => {
    setShowBanner(false);
    localStorage.setItem("hallevo_promo_start", "0"); 
  };

  if (!isClient) return null;

  return (
    <>
      {showBanner && timeLeft && (
        <div className="bg-indigo-600 text-white px-4 py-2 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-6 text-sm font-medium shadow-md relative z-40">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-300" />
            {/* PËRDORIMI I VARIABLËS DINAMIKE discountText */}
            <span>Ofertë ekskluzive Abonim Vjetor: Përdor kodin <strong className="bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider">{promoCode}</strong> për {discountText} Zbritje!</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full font-mono font-bold">
              <Clock size={14} />
              {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
            </div>
            <Link 
              href={`/${locale}/biznes/abonimi`} 
              className="bg-white text-indigo-600 font-bold px-4 py-1 rounded-full text-xs hover:bg-gray-50 transition-colors hidden sm:block"
            >
              Abonohu Tani
            </Link>
          </div>
          <button onClick={closeBanner} className="absolute right-4 hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {showPopup && timeLeft && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 relative">
            <button 
              onClick={closePopup} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X size={18} />
            </button>
            
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20"><Gift size={120} /></div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
                <Gift size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 relative z-10">Ofertë Mirëseardhjeje!</h2>
              <p className="text-indigo-100 text-sm font-medium relative z-10">Përshpejtoni rritjen e biznesit tuaj.</p>
            </div>

            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Përdorni platformën e plotë për menaxhimin e sallave dhe rezervimeve. Abonohuni brenda 48 orëve dhe përfitoni <strong className="text-indigo-600">{discountText} zbritje</strong> ekskluzive duke përdorur kodin:
              </p>
              
              <div className="bg-gray-50 border-2 border-dashed border-indigo-200 rounded-xl p-4 mb-6 relative group">
                <span className="text-2xl font-black tracking-widest text-indigo-600 font-mono select-all">
                  {promoCode}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 text-rose-600 font-bold text-sm mb-6 bg-rose-50 py-2 rounded-lg">
                <Clock size={16} /> 
                Skadon për: {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
              </div>

              <Link 
                href={`/${locale}/biznes/abonimi`}
                onClick={closePopup}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Kalo te Abonimet <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}