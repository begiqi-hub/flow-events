"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Banknote, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { updateExtraAction, getExtraAction } from "./actions";

export default function EditExtraPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    name: "", price: ""
  });

  // TËRHEQJA E TË DHËNAVE TË VJETRA KUR HAPET FAQJA
  useEffect(() => {
    async function loadData() {
      const data = await getExtraAction(id);
      if (data) {
        setFormData({
          name: data.name,
          price: data.price.toString()
        });
      } else {
        setToast({ show: true, message: "Kjo Ekstra nuk u gjet!", type: "error" });
      }
      setFetching(false);
    }
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    try {
      const res = await updateExtraAction(id, {
        name: formData.name,
        price: Number(formData.price),
      });

      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: "Shërbimi Ekstra u përditësua me sukses!", type: "success" });
        setTimeout(() => {
          router.push(`/${locale}/biznes/ekstra`);
        }, 1500);
      }
    } catch (error) {
      setToast({ show: true, message: "Mungon interneti ose serveri nuk përgjigjet.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 relative min-h-[80vh]">
      
      {/* POPUP-i MODERN */}
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
             <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? "Sukses!" : "Kujdes!"}
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {toast.message}
            </p>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl ${toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-[#FF5C39] hover:bg-[#e84e2d]"}`}
            >
              Mbyll
            </button>
          </div>
        </div>
      )}

      {/* KOKA E FAQES */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/${locale}/biznes/ekstra`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Kthehu te Ekstrat
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Ndrysho Shërbimin Ekstra</h1>
        </div>
      </div>

      {/* FORMA E PËRDITËSIMIT */}
      <form onSubmit={handleSubmit} className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col gap-6 transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Sparkles size={16} className="text-gray-400" /> Emri i Ri i Shërbimit
            </label>
            <input 
              type="text" 
              required 
              placeholder={fetching ? "Po ngarkohet..." : "Shkruaj emrin e ri..."} 
              className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Banknote size={16} className="text-gray-400" /> Çmimi i Ri (€)
            </label>
            <input 
              type="number" 
              step="0.01" 
              required 
              placeholder={fetching ? "Po ngarkohet..." : "Shkruaj çmimin e ri..."} 
              className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" 
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
          {loading ? "Po Përditësohet..." : "Ruaj Ndryshimet"}
        </button>
      </form>
      
    </div>
  );
}