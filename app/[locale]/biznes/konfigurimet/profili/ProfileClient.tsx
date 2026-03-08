"use client";

import { useState } from "react";
import { Building2, Phone, MapPin, CreditCard, ShieldAlert, Save } from "lucide-react";
import { updateBusinessProfileAction } from "./actions";

export default function ProfileClient({ business }: { business: any }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    name: business?.name || "",
    nui: business?.nui || "",
    email: business?.email || "",
    phone: business?.phone || "",
    city: business?.city || "",
    // Politika e Anulimit
    cancel_penalty: business?.cancel_penalty?.toString() || "0",
    cancel_days: business?.cancel_days?.toString() || "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    const res = await updateBusinessProfileAction(formData);
    
    if (res?.error) {
      setToast({ show: true, message: res.error, type: "error" });
    } else {
      setToast({ show: true, message: "Profili u përditësua me sukses!", type: "success" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 relative">
      
      {/* POPUP I MESAZHEVE */}
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
             <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? "Sukses!" : "Gabim!"}
            </h3>
            <p className="text-gray-500 text-sm mb-8">{toast.message}</p>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className={`w-full text-white font-bold py-3.5 px-6 rounded-xl ${toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-[#FF5C39] hover:bg-[#e84e2d]"}`}
            >
              Mbyll
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Profili i Biznesit</h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">Menaxho të dhënat e biznesit, llogaritë bankare dhe politikat e rimbursimit.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* KARTA 1: TË DHËNAT E BIZNESIT */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><Building2 size={20}/></div>
            <h2 className="text-lg font-bold text-gray-900">Të dhënat Bazë</h2>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Emri i Biznesit</label>
              <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 bg-white font-medium text-gray-900" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">NUI (Numri Unik)</label>
              <input type="text" disabled className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 font-medium text-gray-500 cursor-not-allowed" value={formData.nui} title="NUI nuk mund të ndryshohet" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">E-maili (Identifikimi)</label>
              <input type="text" disabled className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 font-medium text-gray-500 cursor-not-allowed" value={formData.email} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Telefoni</label>
              <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 bg-white font-medium text-gray-900" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Qyteti / Adresa</label>
              <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 bg-white font-medium text-gray-900" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </div>
          </div>
        </div>

        {/* KARTA 2: TË DHËNAT BANKARE */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
          <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl"><CreditCard size={20}/></div>
              <h2 className="text-lg font-bold text-gray-900">Llogaria Bankare</h2>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-200 text-gray-500 px-2 py-1 rounded">Opsionale</span>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Emri i Bankës</label>
              <input type="text" placeholder="psh. ProCredit Bank" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-amber-500 bg-white font-medium text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">IBAN / Numri i llogarisë</label>
              <input type="text" placeholder="XK05 0000 0000 0000" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-amber-500 bg-white font-medium text-gray-900" />
            </div>
          </div>
        </div>

        {/* KARTA 3: POLITIKA E ANULIMIT (E RE) */}
        <div className="bg-white rounded-3xl border border-[#FFE7B3] shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-[#FFE7B3] flex items-center gap-3 bg-[#FFF8E6]">
            <div className="p-2.5 bg-[#FFA000] text-white rounded-xl shadow-sm"><ShieldAlert size={20}/></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Politika e Anulimit të Rezervimit</h2>
              <p className="text-xs text-gray-600 font-medium mt-0.5">Kjo rregullore do t'u shfaqet klientëve kur të krijoni një rezervim.</p>
            </div>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-2">Penalltia për Anulim (%)</label>
              <p className="text-xs text-gray-500 mb-4 font-medium">Sa përqind e paradhënies/totalit i mbahet klientit nëse e anulon eventin?</p>
              <div className="relative">
                <input type="number" min="0" max="100" className="w-full border border-gray-200 p-3.5 pr-10 rounded-xl outline-none focus:border-[#FFA000] bg-white font-black text-gray-900 text-lg" value={formData.cancel_penalty} onChange={(e) => setFormData({...formData, cancel_penalty: e.target.value})} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">%</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-2">Ditët e Lejuara (Afati)</label>
              <p className="text-xs text-gray-500 mb-4 font-medium">Deri sa ditë para eventit mund të anulohet pa u gjobitur klienti?</p>
              <div className="relative">
                <input type="number" min="0" className="w-full border border-gray-200 p-3.5 pr-12 rounded-xl outline-none focus:border-[#FFA000] bg-white font-black text-gray-900 text-lg" value={formData.cancel_days} onChange={(e) => setFormData({...formData, cancel_days: e.target.value})} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Ditë</span>
              </div>
            </div>
          </div>
        </div>

        {/* BUTONI RUAJ */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white font-bold py-4 px-10 rounded-xl disabled:bg-gray-600 transition-all flex items-center justify-center gap-2 shadow-lg">
            <Save size={20} />
            {loading ? "Po Ruhet..." : "Ruaj Konfigurimet"}
          </button>
        </div>

      </form>
    </div>
  );
}