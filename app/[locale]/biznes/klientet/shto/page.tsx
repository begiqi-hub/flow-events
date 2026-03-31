"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Users, Phone, Mail, ArrowLeft, Save, FileDigit, MapPin, Building2 } from "lucide-react";
import Link from "next/link";
import { saveClientAction } from "../actions"; 
import { useTranslations } from "next-intl"; 

export default function AddClientPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const t = useTranslations("AddClient");
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [clientType, setClientType] = useState("individual");
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", personal_id: "", city: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    try {
      const dataToSave = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        personal_id: clientType === "individual" ? formData.personal_id : null,
        business_num: clientType === "business" ? formData.personal_id : null,
        city: formData.city,
        client_type: clientType
      };

      const res = await saveClientAction(dataToSave);

      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: t("successAdd"), type: "success" });
        setTimeout(() => { router.push(`/${locale}/biznes/klientet`); }, 1500);
      }
    } catch (error) {
      setToast({ show: true, message: t("networkError"), type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 relative min-h-[80vh]">
      
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
             <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? t("successTitle") : t("warningTitle")}
            </h3>
            <p className="text-gray-500 text-sm mb-8">{toast.message}</p>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl ${toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-[#FF5C39] hover:bg-[#e84e2d]"}`}
            >
              {t("closeBtn")}
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <Link href={`/${locale}/biznes/klientet`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> {t("backBtn")}
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
           {t("pageTitle")}
        </h1>
        <p className="text-gray-500 mt-2 text-sm">{t("pageSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col gap-8">
        
        {/* LLOJI I KLIENTIT */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">{t("typeLabel")}</label>
          <div className="flex bg-gray-100 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => setClientType("individual")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${clientType === "individual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Users size={16}/> {t("individual")}
            </button>
            <button
              type="button"
              onClick={() => setClientType("business")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${clientType === "business" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Building2 size={16}/> {t("business")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {clientType === "business" ? <Building2 size={14} /> : <Users size={14} />} 
              {t("nameLabel")}
            </label>
            <input 
              type="text" required 
              placeholder={clientType === "business" ? t("businessNamePlaceholder") : t("namePlaceholder")}
              className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-bold text-gray-900" 
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <FileDigit size={14} /> {clientType === "business" ? t("businessIdLabel") : t("idLabel")}
            </label>
            <input 
              type="text" 
              placeholder={clientType === "business" ? t("businessIdPlaceholder") : t("idPlaceholder")}
              className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-gray-900" 
              value={formData.personal_id} onChange={(e) => setFormData({...formData, personal_id: e.target.value})} 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <Phone size={14} /> {t("phoneLabel")}
            </label>
            <input 
              type="text" required 
              placeholder={t("phonePlaceholder")}
              className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-gray-900" 
              value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <MapPin size={14} /> {t("cityLabel")}
            </label>
            <input 
              type="text" 
              placeholder={t("cityPlaceholder")}
              className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-gray-900" 
              value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <Mail size={14} /> {t("emailLabel")}
            </label>
            <input 
              type="email" 
              placeholder={t("emailPlaceholder")}
              className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-gray-900" 
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        <button type="submit" disabled={loading} className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-black disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-sm">
          <Save size={18} /> {loading ? t("savingBtn") : t("saveBtn")}
        </button>
      </form>
      
    </div>
  );
}