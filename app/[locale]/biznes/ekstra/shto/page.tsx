"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sparkles, Banknote, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { saveExtraAction } from "./actions";

export default function AddExtraPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale;
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    name: "", price: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    try {
      const res = await saveExtraAction({
        name: formData.name,
        price: Number(formData.price),
      });

      if (res.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: "Shërbimi Ekstra u ruajt me sukses!", type: "success" });
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
            <div className={`relative mx-auto -mt-16 mb-6 w-24 h-24 rounded-full flex items-center justify-center border-8 border-white shadow-lg ${toast.type === "success" ? "bg-[#F0FDF4] text-emerald-500" : "bg-[#FFF9F2] text-[#E6931E]"}`}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M12 22a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2zm6-6v2H6v-2l2-2V9a4 4 0 0 1 4-4 4 4 0 0 1 4 4v5l2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? "Sukses!" : "Kujdes!"}
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {toast.message}
            </p>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/${locale}/biznes/ekstra`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Kthehu te Ekstrat
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Shto Shërbim Ekstra</h1>
          <p className="text-gray-500 mt-1 text-sm">Përcakto emrin dhe çmimin fiks të shërbimit shtesë.</p>
        </div>
      </div>

      {/* FORMA E RUAJTJES */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Sparkles size={16} className="text-gray-400" /> Emri i Shërbimit
            </label>
            <input 
              type="text" 
              required 
              placeholder="p.sh. DJ Profesional, Kameraman, Ndriçim..." 
              className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Banknote size={16} className="text-gray-400" /> Çmimi Shtesë (€)
            </label>
            <input 
              type="number" 
              step="0.01" 
              required 
              placeholder="p.sh. 250.00" 
              className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" 
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: e.target.value})} 
            />
          </div>
        </div>

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-2">
          <p className="text-sm text-blue-800 font-medium">
            💡 Ky shërbim do të shfaqet në "Hapin 3" të Wizard-it të rezervimeve. Çmimi i tij do t'i shtohet automatikisht faturës finale nëse klienti e zgjedh.
          </p>
        </div>

        <hr className="border-gray-100 my-2" />

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {loading ? "Po Ruhet..." : "Ruaj Shërbimin"}
        </button>
      </form>
      
    </div>
  );
}