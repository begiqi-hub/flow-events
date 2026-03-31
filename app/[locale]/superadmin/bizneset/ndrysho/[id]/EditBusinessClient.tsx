"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Building2, Save, ArrowLeft, ShieldAlert, CreditCard, Mail, Phone, CalendarClock } from "lucide-react";
import Link from "next/link";
import { updateBusinessAction } from "./actions";

export default function EditBusinessClient({ locale, business, packages }: { locale: string, business: any, packages: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: business.name || "",
    email: business.email || "",
    phone: business.phone || "",
    status: business.status || "trial",
    packageId: business.packageId || "",
    trialEndsAt: business.trialEndsAt ? format(new Date(business.trialEndsAt), "yyyy-MM-dd") : ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await updateBusinessAction(business.id, formData);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push(`/${locale}/superadmin/bizneset`);
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href={`/${locale}/superadmin/bizneset`}
            className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Menaxho: {business.name}</h1>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-0.5">
              ID: <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{business.id}</span>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 mb-6 flex items-center gap-3 font-bold text-sm">
          <ShieldAlert size={18}/> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* BLOKU 1: TË DHËNAT BAZË */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Building2 size={16}/> Të Dhënat e Kontaktit
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Emri Kompanisë</label>
              <input 
                type="text" name="name" required
                value={formData.name} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1"><Mail size={12}/> Email Kryesor</label>
              <input 
                type="email" name="email" required
                value={formData.email} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1"><Phone size={12}/> Telefon</label>
              <input 
                type="text" name="phone" required
                value={formData.phone} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all font-bold text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* BLOKU 2: KONTROLLI I LLOGARISË (SUPERADMIN) */}
        <div className="bg-[#0F172A] rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden text-white border border-slate-800">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none -mr-4 -mt-4 text-indigo-500">
            <ShieldAlert size={150} />
          </div>
          
          <h2 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-6 relative z-10">
            <ShieldAlert size={16}/> Kontrolli i Aksesit (Billing & Status)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Statusi i Llogarisë</label>
              <select 
                name="status" 
                value={formData.status} onChange={handleChange}
                className={`w-full bg-slate-900 border px-4 py-3 rounded-xl outline-none font-bold appearance-none
                  ${formData.status === 'active' ? 'border-emerald-500 text-emerald-400 focus:ring-emerald-500/20' : 
                    formData.status === 'suspended' ? 'border-red-500 text-red-400 focus:ring-red-500/20' : 
                    'border-amber-500 text-amber-400 focus:ring-amber-500/20'}`}
              >
                <option value="active">🟢 AKTIVE (Paguar)</option>
                <option value="trial">🟠 NË PROVË (Trial)</option>
                <option value="suspended">🔴 BLLOKUAR (E Papaguar)</option>
              </select>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CalendarClock size={14}/> Mbarimi i Provës
              </label>
              <input 
                type="date" name="trialEndsAt"
                value={formData.trialEndsAt} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 px-4 py-3 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white font-bold"
              />
              <p className="text-[10px] text-slate-500 mt-2">Deri kur mund ta përdorë falas?</p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CreditCard size={14}/> Paketa Aktuale
              </label>
              <select 
                name="packageId" 
                value={formData.packageId} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 px-4 py-3 rounded-xl outline-none focus:border-indigo-500 text-white font-bold appearance-none"
              >
                <option value="">-- Pa Paketë --</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.price} €)</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link 
            href={`/${locale}/superadmin/bizneset`}
            className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Anulo
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-200"
          >
            {isSubmitting ? "Po ruhet..." : <><Save size={18} /> Ruaj Ndryshimet</>}
          </button>
        </div>

      </form>
    </div>
  );
}