"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Banknote, ArrowLeft, Save, Wallet, Info } from "lucide-react";
import Link from "next/link";
import { updateExtraAction, getExtraAction } from "./actions";
import { useTranslations } from "next-intl"; 

export default function EditExtraPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  
  const t = useTranslations("EditExtra");
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    name: "", price: "", internal_cost: ""
  });

  useEffect(() => {
    async function loadData() {
      const data = await getExtraAction(id);
      if (data) {
        setFormData({
          name: data.name,
          price: data.price.toString(),
          internal_cost: data.internal_cost ? data.internal_cost.toString() : ""
        });
      } else {
        setToast({ show: true, message: t("notFound"), type: "error" });
      }
      setFetching(false);
    }
    loadData();
  }, [id, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    try {
      const res = await updateExtraAction(id, {
        name: formData.name,
        price: Number(formData.price),
        internal_cost: formData.internal_cost ? Number(formData.internal_cost) : null,
      });

      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
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
    <div className="max-w-3xl mx-auto p-4 md:p-8 relative min-h-[80vh]">
      
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
             <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? t("successTitle") : t("warningTitle")}
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {toast.message}
            </p>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl ${toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-[#FF5C39] hover:bg-[#e84e2d]"}`}
            >
              {t("closeBtn")}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/${locale}/biznes/ekstra`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> {t("backBtn")}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t("pageTitle")}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col gap-6 transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Sparkles size={16} className="text-gray-400" /> {t("extraNameLabel")}
          </label>
          {/* RREGULLIMI */}
          <input 
            type="text" 
            required 
            placeholder={fetching ? "Po ngarkohet..." : t("extraNamePlaceholder")} 
            className="w-full bg-white border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 text-gray-900 font-medium placeholder:text-gray-400" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <Wallet size={16} className="text-orange-500" /> Kostoja (e Brendshme)
              </label>
              <div className="group relative cursor-pointer">
                <Info size={14} className="text-gray-400 hover:text-gray-600" />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-center z-10">
                  Kostoja reale e këtij shërbimi. Nuk i shfaqet klientit.
                </div>
              </div>
            </div>
            {/* RREGULLIMI */}
            <input 
              type="number" 
              step="0.01" 
              placeholder="Psh: 150.00" 
              className="w-full bg-white border border-gray-200 p-3 rounded-xl outline-none focus:border-orange-500 focus:ring-1 text-gray-900 font-medium placeholder:text-gray-400" 
              value={formData.internal_cost} 
              onChange={(e) => setFormData({...formData, internal_cost: e.target.value})} 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
              <Banknote size={16} className="text-emerald-500" /> {t("priceLabel")} (Shitet)
            </label>
            {/* RREGULLIMI */}
            <input 
              type="number" 
              step="0.01" 
              required 
              placeholder={fetching ? "Po ngarkohet..." : t("pricePlaceholder")} 
              className="w-full bg-white border border-emerald-200 p-3 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 text-emerald-900 font-black placeholder:text-gray-400" 
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: e.target.value})} 
            />
          </div>
        </div>

        <hr className="border-gray-100 my-2" />

        <button 
          type="submit" 
          disabled={loading || fetching} 
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {loading ? t("savingBtn") : t("saveChangesBtn")}
        </button>
      </form>
      
    </div>
  );
}