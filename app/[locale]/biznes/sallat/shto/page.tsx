"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { 
  Building2, Users, ArrowLeft, Save, Image as ImageIcon, 
  Car, Wind, AlignLeft, CheckCircle2, AlertCircle, Sparkles,
  Crown, Zap 
} from "lucide-react";
import Link from "next/link";
import { saveHallAction } from "../actions"; 

export default function AddHallPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "sq"; 
  
  // LOGJIKA E RE E PATHYESHME PËR URL
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [limitModal, setLimitModal] = useState<{title: string, message: string} | null>(null);

  const [compressedImage, setCompressedImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  
  const [formData, setFormData] = useState({
    name: "", capacity: "", description: "", parking: true, ac: true
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
      const res = await saveHallAction({
        name: formData.name,
        capacity: Number(formData.capacity),
        description: formData.description,
        parking: formData.parking,
        ac: formData.ac,
        image: compressedImage
      });

      if (res.isLimitError) {
        setLoading(false);
        setLimitModal({ title: res.limitTitle || "Limit i arritur", message: res.error || "" });
        return;
      }

      if (res.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
        return;
      }

      // ==============================================================
      // LOGJIKA E ONBOARDING (SETUP WIZARD)
      // ==============================================================
      if (isOnboarding) {
        setToast({ show: true, message: "Salla u ruajt! Po kalojmë tek Menutë...", type: "tour" });
        setTimeout(() => {
          // Kalojmë te Menutë duke i mbajtur param 'onboarding'
          router.push(`/${locale}/biznes/menut/shto?onboarding=true`); 
        }, 2000);
      } else {
        setToast({ show: true, message: "Salla u ruajt me sukses!", type: "success" });
        setTimeout(() => {
          router.push(`/${locale}/biznes/sallat`); 
        }, 1500);
      }
      
    } catch (error) {
      setToast({ show: true, message: "Mungon interneti ose serveri nuk përgjigjet.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 relative">
      
      {/* POPUP NORMAL I TURIT/SUKSESIT */}
      {toast.show && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          toast.type === "success" ? "bg-emerald-600" : 
          toast.type === "tour" ? "bg-indigo-600 border border-indigo-400" : "bg-red-600"
        }`}>
          {toast.type === "success" && <CheckCircle2 size={24} />}
          {toast.type === "tour" && <Sparkles size={24} className="text-yellow-300 animate-pulse" />}
          {toast.type === "error" && <AlertCircle size={24} />}
          <span className="text-sm sm:text-base">{toast.message}</span>
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
            <Link href={`/${locale}/biznes/sallat`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Kthehu te Sallat
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shto Hapësirë / Sallë</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Plotëso specifikat për ta bërë sallën tënde më tërheqëse.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col gap-8">
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <ImageIcon size={18} className="text-blue-500" /> Ngarko Foton e Sallës
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
                  <p className="text-sm font-black text-gray-700 mb-1">Kliko për të ngarkuar foton</p>
                  <p className="text-xs text-gray-400 font-medium">Sistemi e kompreson automatikisht për shpejtësi</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Building2 size={16} className="text-gray-400" /> Emri i Sallës
              </label>
              <input type="text" required placeholder="p.sh. Salla Diamant" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-sm transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Users size={16} className="text-gray-400" /> Kapaciteti (Maksimal)
              </label>
              <input type="number" required placeholder="p.sh. 300" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-sm transition-all" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                  <Car size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                Ka Parkim të dedikuar?
              </div>
              <input type="checkbox" className="w-5 h-5 accent-gray-900 cursor-pointer" checked={formData.parking} onChange={(e) => setFormData({...formData, parking: e.target.checked})} />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                  <Wind size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                Klimatizim qendror?
              </div>
              <input type="checkbox" className="w-5 h-5 accent-gray-900 cursor-pointer" checked={formData.ac} onChange={(e) => setFormData({...formData, ac: e.target.checked})} />
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <AlignLeft size={16} className="text-gray-400" /> Përshkrimi i Sallës
            </label>
            <textarea rows={4} placeholder="Përshkruani detajet që e bëjnë këtë sallë të veçantë..." className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 resize-none font-medium text-sm transition-all leading-relaxed" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <hr className="border-gray-100" />

          <button type="submit" disabled={loading} className="w-full bg-[#0f172a] text-white font-black py-4 rounded-2xl hover:bg-[#1e293b] disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <Save size={20} />
            {loading ? "Po Ruhet..." : "Ruaj Sallën"}
          </button>
        </form>
      </div>
    </div>
  );
}