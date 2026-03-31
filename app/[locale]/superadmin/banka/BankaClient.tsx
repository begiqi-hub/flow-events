"use client";

import { useState } from "react";
import { Landmark, Plus, Trash2, CreditCard, User, Globe, X, Pencil } from "lucide-react";
import { addBankAccount, deleteBankAccount, updateBankAccount } from "./actions";
import { useRouter } from "next/navigation";

export default function BankaClient({ locale, accounts }: { locale: string, accounts: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ bank_name: "", account_holder: "", iban: "", swift: "", currency: "EUR" });

  const openEditModal = (acc: any) => {
    setEditingId(acc.id);
    setFormData({
      bank_name: acc.bank_name,
      account_holder: acc.account_holder,
      iban: acc.iban,
      swift: acc.swift || "",
      currency: acc.currency
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ bank_name: "", account_holder: "", iban: "", swift: "", currency: "EUR" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (editingId) {
      res = await updateBankAccount(editingId, formData, locale);
    } else {
      res = await addBankAccount(formData, locale);
    }

    if (res.success) {
      closeModal();
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans"> {/* Ky rresht mungonte */}
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-2xl text-white shadow-lg">
              <Landmark size={28} />
            </div>
            <h1 className="text-3xl font-black text-gray-900">
              Llogaritë Bankare
            </h1>
          </div>
          <p className="text-gray-500 font-medium mt-1">Menaxho llogaritë ku bizneset do të bëjnë pagesat.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl transition-all active:scale-95"
        >
          <Plus size={20} /> Shto Llogari
        </button>
      </div>

      {/* LISTA E LLOGARIVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all relative group overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
              <button 
                onClick={() => openEditModal(acc)}
                className="p-2 bg-white border border-gray-100 text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={() => { if(confirm("A jeni i sigurt?")) deleteBankAccount(acc.id, locale) }}
                className="p-2 bg-white border border-gray-100 text-red-500 rounded-xl shadow-sm hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 font-black text-lg">
              {acc.bank_name.substring(0, 1).toUpperCase()}
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-1">{acc.bank_name}</h3>
            <span className="inline-block bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest mb-4 uppercase">
              {acc.currency}
            </span>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600 text-sm bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                <User size={16} className="text-gray-400" /> <span className="font-bold text-gray-700">{acc.account_holder}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-indigo-50/30 rounded-xl border border-indigo-50">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">IBAN</span>
                <span className="font-mono font-bold text-gray-900 text-xs break-all uppercase">{acc.iban}</span>
              </div>
              {acc.swift && (
                <div className="flex items-center gap-3 text-gray-500 text-xs px-2 font-medium">
                  <Globe size={14} className="text-gray-300" /> SWIFT: <span className="uppercase">{acc.swift}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900">
                {editingId ? "Ndrysho Llogarinë" : "Llogari e Re"}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Emri i Bankës</label>
                <input type="text" required value={formData.bank_name}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-400 font-bold" 
                  onChange={e => setFormData({...formData, bank_name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Mbajtësi i llogarisë</label>
                <input type="text" required value={formData.account_holder}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-400 font-bold text-gray-700" 
                  onChange={e => setFormData({...formData, account_holder: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">IBAN</label>
                <input type="text" required value={formData.iban}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-400 font-bold font-mono text-sm uppercase" 
                  onChange={e => setFormData({...formData, iban: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">SWIFT</label>
                  <input type="text" value={formData.swift}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-400 font-bold font-mono text-sm uppercase" 
                    onChange={e => setFormData({...formData, swift: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Valuta</label>
                  <select 
                    value={formData.currency}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-black outline-none cursor-pointer" 
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="ALL">ALL (L)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4">
                {editingId ? "Ruaj Ndryshimet" : "Krijo Llogarinë"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}