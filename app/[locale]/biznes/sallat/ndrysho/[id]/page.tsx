"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl"; 
import { Building2, Users, Image as ImageIcon, ArrowLeft, Save, AlignLeft, Check, Activity } from "lucide-react";
import Link from "next/link";
import { updateHallAction, getHallAction } from "./actions";

export default function EditHallPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  
  const t = useTranslations("EditHall");
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    name: "", capacity: "", description: "", image: "", parking: true, ac: true, status: "active"
  });

  useEffect(() => {
    async function loadData() {
      const data = await getHallAction(id);
      if (data) {
        setFormData({
          name: data.name, capacity: data.capacity.toString(),
          description: data.description || "", image: data.image || "",
          parking: data.parking, ac: data.ac,
          status: data.status || "active" // SHTUAR STATUSI KËTU
        });
      } else {
        setToast({ show: true, message: t("notFound"), type: "error" });
      }
      setFetching(false);
    }
    loadData();
  }, [id, t]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    try {
      const res = await updateHallAction(id, formData);
      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: t("successMsg"), type: "success" });
        setTimeout(() => { router.push(`/${locale}/biznes/sallat`); }, 1500);
      }
    } catch (error) {
      setToast({ show: true, message: t("networkError"), type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 relative min-h-[80vh]">
      
      {/* POPUP I GABIMIT/SUKSESIT */}
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
            <div className={`relative mx-auto -mt-16 mb-6 w-24 h-24 rounded-full flex items-center justify-center border-8 border-white shadow-lg ${toast.type === "success" ? "bg-[#F0FDF4] text-emerald-500" : "bg-[#FFF9F2] text-[#E6931E]"}`}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                {toast.type === "success" 
                  ? <path d="M12 22a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2zm6-6v2H6v-2l2-2V9a4 4 0 0 1 4-4 4 4 0 0 1 4 4v5l2 2z" />
                  : <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                }
              </svg>
            </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? t("successTitle") : t("warningTitle")}
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">{toast.message}</p>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : "bg-[#FF5C39] hover:bg-[#e84e2d] shadow-orange-200"}`}
            >
              {t("closeBtn")} <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      )}

      {/* KOKA E FAQES */}
      <div className="mb-8">
        <Link href={`/${locale}/biznes/sallat`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> {t("backBtn")}
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t("pageTitle")}</h1>
        <p className="text-gray-500 mt-2 text-sm">{t("pageSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 flex flex-col transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* SHTUAR: STATUSI I SALLËS */}
        <div className="mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${formData.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              <Activity size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{t("statusLabel")}</p>
              <p className="text-xs text-gray-500 font-medium">
                {formData.status === 'active' ? t("statusActiveDesc") : t("statusInactiveDesc")}
              </p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={formData.status === 'active'}
              onChange={(e) => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
          </label>
        </div>

        {/* FOTOJA E SALLËS */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-3">
            <ImageIcon size={18} /> {t("uploadPhotoLabel")}
          </label>
          
          <label className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-gray-50/50 relative overflow-hidden group min-h-[160px] cursor-pointer hover:bg-gray-100 transition-colors">
            {formData.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl shadow-sm mb-3"><ImageIcon className="text-blue-500" size={24}/></div>
                  <p className="text-sm font-bold text-gray-900">{t("photoUploaded")}</p>
                  <p className="text-xs text-gray-700 mt-1 font-bold bg-white/80 px-3 py-1.5 rounded-lg shadow-sm">{t("clickToChangePhoto")}</p>
                </div>
              </>
            ) : (
              <div className="relative z-10 flex flex-col items-center py-6">
                <div className="bg-blue-50 p-3 rounded-xl shadow-sm mb-3"><ImageIcon className="text-blue-500" size={24}/></div>
                <p className="text-sm font-medium text-gray-600">{t("clickToUploadPhoto")}</p>
                <p className="text-xs text-gray-400 mt-1">{t("autoCompressNote")}</p>
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleImageUpload} 
            />
          </label>
        </div>

        {/* EMRI DHE KAPACITETI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
              <Building2 size={16} /> {t("hallNameLabel")}
            </label>
            <input type="text" required placeholder={t("hallNamePlaceholder")} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-gray-900" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
              <Users size={16} /> {t("capacityLabel")}
            </label>
            <input type="number" required placeholder={t("capacityPlaceholder")} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-gray-900" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
          </div>
        </div>

        {/* CHECKBOXES (Stili i Zi Katror) */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border border-gray-100 p-5 rounded-2xl mb-8">
          <label className="flex-1 w-full flex items-center justify-between cursor-pointer group">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">{t("parkingLabel")}</span>
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${formData.parking ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
              {formData.parking && <Check size={14} className="text-white" strokeWidth={4} />}
            </div>
            <input type="checkbox" className="hidden" checked={formData.parking} onChange={(e) => setFormData({...formData, parking: e.target.checked})} />
          </label>
          
          <div className="hidden sm:block w-px h-8 bg-gray-100"></div>
          
          <label className="flex-1 w-full flex items-center justify-between cursor-pointer group">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">{t("acLabel")}</span>
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${formData.ac ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
              {formData.ac && <Check size={14} className="text-white" strokeWidth={4} />}
            </div>
            <input type="checkbox" className="hidden" checked={formData.ac} onChange={(e) => setFormData({...formData, ac: e.target.checked})} />
          </label>
        </div>

        {/* PËRSHKRIMI */}
        <div className="mb-10">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
            <AlignLeft size={16} /> {t("descriptionLabel")}
          </label>
          <textarea rows={4} placeholder={t("descriptionPlaceholder")} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 resize-none font-medium text-gray-700" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* BUTONI RUAJ */}
        <button type="submit" disabled={loading || fetching} className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-black disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-lg">
          <Save size={20} />
          {loading ? t("savingBtn") : t("saveChangesBtn")}
        </button>

      </form>
    </div>
  );
}