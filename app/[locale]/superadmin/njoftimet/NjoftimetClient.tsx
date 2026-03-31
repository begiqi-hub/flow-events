"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2, Pencil, X, Check, Info, Languages, Calendar, AlertTriangle } from "lucide-react";
import { locales } from "@/config/locales"; // Importojmë 5 gjuhët tona
import { upsertAlert, deleteAlert } from "./actions";
import { useRouter } from "next/navigation";

export default function NjoftimetClient({ locale, alerts }: { locale: string, alerts: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Tab-i aktiv në modal (default: sq)
  const [activeTab, setActiveTab] = useState("sq");

  // Shteti i përkthimeve: Një objekt që mban title/message për çdo gjuhë
  const [translations, setTranslations] = useState<any>({});
  
  const [extraData, setExtraData] = useState({
    type: "info", is_active: true, expires_at: ""
  });

  // Kur hapim modalin për krijim të ri, pastrojmë të dhënat
  const openNewModal = () => {
    setEditingId(null);
    const initialTrans = locales.reduce((acc: any, curr) => {
      acc[curr.id] = { title: "", message: "" };
      return acc;
    }, {});
    setTranslations(initialTrans);
    setExtraData({ type: "info", is_active: true, expires_at: "" });
    setIsModalOpen(true);
  };

  // Kur editojmë një njoftim ekzistues
  const handleEdit = (al: any) => {
    setEditingId(al.id);
    setTranslations(al.translations || {});
    setExtraData({
      type: al.type,
      is_active: al.is_active,
      expires_at: al.expires_at ? new Date(al.expires_at).toISOString().split('T')[0] : ""
    });
    setIsModalOpen(true);
  };

  const updateTranslation = (langId: string, field: "title" | "message", value: string) => {
    setTranslations((prev: any) => ({
      ...prev,
      [langId]: { ...prev[langId], [field]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await upsertAlert(editingId, { ...extraData, translations }, locale);
    if (res.success) {
      setIsModalOpen(false);
      router.refresh();
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 font-sans">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100"><Megaphone size={28} /></div>
            Njoftimet Globale
          </h1>
          <p className="text-gray-500 font-medium mt-1 ml-1">Publiko mesazhe në të gjithë sistemin ({locales.length} gjuhë të mbështetura).</p>
        </div>
        <button onClick={openNewModal} className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl active:scale-95">
          <Plus size={20} /> Krijo Njoftim
        </button>
      </div>

      {/* LISTA E NJOFTIMEVE */}
      <div className="grid gap-4">
        {alerts.length === 0 && <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 text-gray-400 font-bold">Nuk ka njoftime aktive.</div>}
        {alerts.map((al) => {
          const mainTrans = al.translations?.[locale] || al.translations?.["sq"] || { title: "Njoftim pa titull" };
          return (
            <div key={al.id} className={`bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between group ${!al.is_active && 'opacity-50'}`}>
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${al.type === 'danger' ? 'bg-red-50 text-red-500' : al.type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'}`}>
                   {al.type === 'danger' ? <AlertTriangle /> : <Info />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">{mainTrans.title}</h3>
                  <div className="flex gap-2 mt-2">
                    {locales.map(l => (
                      <span key={l.id} title={l.name} className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${al.translations?.[l.id]?.title ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-300 border-gray-100'}`}>
                        {l.id.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(al)} className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-colors"><Pencil size={18}/></button>
                <button onClick={() => confirm("A jeni i sigurt?") && deleteAlert(al.id, locale)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL I KONFIGURIMIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl p-10 my-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900">Konfiguro Njoftimin</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* TABS SELECTOR (Dinamik për 5 gjuhët) */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
                {locales.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setActiveTab(lang.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === lang.id ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <span>{lang.flag}</span> {lang.name}
                  </button>
                ))}
              </div>

              {/* INPUTS PËR GJUHËN AKTIVE */}
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                    Titulli ({activeTab.toUpperCase()})
                  </label>
                  <input 
                    type="text" 
                    required={activeTab === 'sq'}
                    value={translations[activeTab]?.title || ""} 
                    onChange={(e) => updateTranslation(activeTab, "title", e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-400 font-bold" 
                    placeholder="Shkruaj titullin..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                    Përshkrimi i Njoftimit ({activeTab.toUpperCase()})
                  </label>
                  <textarea 
                    rows={4} 
                    required={activeTab === 'sq'}
                    value={translations[activeTab]?.message || ""} 
                    onChange={(e) => updateTranslation(activeTab, "message", e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-400 font-medium text-sm leading-relaxed" 
                    placeholder="Shkruaj tekstin e plotë të njoftimit këtu..."
                  />
                </div>
              </div>

              {/* SETTINGS BASHKËPUNUESE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-50">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Lloji i Urgjencës</label>
                  <select value={extraData.type} onChange={e => setExtraData({...extraData, type: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold outline-none cursor-pointer">
                    <option value="info">Informacion (Blue)</option>
                    <option value="warning">Kujdes (Amber)</option>
                    <option value="danger">Urgjente (Red)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Data e Skadimit</label>
                  <input type="date" value={extraData.expires_at} onChange={e => setExtraData({...extraData, expires_at: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold outline-none cursor-pointer" />
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 px-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                  <input type="checkbox" id="active" checked={extraData.is_active} onChange={e => setExtraData({...extraData, is_active: e.target.checked})} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
                  <label htmlFor="active" className="text-sm font-black text-indigo-900 cursor-pointer">Publiko njoftimin menjëherë (Aktiv)</label>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.8rem] font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98] mt-4">
                {editingId ? "Përditëso Njoftimin" : "Publiko Njoftimin"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}