"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Utensils, AlignLeft, Banknote, ArrowLeft, Save, 
  Image as ImageIcon, Wallet, Info, Crown, Zap, Sparkles 
} from "lucide-react";
import Link from "next/link";
import { saveMenuAction } from "../actions";
import { useTranslations } from "next-intl"; 

export default function AddMenuPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string; 
  
  const t = useTranslations("AddMenu");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Shteti i ri për Modalin e Limiteve
  const [limitModal, setLimitModal] = useState<{title: string, message: string} | null>(null);

  const [compressedImage, setCompressedImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  
  const [formData, setFormData] = useState({
    name: "", description: "", price_per_person: "", internal_cost: ""
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; 
        const scaleSize = MAX_WIDTH / img.width;
        
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setCompressedImage(dataUrl);
      };
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });
    setLimitModal(null); 

    try {
      const res = await saveMenuAction({
        name: formData.name,
        description: formData.description,
        price_per_person: Number(formData.price_per_person),
        internal_cost: formData.internal_cost ? Number(formData.internal_cost) : null,
        image: compressedImage
      });

      // 1. KONTROLLI NËSE KEMI ARRITUR LIMITIN (UPSELL)
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
      // 2. LOGJIKA E ONBOARDING (SETUP WIZARD)
      // ==============================================================
      const searchParams = new URLSearchParams(window.location.search);
      const isOnboarding = searchParams.get('onboarding') === 'true';

      if (isOnboarding) {
        setToast({ show: true, message: "Hapi 2 u përfundua! Po kalojmë tek Ekstrat...", type: "tour" });
        setTimeout(() => {
          // Kalojmë te Ekstrat duke mbajtur stafetën "?onboarding=true"
          router.push(`/${locale}/biznes/ekstra/shto?onboarding=true`);
        }, 2000);
      } else {
        setToast({ show: true, message: t("successMsg"), type: "success" });
        setTimeout(() => {
          router.push(`/${locale}/biznes/menut`);
        }, 1500);
      }

    } catch (error) {
      setToast({ show: true, message: t("networkError"), type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 relative">
      
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

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href={`/${locale}/biznes/menut`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> {t("backBtn")}
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t("pageTitle")}</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">{t("pageSubtitle")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col gap-8">
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <ImageIcon size={18} className="text-blue-500" /> {t("uploadPhotoLabel")}
              </label>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative overflow-hidden group w-full min-h-[200px]">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl shadow-sm" />
              ) : (
                <>
                  <div className="bg-blue-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-blue-500 mb-4 shadow-sm">
                    <ImageIcon size={28} />
                  </div>
                  <p className="text-sm font-black text-gray-700 mb-1">{t("clickToUploadPhoto")}</p>
                  <p className="text-xs text-gray-400 font-medium">{t("recommendedPhotoNote")}</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Utensils size={16} className="text-gray-400" /> {t("menuNameLabel")}
            </label>
            <input type="text" required placeholder={t("menuNamePlaceholder")} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-sm transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
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
                    Kostoja reale e produkteve për këtë menu. Nuk i shfaqet klientit. Shërben vetëm për llogaritjen e fitimit.
                  </div>
                </div>
              </div>
              <input type="number" step="0.01" placeholder="Psh: 12.50" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-orange-500 focus:ring-1 bg-white font-medium text-sm" value={formData.internal_cost} onChange={(e) => setFormData({...formData, internal_cost: e.target.value})} />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                <Banknote size={16} className="text-emerald-500" /> {t("priceLabel")} (Çmimi i Shitjes)
              </label>
              <input type="number" step="0.01" required placeholder={t("pricePlaceholder")} className="w-full border border-emerald-200 p-4 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 bg-white font-black text-sm text-emerald-900 placeholder:text-gray-400" value={formData.price_per_person} onChange={(e) => setFormData({...formData, price_per_person: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <AlignLeft size={16} className="text-gray-400" /> {t("contentLabel")}
            </label>
            <textarea rows={4} required placeholder={t("contentPlaceholder")} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 resize-none font-medium text-sm transition-all leading-relaxed" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <hr className="border-gray-100" />

          <button type="submit" disabled={loading} className="w-full bg-[#0f172a] text-white font-black py-4 rounded-2xl hover:bg-[#1e293b] disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <Save size={20} />
            {loading ? t("savingBtn") : t("saveMenuBtn")}
          </button>
        </form>
      </div>
    </div>
  );
}