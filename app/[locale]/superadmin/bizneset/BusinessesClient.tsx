"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { sq } from "date-fns/locale";
import { 
  Building2, Search, Plus, Edit, Trash2, 
  CheckCircle2, Clock, MapPin, Mail, Phone, ExternalLink, ShieldOff,
  X, Shield, KeyRound, User, Save, Eye
} from "lucide-react";
import { updateBusinessInfo, resetBusinessPassword, getImpersonationToken } from "./actions";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function BusinessesClient({ locale, businesses }: { locale: string, businesses: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // State për Modalin
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  
  // State për Format
  const [formData, setFormData] = useState<any>({});
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (b.nui && b.nui.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getFlag = (country: string) => {
    if (!country) return "🌍";
    const c = country.toLowerCase();
    if (c.includes("kosov")) return "🇽🇰";
    if (c.includes("shqip") || c.includes("albania")) return "🇦🇱";
    if (c.includes("maqedon") || c.includes("macedonia")) return "🇲🇰";
    if (c.includes("greqi") || c.includes("greece")) return "🇬🇷";
    if (c.includes("mali i zi") || c.includes("montenegro")) return "🇲🇪";
    return "🌍";
  };

  // FUNKSIONI: HYR SI BIZNES
  const handleImpersonate = async (businessId: string) => {
    if (!confirm("A jeni i sigurt që dëshironi të hyni si ky biznes?")) return;
    
    const res = await getImpersonationToken(businessId);
    
    if (res.success && res.targetEmail) {
      await signIn("credentials", {
        email: res.targetEmail,
        password: "KODI_YT_SEKRET_123", // Duhet të jetë i njëjtë me atë te route.ts
        redirect: true,
        callbackUrl: `/${locale}/biznes`,
      });
    } else {
      alert(res.error);
    }
  };

  const openEditModal = (b: any) => {
    setEditingBusiness(b);
    setFormData({
      name: b.name || "", nui: b.nui || "", email: b.email || "",
      phone: b.phone || "", country: b.country || "", city: b.city || "", address: b.address || ""
    });
    setNewPassword("");
    setMessage({ type: "", text: "" });
    setActiveTab("info");
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    
    const res = await updateBusinessInfo(editingBusiness.id, formData, locale);
    if (res.success) {
      setMessage({ type: "success", text: "Të dhënat u ruajtën me sukses!" });
      router.refresh();
      setTimeout(() => setEditingBusiness(null), 1500);
    } else {
      setMessage({ type: "error", text: res.error || "Gabim!" });
    }
    setIsSaving(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Fjalëkalimi duhet të jetë të paktën 6 karaktere." });
      return;
    }

    setIsSaving(true);
    setMessage({ type: "", text: "" });
    
    const res = await resetBusinessPassword(editingBusiness.id, newPassword, locale);
    if (res.success) {
      setMessage({ type: "success", text: "Fjalëkalimi u ndryshua me sukses!" });
      setNewPassword("");
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.error || "Gabim!" });
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 min-h-[calc(100vh-80px)] font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-indigo-600" size={32} /> 
            Bizneset e Regjistruara
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Menaxho të gjitha kompanitë që përdorin platformën (Totali: {businesses.length})
          </p>
        </div>
        <Link 
          href={`/${locale}/superadmin/bizneset/shto`} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Shto Biznes
        </Link>
      </div>

      {/* FILTRAT */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Kërko me emër, email ose NUI..." 
            className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all font-medium text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl outline-none focus:border-indigo-400 font-bold text-gray-700 min-w-[180px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Të Gjitha Statuset</option>
          <option value="active">🟢 Aktive</option>
          <option value="trial">🟠 Në Provë (Trial)</option>
          <option value="suspended">🔴 Të Bllokuara</option>
        </select>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Kompania & Kontakti</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Lokacioni</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Statusi & Data</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Abonimi</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBusinesses.length > 0 ? filteredBusinesses.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                  
                  {/* KOMPANIA */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {b.logo_url ? (
                        <img 
                          src={b.logo_url} 
                          alt={b.name} 
                          className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-lg shrink-0 group-hover:scale-105 transition-transform">
                          {b.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-base flex items-center gap-2">
                          {b.name}
                          {b.website && (
                            <a href={b.website.startsWith('http') ? b.website : `http://${b.website}`} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-indigo-500 transition-colors" title="Hap Website">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-gray-500">
                          <span className="flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md tracking-widest shadow-sm">
                            NUI: {b.nui}
                          </span>
                          <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400"/> {b.email}</span>
                          <span className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400"/> {b.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* LOKACIONI */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getFlag(b.country)}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{b.city || "I pacaktuar"}</p>
                        <p className="text-xs font-medium text-gray-500">{b.country || "Shteti i pacaktuar"}</p>
                      </div>
                    </div>
                  </td>

                  {/* STATUSI */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      {b.status === 'active' ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black border border-emerald-100 flex items-center gap-1">
                          <CheckCircle2 size={12}/> AKTIVE
                        </span>
                      ) : b.status === 'suspended' ? (
                        <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-lg text-[10px] font-black border border-red-100 flex items-center gap-1">
                          <ShieldOff size={12}/> BLLOKUAR
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-black border border-amber-100 flex items-center gap-1">
                          <Clock size={12}/> PROVË
                        </span>
                      )}
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {format(new Date(b.created_at), "dd MMM yyyy", { locale: sq })}
                      </p>
                    </div>
                  </td>

                  {/* ABONIMI */}
                  <td className="px-6 py-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-2 inline-block">
                      <p className="text-xs font-black text-gray-800">{b.package?.name || "E Pacaktuar"}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {b.package?.price || "0.00"} {b.currency}/Muaj
                      </p>
                    </div>
                  </td>

                  {/* VEPRIME */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      
                      {/* BUTONI: HYR SI KY BIZNES */}
                      <button 
                        onClick={() => handleImpersonate(b.id)}
                        className="p-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-100 shadow-sm"
                        title="Hyr si ky biznes"
                      >
                        <Eye size={16} />
                      </button>

                      <button 
                        onClick={() => openEditModal(b)}
                        className="p-2.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-xl transition-colors border border-gray-100 hover:border-indigo-100"
                        title="Modifiko & Siguria"
                      >
                        <Edit size={16} />
                      </button>
                      <button className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors border border-gray-100 hover:border-red-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>

                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500">Nuk u gjet asnjë biznes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL I EDITIMIT */}
      {editingBusiness && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-gray-900">{editingBusiness.name}</h3>
                <p className="text-sm font-medium text-gray-500 mt-0.5">Menaxho detajet ose reseto fjalëkalimin</p>
              </div>
              <button onClick={() => setEditingBusiness(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-4 px-8 pt-6 border-b border-gray-100">
              <button 
                onClick={() => {setActiveTab("info"); setMessage({type:"", text:""});}}
                className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <Building2 size={16} /> Të dhënat e Biznesit
              </button>
              <button 
                onClick={() => {setActiveTab("security"); setMessage({type:"", text:""});}}
                className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'security' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <Shield size={16} /> Siguria (Fjalëkalimi)
              </button>
            </div>

            {message.text && (
              <div className={`mx-8 mt-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <ShieldOff size={16} />}
                {message.text}
              </div>
            )}

            <div className="p-8">
              {activeTab === "info" ? (
                <form onSubmit={handleSaveInfo} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Emri i Biznesit</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-2xl outline-none focus:border-indigo-400 font-bold mt-1" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NUI / NIPT</label>
                      <input type="text" required value={formData.nui} onChange={e => setFormData({...formData, nui: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-2xl outline-none focus:border-indigo-400 font-bold mt-1" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-2xl outline-none focus:border-indigo-400 font-bold mt-1" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefoni</label>
                      <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-2xl outline-none focus:border-indigo-400 font-bold mt-1" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Shteti</label>
                      <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} placeholder="Psh. Kosovë" className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-2xl outline-none focus:border-indigo-400 font-bold mt-1" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Qyteti</label>
                      <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Psh. Prishtinë" className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-2xl outline-none focus:border-indigo-400 font-bold mt-1" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-black transition-all flex justify-center items-center gap-2">
                    {isSaving ? "Po ruhet..." : <><Save size={18}/> Ruaj Ndryshimet</>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                    <ShieldOff className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Kujdes: Po ndryshoni fjalëkalimin e klientit!</h4>
                      <p className="text-xs font-medium text-amber-700 mt-1 leading-relaxed">
                        Pronari aktual i këtij biznesi është <b>{editingBusiness.users?.[0]?.full_name || "i panjohur"}</b> ({editingBusiness.users?.[0]?.email || "s'ka email"}). Pasi ta ndryshoni, ai duhet të logohet me fjalëkalimin e ri që do të vendosni më poshtë.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fjalëkalimi i Ri</label>
                    <div className="relative mt-1">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        required 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Shkruaj fjalëkalimin e ri..." 
                        className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-4 rounded-2xl outline-none focus:border-red-400 font-bold text-gray-900" 
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={isSaving} className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl font-black transition-all shadow-lg flex justify-center items-center gap-2">
                    {isSaving ? "Po ndryshohet..." : <><KeyRound size={18}/> Përditëso Fjalëkalimin</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}