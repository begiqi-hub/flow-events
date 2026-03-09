"use client";

import { useState } from "react";
import { Building2, Save } from "lucide-react";
import { updateBusinessProfileAction } from "./actions";

export default function ProfileClient({ business }: { business: any }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    name: business?.name || "",
    phone: business?.phone || "",
    city: business?.city || "",
    cancel_penalty: business?.cancel_penalty || 0, // I mbajmë fshehurazi për action-in
    cancel_days: business?.cancel_days || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
             <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? "Sukses!" : "Gabim!"}
            </h3>
            <p className="text-gray-500 text-sm mb-8">{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className="w-full text-white font-bold py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600">
              Mbyll
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Profili i Biznesit</h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">Menaxho të dhënat e biznesit tënd.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
              <input type="text" disabled className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 font-medium text-gray-500 cursor-not-allowed" value={business?.nui || ""} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">E-maili (Identifikimi)</label>
              <input type="text" disabled className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 font-medium text-gray-500 cursor-not-allowed" value={business?.email || ""} />
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

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white font-bold py-4 px-10 rounded-xl disabled:bg-gray-600 transition-all flex items-center justify-center gap-2 shadow-lg">
            <Save size={20} /> {loading ? "Po Ruhet..." : "Ruaj Ndryshimet"}
          </button>
        </div>
      </form>
    </div>
  );
}