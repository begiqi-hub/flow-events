"use client";

import { useState } from "react";
import { ShieldAlert, Save } from "lucide-react";
// Përdorim të njëjtin action nga profili sepse tabela është e njëjta (businesses)
import { updateBusinessProfileAction } from "../profili/actions"; 

export default function PolitikaClient({ business }: { business: any }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    name: business?.name || "",
    phone: business?.phone || "",
    city: business?.city || "",
    cancel_penalty: business?.cancel_penalty?.toString() || "0",
    cancel_days: business?.cancel_days?.toString() || "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateBusinessProfileAction(formData);
    if (res?.error) {
      setToast({ show: true, message: res.error, type: "error" });
    } else {
      setToast({ show: true, message: "Politika u ruajt me sukses!", type: "success" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 relative">
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
             <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? "Sukses!" : "Gabim!"}
            </h3>
            <p className="text-gray-500 text-sm mb-8">{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className="w-full text-white font-bold py-3.5 px-6 rounded-xl bg-[#FFA000] hover:bg-[#e69000]">
              Mbyll
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Politika e Anulimit</h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">Rregullat që do t'u shfaqen klientëve gjatë rezervimit.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl border border-[#FFE7B3] shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-[#FFE7B3] flex items-center gap-3 bg-[#FFF8E6]">
            <div className="p-2.5 bg-[#FFA000] text-white rounded-xl shadow-sm"><ShieldAlert size={20}/></div>
            <h2 className="text-lg font-bold text-gray-900">Politika e Anulimit të Rezervimit</h2>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-2">Penalltia për Anulim (%)</label>
              <p className="text-xs text-gray-500 mb-4 font-medium">Sa përqind e totalit i mbahet klientit nëse anulon?</p>
              <div className="relative">
                <input type="number" min="0" max="100" className="w-full border border-gray-200 p-3.5 pr-10 rounded-xl outline-none focus:border-[#FFA000] bg-white font-black text-gray-900 text-lg" value={formData.cancel_penalty} onChange={(e) => setFormData({...formData, cancel_penalty: e.target.value})} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">%</span>
              </div>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-2">Ditët e Lejuara (Afati)</label>
              <p className="text-xs text-gray-500 mb-4 font-medium">Deri sa ditë para eventit mund të anulohet pa u gjobitur?</p>
              <div className="relative">
                <input type="number" min="0" className="w-full border border-gray-200 p-3.5 pr-12 rounded-xl outline-none focus:border-[#FFA000] bg-white font-black text-gray-900 text-lg" value={formData.cancel_days} onChange={(e) => setFormData({...formData, cancel_days: e.target.value})} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Ditë</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="w-full sm:w-auto bg-[#FFA000] hover:bg-[#e69000] text-white font-bold py-4 px-10 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
            <Save size={20} /> {loading ? "Po Ruhet..." : "Ruaj Politikën"}
          </button>
        </div>
      </form>
    </div>
  );
}