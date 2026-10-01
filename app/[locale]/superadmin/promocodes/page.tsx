"use client";

import { useState, useEffect } from "react";
import { Ticket, Plus, Tag, Calendar, Users, AlertCircle, CheckCircle2 } from "lucide-react";

// Ndërfaqja për strukturën e të dhënave të Promo Kodit
interface PromoCode {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export default function SuperadminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxUses: "",
    expiresAt: "",
  });

  // Këtu do të bënim fetch të dhënat nga API kur faqja hapet
  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      // Shënim: Duhet të krijoni një API GET në /api/superadmin/promo-codes për të marrë listën
      const res = await fetch("/api/superadmin/promo-codes");
      if (res.ok) {
        const data = await res.json();
        setPromoCodes(data.promoCodes || []);
      }
    } catch (err) {
      console.error("Gabim gjatë marrjes së kodeve", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/superadmin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Promo Kodi u krijua me sukses!");
        // Rifresko listën
        fetchPromoCodes();
        // Pastro formën
        setFormData({ code: "", discountType: "PERCENTAGE", discountValue: "", maxUses: "", expiresAt: "" });
      } else {
        setError(data.error || "Ndodhi një gabim gjatë krijimit.");
      }
    } catch (err) {
      setError("Gabim në lidhje me serverin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Koka e Faqes */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
            <Ticket size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Menaxhimi i Promo Kodeve</h1>
            <p className="text-gray-500 font-medium">Krijoni kupona zbritjeje për klientët dhe bizneset e reja.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMA E KRIJIMIT (Kolona e majtë) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" /> Krijo Kod të Ri
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 font-bold flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-4 font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Kodi (psh. HALLEVO20)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="ZBRITJE2026"
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all font-bold text-gray-900 uppercase" 
                    value={formData.code} 
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Lloji</label>
                    <select 
                      className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:bg-white font-semibold text-gray-900"
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value as "PERCENTAGE" | "FIXED"})}
                    >
                      <option value="PERCENTAGE">Përqindje (%)</option>
                      <option value="FIXED">Vlerë Fikse (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Vlera</label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      placeholder={formData.discountType === "PERCENTAGE" ? "20" : "50"}
                      className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:bg-white font-bold text-gray-900" 
                      value={formData.discountValue} 
                      onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Users size={12} /> Limiti i Përdorimeve (Opsionale)
                  </label>
                  <input 
                    type="number" 
                    placeholder="Lëre bosh për pa limit"
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:bg-white font-semibold text-gray-900" 
                    value={formData.maxUses} 
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Calendar size={12} /> Skadon më (Opsionale)
                  </label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:bg-white font-semibold text-gray-900" 
                    value={formData.expiresAt} 
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {loading ? "Duke ruajtur..." : "Ruaj Kodin"}
                </button>
              </form>
            </div>
          </div>

          {/* TABELA E KODEVE (Kolona e djathtë) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Tag size={20} className="text-gray-400" /> Kodet Aktive
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-xs font-black text-gray-400 uppercase tracking-widest">
                      <th className="p-4 border-b border-gray-100">Kodi</th>
                      <th className="p-4 border-b border-gray-100">Zbritja</th>
                      <th className="p-4 border-b border-gray-100">Përdorimet</th>
                      <th className="p-4 border-b border-gray-100">Statusi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">
                          Nuk ka asnjë promo kod të krijuar ende.
                        </td>
                      </tr>
                    ) : (
                      promoCodes.map((promo) => (
                        <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 border-b border-gray-50 font-bold text-gray-900">
                            {promo.code}
                          </td>
                          <td className="p-4 border-b border-gray-50 font-semibold text-gray-600">
                            {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : `${promo.discountValue}€`}
                          </td>
                          <td className="p-4 border-b border-gray-50 text-sm font-medium text-gray-500">
                            {promo.usedCount} {promo.maxUses ? `/ ${promo.maxUses}` : '(Pa limit)'}
                          </td>
                          <td className="p-4 border-b border-gray-50">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {promo.isActive ? 'Aktiv' : 'Jo Aktiv'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}