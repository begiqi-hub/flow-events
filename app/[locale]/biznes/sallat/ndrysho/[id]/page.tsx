"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Building2, Users, Image as ImageIcon, ArrowLeft, Save, AlignLeft, Check } from "lucide-react";
import Link from "next/link";
import { updateHallAction, getHallAction } from "./actions";

export default function EditHallPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    name: "", capacity: "", description: "", image: "", parking: true, ac: true
  });

  useEffect(() => {
    async function loadData() {
      const data = await getHallAction(id);
      if (data) {
        setFormData({
          name: data.name, capacity: data.capacity.toString(),
          description: data.description || "", image: data.image || "",
          parking: data.parking, ac: data.ac
        });
      } else {
        setToast({ show: true, message: "Kjo Sallë nuk u gjet!", type: "error" });
      }
      setFetching(false);
    }
    loadData();
  }, [id]);

  // FUNKSIONI I RI PËR TË NGARKUAR FOTON DIREKT NGA KOMPJUTERI
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
        setToast({ show: true, message: "Salla u përditësua me sukses!", type: "success" });
        setTimeout(() => { router.push(`/${locale}/biznes/sallat`); }, 1500);
      }
    } catch (error) {
      setToast({ show: true, message: "Mungon interneti ose serveri nuk përgjigjet.", type: "error" });
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
              {toast.type === "success" ? "Sukses!" : "Kujdes!"}
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">{toast.message}</p>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : "bg-[#FF5C39] hover:bg-[#e84e2d] shadow-orange-200"}`}
            >
              Mbyll <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      )}

      {/* KOKA E FAQES */}
      <div className="mb-8">
        <Link href={`/${locale}/biznes/sallat`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Kthehu te Sallat
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ndrysho Hapësirë / Sallë</h1>
        <p className="text-gray-500 mt-2 text-sm">Përditëso specifikat për ta bërë sallën tënde më tërheqëse.</p>
      </div>

      <form onSubmit={handleSubmit} className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 flex flex-col transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* FOTOJA E SALLËS (Tani është e klikueshme pa fushë teksti!) */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-3">
            <ImageIcon size={18} /> Ngarko Foton e Sallës
          </label>
          
          <label className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-gray-50/50 relative overflow-hidden group min-h-[160px] cursor-pointer hover:bg-gray-100 transition-colors">
            {formData.image ? (
              <>
                <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl shadow-sm mb-3"><ImageIcon className="text-blue-500" size={24}/></div>
                  <p className="text-sm font-bold text-gray-900">Fotoja është ngarkuar</p>
                  <p className="text-xs text-gray-700 mt-1 font-bold bg-white/80 px-3 py-1.5 rounded-lg shadow-sm">Kliko për ta ndryshuar foton</p>
                </div>
              </>
            ) : (
              <div className="relative z-10 flex flex-col items-center py-6">
                <div className="bg-blue-50 p-3 rounded-xl shadow-sm mb-3"><ImageIcon className="text-blue-500" size={24}/></div>
                <p className="text-sm font-medium text-gray-600">Kliko për të ngarkuar foton</p>
                <p className="text-xs text-gray-400 mt-1">Sistemi e kompreson automatikisht për shpejtësi</p>
              </div>
            )}
            
            {/* Input i fshehur që hap skedarët e kompjuterit */}
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
              <Building2 size={16} /> Emri i Sallës
            </label>
            <input type="text" required placeholder="p.sh. Salla Diamant" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-gray-900" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
              <Users size={16} /> Kapaciteti (Maksimal)
            </label>
            <input type="number" required placeholder="p.sh. 300" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-gray-900" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
          </div>
        </div>

        {/* CHECKBOXES (Stili i Zi Katror) */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border border-gray-100 p-5 rounded-2xl mb-8">
          <label className="flex-1 w-full flex items-center justify-between cursor-pointer group">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">Ka Parkim të dedikuar?</span>
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${formData.parking ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
              {formData.parking && <Check size={14} className="text-white" strokeWidth={4} />}
            </div>
            <input type="checkbox" className="hidden" checked={formData.parking} onChange={(e) => setFormData({...formData, parking: e.target.checked})} />
          </label>
          
          <div className="hidden sm:block w-px h-8 bg-gray-100"></div>
          
          <label className="flex-1 w-full flex items-center justify-between cursor-pointer group">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">Klimatizim qendror?</span>
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${formData.ac ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
              {formData.ac && <Check size={14} className="text-white" strokeWidth={4} />}
            </div>
            <input type="checkbox" className="hidden" checked={formData.ac} onChange={(e) => setFormData({...formData, ac: e.target.checked})} />
          </label>
        </div>

        {/* PËRSHKRIMI */}
        <div className="mb-10">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
            <AlignLeft size={16} /> Përshkrimi i Sallës
          </label>
          <textarea rows={4} placeholder="Përshkruani detajet që e bëjnë këtë sallë të veçantë..." className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 resize-none font-medium text-gray-700" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* BUTONI RUAJ */}
        <button type="submit" disabled={loading || fetching} className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-black disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-lg">
          <Save size={20} />
          {loading ? "Po Ruhet..." : "Ruaj Ndryshimet"}
        </button>

      </form>
    </div>
  );
}