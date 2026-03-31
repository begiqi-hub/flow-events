"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Save, Clock, Percent, Info, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { updatePolicyAction } from "./actions";
import { useTranslations } from "next-intl";

export default function PolitikaClient({ business, locale }: { business: any, locale: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const t = useTranslations("PolitikaClient"); 

  const [formData, setFormData] = useState({
    ...business, 
    cancel_penalty: business?.cancel_penalty || 0,
    cancel_days: business?.cancel_days || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    const res = await updatePolicyAction(formData); 
    
    if (res?.error) {
      setToast({ show: true, message: res.error || "Gabim", type: "error" });
      setLoading(false);
      return;
    }

    // ==============================================================
    // LOGJIKA E ONBOARDING (SETUP WIZARD) & KTHIMI
    // ==============================================================
    const searchParams = new URLSearchParams(window.location.search);
    const isOnboarding = searchParams.get('onboarding') === 'true';

    if (isOnboarding) {
      setToast({ show: true, message: "Urime! Konfigurimi i biznesit u përfundua 100%.", type: "tour" });
      setTimeout(() => {
        router.push(`/${locale}/biznes`);
      }, 2500); // 2.5 sekonda kohë që të lexojë mesazhin e suksesit
    } else {
      setToast({ show: true, message: t("toastSuccessSave"), type: "success" });
      setTimeout(() => {
        router.push(`/${locale}/biznes/konfigurimet`); // E kthejmë te lista e konfigurimeve
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 relative font-sans">
      
      {/* TOAST DHE TOUR MODAL I PËRDITËSUAR (Në mes të ekranit si tek tjerat) */}
      {toast.show && (
        <div className={`fixed inset-0 z-[90] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
            <div className={`relative mx-auto -mt-16 mb-6 w-24 h-24 rounded-full flex items-center justify-center border-8 border-white shadow-lg ${
              toast.type === "success" ? "bg-[#F0FDF4] text-emerald-500" : 
              toast.type === "tour" ? "bg-indigo-50 text-indigo-500" : "bg-[#FFF9F2] text-[#E6931E]"
            }`}>
              {toast.type === "success" && <CheckCircle2 size={48} />}
              {toast.type === "tour" && <Sparkles size={48} className="animate-pulse text-indigo-500" />}
              {toast.type === "error" && <AlertCircle size={48} />}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? "Sukses!" : toast.type === "tour" ? "Fantastike!" : "Kujdes!"}
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
              U Kuptua <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t("pageTitle")}</h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">{t("pageSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
             <div className="p-2.5 bg-red-100 text-red-600 rounded-xl"><ShieldAlert size={20}/></div>
             <h2 className="text-xl font-bold text-gray-900">{t("sectionTitle")}</h2>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("cancelDaysLabel")}</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="number" 
                    min="0"
                    className="w-full border border-gray-200 pl-11 pr-4 py-4 rounded-2xl outline-none focus:border-gray-900 font-bold text-gray-900" 
                    value={formData.cancel_days} 
                    onChange={(e) => setFormData({...formData, cancel_days: Number(e.target.value)})} 
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">{t("cancelDaysDesc")}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("cancelPenaltyLabel")}</label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    className="w-full border border-gray-200 pl-11 pr-4 py-4 rounded-2xl outline-none focus:border-gray-900 font-bold text-gray-900" 
                    value={formData.cancel_penalty} 
                    onChange={(e) => setFormData({...formData, cancel_penalty: Number(e.target.value)})} 
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">{t("cancelPenaltyDesc")}</p>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
              <Info className="text-blue-500 shrink-0" size={20} />
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                {t("infoAlert")}
              </p>
            </div>
          </div>

          <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex justify-end">
             <button type="submit" disabled={loading} className="w-full sm:w-auto bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                <Save size={18} /> {loading ? t("savingBtn") : t("saveBtn")}
             </button>
          </div>
        </div>
      </form>
    </div>
  );
}