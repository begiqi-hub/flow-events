"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sparkles, Banknote, ArrowLeft, Save, Wallet, Info, Crown, Zap } from "lucide-react";
import Link from "next/link";
import { saveExtraAction } from "../actions"; 
import { useTranslations } from "next-intl"; 

export default function AddExtraPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const t = useTranslations("AddExtra");
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [limitModal, setLimitModal] = useState<{title: string, message: string} | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", price: "", internal_cost: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });
    setLimitModal(null); 

    try {
      const res = await saveExtraAction({
        name: formData.name,
        price: Number(formData.price),
        internal_cost: formData.internal_cost ? Number(formData.internal_cost) : null,
      });

      if (res?.isLimitError) {
        setLoading(false);
        setLimitModal({ title: res.limitTitle || "Limit i arritur", message: res.error || "" });
        return;
      }

      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
        return;
      }

      // ==============================================================
      // LOGJIKA E ONBOARDING (SETUP WIZARD)
      // ==============================================================
      const searchParams = new URLSearchParams(window.location.search);
      const isOnboarding = searchParams.get('onboarding') === 'true';

      if (isOnboarding) {
        setToast({ show: true, message: "Hapi 3 u përfundua! Po kalojmë tek Llogaria Bankare...", type: "tour" });
        setTimeout(() => {
          router.push(`/${locale}/biznes/banka?onboarding=true`);
        }, 2000);
      } else {
        setToast({ show: true, message: t("successMsg"), type: "success" });
        setTimeout(() => {
          router.push(`/${locale}/biznes/ekstra`);
        }, 1500);
      }

    } catch (error) {
      setToast({ show: true, message: t("networkError"), type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 relative min-h-[80vh] font-sans">
      
      {/* TOAST NORMAL DHE TOUR */}
      {toast.show && (
        <div className={`fixed inset-0 z-[90] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
            <div className={`relative mx-auto -mt-16 mb-6 w-24 h-24 rounded-full flex items-center justify-center border-8 border-white shadow-lg ${
              toast.type === "success" ? "bg-[#F0FDF4] text-emerald-500" : 
              toast.type === "tour" ? "bg-indigo-50 text-indigo-500" : "bg-[#FFF9F2] text-[#E6931E]"
            }`}>
              {toast.type === "success" && (
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                  <path d="M12 22a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2zm6-6v2H6v-2l2-2V9a4 4 0 0 1 4-4 4 4 0 0 1 4 4v5l2 2z" />
                </svg>
              )}
              {toast.type === "tour" && <Sparkles size={48} className="animate-pulse text-indigo-500" />}
              {toast.type === "error" && (
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              )}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? t("successTitle") : toast.type === "tour" ? "Fantastike!" : t("warningTitle")}
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {toast.message}
            </p>

            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : 
                toast.type === "tour" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" : 
                "bg-[#FF5C39] hover:bg-[#e84e2d] shadow-orange-200"
              }`}
            >
              {t("closeBtn")} <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      )}

      {/* MODALI I UPSELL-IT */}
      {limitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="absolute -top-10 -right-10 text-indigo-50 opacity-40 pointer-events-none">
              <Crown size={180} />
            </div>

            <div className="relative z-10">
              <div className="mx-auto w-24 h-24 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-[2rem] mb-6 shadow-inner border border-indigo-100">
                  <Crown size={40} className="drop-shadow-sm" />
              </div>
              
              <h3 className="text-[1.7rem] leading-tight font-black text-gray-900 mb-3 tracking-tight">
                {limitModal.title}
              </h3>
              
              <p className="text-gray-500 font-medium leading-relaxed mb-8 text-sm">
                {limitModal.message}
              </p>
              
              <div className="flex flex-col gap-3">
                 <button 
                  onClick={() => router.push(`/${locale}/biznes/abonimi`)} 
                  className="w-full py-4 bg-[#0f172a] text-white rounded-2xl font-black hover:bg-[#1e293b] shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 group"
                 >
                    <Zap size={18} className="text-amber-400 group-hover:scale-110 transition-transform" /> 
                    Shiko Paketat e Reja
                 </button>
                 
                 <button 
                  onClick={() => setLimitModal(null)} 
                  className="w-full py-4 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 text-sm"
                 >
                    Anulo dhe kthehu
                 </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/${locale}/biznes/ekstra`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> {t("backBtn")}
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t("pageTitle")}</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">{t("pageSubtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col gap-8">
        
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <Sparkles size={16} className="text-gray-400" /> {t("extraNameLabel")}
          </label>
          <input 
            type="text" 
            required 
            placeholder={t("extraNamePlaceholder")}
            className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-sm transition-all" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <Wallet size={16} className="text-orange-500" /> Kostoja (e Brendshme)
              </label>
              <div className="group relative cursor-pointer">
                <Info size={14} className="text-gray-400 hover:text-gray-600" />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-center z-10">
                  Kostoja reale e këtij shërbimi (psh. pagesa për fotografit). Nuk i shfaqet klientit.
                </div>
              </div>
            </div>
            <input 
              type="number" 
              step="0.01" 
              placeholder="Psh: 150.00" 
              className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-orange-500 focus:ring-1 bg-white font-medium text-sm transition-all" 
              value={formData.internal_cost} 
              onChange={(e) => setFormData({...formData, internal_cost: e.target.value})} 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
              <Banknote size={16} className="text-emerald-500" /> {t("priceLabel")} (Shitet)
            </label>
            <input 
              type="number" 
              step="0.01" 
              required 
              placeholder={t("pricePlaceholder")}
              className="w-full border border-emerald-200 p-4 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 bg-white font-black text-sm text-emerald-900 placeholder:text-gray-400 transition-all" 
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: e.target.value})} 
            />
          </div>
        </div>

        <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-100">
          <p className="text-sm text-blue-800 font-bold leading-relaxed">
            💡 Ky shërbim do të shfaqet në "Hapin 3" të Wizard-it të rezervimeve. Çmimi i tij do t'i shtohet automatikisht faturës finale nëse klienti e zgjedh.
          </p>
        </div>

        <hr className="border-gray-100" />

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-[#0f172a] text-white font-black py-4 rounded-2xl hover:bg-[#1e293b] disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {loading ? t("savingBtn") : t("saveExtraBtn")}
        </button>
      </form>
      
    </div>
  );
}