"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Utensils, Banknote, Image as ImageIcon, ArrowLeft, Save, AlignLeft } from "lucide-react";
import Link from "next/link";
import { updateMenuAction, getMenuAction } from "./actions";

export default function EditMenuPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    name: "", price_per_person: "", description: "", image: ""
  });

  useEffect(() => {
    async function loadData() {
      const data = await getMenuAction(id);
      if (data) {
        setFormData({
          name: data.name, 
          price_per_person: data.price_per_person.toString(),
          description: data.description || "", 
          image: data.image || ""
        });
      } else {
        setToast({ show: true, message: "Kjo Menu nuk u gjet!", type: "error" });
      }
      setFetching(false);
    }
    loadData();
  }, [id]);

  // FUNKSIONI PËR TË NGARKUAR FOTON DIREKT NGA KOMPJUTERI
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
      const res = await updateMenuAction(id, formData);
      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: "Menuja u përditësua me sukses!", type: "success" });
        setTimeout(() => { router.push(`/${locale}/biznes/menut`); }, 1500);
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
        <Link href={`/${locale}/biznes/menut`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Kthehu te Menutë
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ndrysho Menunë</h1>
        <p className="text-gray-500 mt-2 text-sm">Përditëso pakot e ushqimit dhe çmimet e tyre.</p>
      </div>

      <form onSubmit={handleSubmit} className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 flex flex-col transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* FOTOJA E MENUSË (E klikueshme) */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-3">
            <ImageIcon size={18} /> Ngarko Foton e Pjatës/Menusë
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
            
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleImageUpload} 
            />
          </label>
        </div>

        {/* EMRI DHE ÇMIMI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
              <Utensils size={16} /> Emri i Menusë / Pakos
            </label>
            <input type="text" required placeholder="p.sh. Menu Tradicionale" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-gray-900" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
              <Banknote size={16} /> Çmimi për Person (€)
            </label>
            <input type="number" step="0.01" required placeholder="p.sh. 25.50" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 font-medium text-gray-900" value={formData.price_per_person} onChange={(e) => setFormData({...formData, price_per_person: e.target.value})} />
          </div>
        </div>

        {/* PËRSHKRIMI */}
        <div className="mb-10">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
            <AlignLeft size={16} /> Përshkrimi i Ushqimeve (Çfarë përmban?)
          </label>
          <textarea rows={4} placeholder="Përshkruani pjatat, antipastat dhe çfarë ofrohet në këtë pako..." className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 resize-none font-medium text-gray-700" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* BUTONI RUAJ */}
        <button type="submit" disabled={loading || fetching} className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-black disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-sm">
          <Save size={20} />
          {loading ? "Po Ruhet..." : "Ruaj Ndryshimet"}
        </button>

      </form>
    </div>
  );
}