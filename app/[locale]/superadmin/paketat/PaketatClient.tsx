"use client";

import { useState } from "react";
import { CreditCard, Plus, Layers, Users, Utensils, Bot, LifeBuoy, Bell, BarChart3, Check, Pencil, X, Trash2 } from "lucide-react";
import { upsertPackage, deletePackage } from "./actions";
import { useRouter } from "next/navigation";

export default function PaketatClient({ locale, packages }: { locale: string, packages: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  
  // State i formularit
  const [formData, setFormData] = useState({
    name: "", monthly_price: "", yearly_price: "",
    halls_limit: "1", menus_limit: "5", extras_limit: "5", users_limit: "2"
  });

  const handleEdit = (p: any) => {
    setEditingPackage(p);
    setFormData({
      name: p.name,
      monthly_price: p.monthly_price.toString(),
      yearly_price: p.yearly_price.toString(),
      halls_limit: p.halls_limit.toString(),
      menus_limit: p.menus_limit.toString(),
      extras_limit: p.extras_limit.toString(),
      users_limit: p.users_limit.toString(),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    setFormData({
      name: "", monthly_price: "", yearly_price: "",
      halls_limit: "1", menus_limit: "5", extras_limit: "5", users_limit: "2"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await upsertPackage(editingPackage?.id || null, formData, locale);
    if (res.success) {
      closeModal();
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("A jeni i sigurt që dëshironi ta fshini këtë pako?")) {
      const res = await deletePackage(id, locale);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error);
      }
    }
  };

  // Funksion për të shfaqur "Pa Limit" nëse vlera është -1
  const renderLimit = (val: number) => val === -1 ? "Pa Limit" : val;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-12 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100"><CreditCard size={28}/></div>
            Planet e Abonimit
          </h1>
          <p className="text-gray-500 font-medium mt-1 ml-1">Menaxho paketat dhe limitet për bizneset në platformë.</p>
        </div>
        <button 
          onClick={() => { setEditingPackage(null); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl transition-all active:scale-95"
        >
          <Plus size={20} /> Krijo Pako
        </button>
      </div>

      {/* GRIDI I PAKETAVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((p) => (
          <div key={p.id} className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm hover:shadow-xl transition-all relative group flex flex-col h-full">
            
            {/* ACTION BUTTONS (shfaqen kur kalon mausi) */}
            <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(p)} 
                className="p-2 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-colors hover:bg-indigo-50"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => handleDelete(p.id)} 
                className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors hover:bg-red-50"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* TITULLI DHE ÇMIMI */}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{p.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-indigo-600">{p.monthly_price}€</span>
                <span className="text-gray-400 font-bold text-sm">/ muaj</span>
              </div>
              <p className="text-xs font-black text-emerald-500 mt-2 bg-emerald-50 w-max px-3 py-1.5 rounded-lg uppercase tracking-wider">
                Vjetore: {p.yearly_price}€
              </p>
            </div>

            {/* LIMITET (DALLIMI KRYESOR) */}
            <div className="space-y-4 mb-8">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Kapaciteti</div>
              <LimitItem icon={<Layers size={18}/>} label="Salla të lejuara" value={renderLimit(p.halls_limit)} />
              <LimitItem icon={<Users size={18}/>} label="Përdorues (Staf)" value={renderLimit(p.users_limit)} />
              <LimitItem icon={<Utensils size={18}/>} label="Menu & Ekstra" value={`${renderLimit(p.menus_limit)} / ${renderLimit(p.extras_limit)}`} />
            </div>

            {/* MIRESITE STANDARDE (NJËSOJ PËR TË GJITHA) */}
            <div className="mt-auto pt-8 border-t border-gray-50 space-y-4">
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">Përfshihen në sistem:</div>
              <StaticFeature icon={<Bot size={16}/>} text="Flow AI Assistant" />
              <StaticFeature icon={<LifeBuoy size={16}/>} text="Sistemi i Tiketave & Suporti" />
              <StaticFeature icon={<Bell size={16}/>} text="Njoftimet Real-time" />
              <StaticFeature icon={<BarChart3 size={16}/>} text="Raportet & Analitika" />
            </div>

            <button className="w-full mt-10 py-4 bg-gray-50 text-gray-900 font-black rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              Detajet e Pakos
            </button>
          </div>
        ))}
      </div>

      {/* MODAL I KONFIGURIMIT (ME LABELA TË QARTA SIPËR FUSHAVE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-gray-900">Konfigurimi i Paketës</h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* EMRI */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Emri i Paketës</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-400 font-bold" placeholder="psh. Business Plan" />
              </div>
              
              {/* ÇMIMET */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Çmimi Mujor (€)</label>
                  <input type="number" step="0.01" required value={formData.monthly_price} onChange={e => setFormData({...formData, monthly_price: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Çmimi Vjetor (€)</label>
                  <input type="number" step="0.01" required value={formData.yearly_price} onChange={e => setFormData({...formData, yearly_price: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold" />
                </div>
              </div>

              {/* LIMITET (KËTU KEMI SHTUAR LABELAT TANI) */}
              <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                   Kufizimet (Shkruaj -1 për Pa Limit)
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  {/* FUSHA 1: SALLAT */}
                  <div>
                    <label className="text-[9px] font-black text-amber-400 uppercase ml-1 mb-1.5 block">Nr. i Sallave</label>
                    <input type="number" required value={formData.halls_limit} onChange={e => setFormData({...formData, halls_limit: e.target.value})} className="w-full bg-white border border-amber-200 p-4 rounded-2xl font-bold text-gray-900 outline-none focus:border-amber-400" />
                  </div>
                  {/* FUSHA 2: STAFI */}
                  <div>
                    <label className="text-[9px] font-black text-amber-400 uppercase ml-1 mb-1.5 block">Nr. i Stafit (Users)</label>
                    <input type="number" required value={formData.users_limit} onChange={e => setFormData({...formData, users_limit: e.target.value})} className="w-full bg-white border border-amber-200 p-4 rounded-2xl font-bold text-gray-900 outline-none focus:border-amber-400" />
                  </div>
                  {/* FUSHA 3: MENUTË */}
                  <div>
                    <label className="text-[9px] font-black text-amber-400 uppercase ml-1 mb-1.5 block">Nr. i Menuve</label>
                    <input type="number" required value={formData.menus_limit} onChange={e => setFormData({...formData, menus_limit: e.target.value})} className="w-full bg-white border border-amber-200 p-4 rounded-2xl font-bold text-gray-900 outline-none focus:border-amber-400" />
                  </div>
                  {/* FUSHA 4: EKSTRAT */}
                  <div>
                    <label className="text-[9px] font-black text-amber-400 uppercase ml-1 mb-1.5 block">Nr. i Ekstrave</label>
                    <input type="number" required value={formData.extras_limit} onChange={e => setFormData({...formData, extras_limit: e.target.value})} className="w-full bg-white border border-amber-200 p-4 rounded-2xl font-bold text-gray-900 outline-none focus:border-amber-400" />
                  </div>
                </div>
              </div>

              {/* BUTONI FINAL */}
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98] mt-4">
                {editingPackage ? "Përditëso Paketën" : "Krijo Paketën"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponente ndihmëse për dallimin
function LimitItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-gray-500 font-bold text-sm">
        <span className="text-indigo-500">{icon}</span> {label}
      </div>
      <span className="font-black text-gray-900">{value}</span>
    </div>
  );
}

// Komponente ndihmëse për miresitë fikse
function StaticFeature({ icon, text }: any) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
      <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full shadow-sm"><Check size={12}/></div>
      <span>{text}</span>
    </div>
  );
}