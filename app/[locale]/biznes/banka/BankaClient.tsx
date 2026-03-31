"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, Save, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { updateBankAction } from "./actions";
import { useTranslations } from "next-intl"; 

export default function BankaClient({ business, locale }: { business: any, locale: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const t = useTranslations("BankaClient");

  const [formData, setFormData] = useState({
    bank_name: business?.bank_name || "",
    account_holder: business?.account_holder || "",
    iban: business?.iban || "",
    swift: business?.swift || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    const res = await updateBankAction(formData);
    
    if (res?.error) {
      setToast({ show: true, message: res.error, type: "error" });
      setLoading(false);
      return;
    }

    // ==============================================================
    // LOGJIKA E ONBOARDING (SETUP WIZARD) & KTHIMI NË DASHBOARD
    // ==============================================================
    const searchParams = new URLSearchParams(window.location.search);
    const isOnboarding = searchParams.get('onboarding') === 'true';

    if (isOnboarding) {
      setToast({ show: true, message: "Hapi 4 u përfundua! Po kalojmë tek Politika...", type: "tour" });
      setTimeout(() => {
        // Kalojmë te Politika duke mbajtur param
        router.push(`/${locale}/biznes/konfigurimet/politika?onboarding=true`);
      }, 2000);
    } else {
      // Nëse nuk është Onboarding, ruaje dhe kthehu direkt në Dashboard
      setToast({ show: true, message: t("toastSuccessSave"), type: "success" });
      setTimeout(() => {
        router.push(`/${locale}/biznes`);
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 relative">
      
      {/* TOAST DHE TOUR MODAL I PËRDITËSUAR */}
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
              {t("closeBtn")} <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t("pageTitle")}</h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">{t("pageSubtitle")}</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="animate-in fade-in duration-300">
          <div className="p-6 md:p-8 border-b border-gray-100 flex items-center gap-3 bg-purple-50/50">
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl"><Landmark size={20}/></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t("sectionTitle")}</h2>
            </div>
          </div>
          
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("bankNameLabel")}</label>
              <input type="text" placeholder={t("bankNamePlaceholder")} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-bold text-gray-900" value={formData.bank_name} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("accountHolderLabel")}</label>
              <input type="text" placeholder={t("accountHolderPlaceholder")} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.account_holder} onChange={(e) => setFormData({...formData, account_holder: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("ibanLabel")}</label>
              <input type="text" placeholder={t("ibanPlaceholder")} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-bold text-gray-900 tracking-widest uppercase" value={formData.iban} onChange={(e) => setFormData({...formData, iban: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("swiftLabel")}</label>
              <input type="text" placeholder={t("swiftPlaceholder")} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900 uppercase" value={formData.swift} onChange={(e) => setFormData({...formData, swift: e.target.value})} />
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button type="submit" disabled={loading} className="w-full sm:w-auto bg-[#0F172A] hover:bg-[#1e293b] text-white font-black py-4 px-10 rounded-xl disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-md">
              <Save size={20} /> {loading ? t("savingBtn") : t("saveBtn")}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}