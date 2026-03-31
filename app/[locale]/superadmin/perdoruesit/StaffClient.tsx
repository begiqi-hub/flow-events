"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { sq } from "date-fns/locale";
import { Users, Search, ShieldCheck, Mail, ShieldAlert, Plus, X, Edit, Trash2, KeyRound, ShieldOff, CheckCircle2, User } from "lucide-react";
import { updateUserRole, createNewUser, deleteUser, updateUserDetails } from "./actions";

export default function StaffClient({ locale, users, currentUserEmail }: { locale: string, users: any[], currentUserEmail: string }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Forms
  const [addFormData, setAddFormData] = useState({ full_name: "", email: "", password: "", role: "superadmin" });
  const [editFormData, setEditFormData] = useState({ full_name: "", email: "", password: "", status: "active" });

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    const res = await updateUserRole(userId, newRole, locale);
    setUpdatingId(null);
    if (res?.error) alert(res.error);
    else router.refresh();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createNewUser(addFormData, locale);
    setIsSubmitting(false);
    
    if (res?.error) {
      alert(res.error);
    } else {
      setIsAddModalOpen(false);
      setAddFormData({ full_name: "", email: "", password: "", role: "superadmin" });
      router.refresh();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("A jeni i sigurt që doni ta fshini këtë përdorues?")) return;
    
    const res = await deleteUser(userId, locale);
    if (res?.error) alert(res.error);
    else router.refresh();
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditFormData({ 
      full_name: user.full_name || "", 
      email: user.email || "", 
      password: "", 
      status: user.status || "active" 
    });
    setMessage({ type: "", text: "" });
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const payload: any = { 
      full_name: editFormData.full_name,
      email: editFormData.email,
      status: editFormData.status 
    };
    
    if (editFormData.password.length > 0) {
      if (editFormData.password.length < 6) {
        setMessage({ type: "error", text: "Fjalëkalimi duhet të ketë të paktën 6 karaktere." });
        setIsSubmitting(false);
        return;
      }
      payload.password = editFormData.password;
    }

    const res = await updateUserDetails(editingUser.id, payload, locale);
    setIsSubmitting(false);

    if (res?.success) {
      setMessage({ type: "success", text: "Të dhënat u përditësuan me sukses!" });
      router.refresh();
      setTimeout(() => setEditingUser(null), 1500);
    } else {
      setMessage({ type: "error", text: res?.error || "Ndodhi një gabim." });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 min-h-[calc(100vh-80px)] font-sans relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="text-indigo-600" size={32} /> 
            Përdoruesit dhe Stafi
          </h1>
          <p className="text-gray-500 font-medium mt-1">Menaxho administratorët e platformës.</p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} /> Shto Përdorues
        </button>
      </div>

      {/* FILTRAT */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Kërko me emër ose email..." 
            className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all font-medium text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl outline-none focus:border-indigo-400 font-bold text-gray-700 min-w-[180px] cursor-pointer"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Të gjitha rolet</option>
          <option value="superadmin">🛡️ Superadminë</option>
          <option value="admin">👔 Pronarë Biznesi</option>
        </select>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Përdoruesi</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Roli në Sistem</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Statusi & Data</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors group ${u.status === 'inactive' ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 border
                        ${u.role === 'superadmin' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-amber-100 text-amber-700 border-amber-200'}
                      `}>
                        {u.full_name ? u.full_name.substring(0, 2).toUpperCase() : u.email.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          {u.full_name || "I papërcaktuar"}
                          {u.email === currentUserEmail && (
                            <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">Ti</span>
                          )}
                        </p>
                        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} className="text-gray-400"/> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {u.email === currentUserEmail ? (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Llogaria Jote</span>
                    ) : (
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updatingId === u.id}
                        className="bg-gray-50 hover:bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-400 cursor-pointer disabled:opacity-50 transition-all shadow-sm w-max"
                      >
                        <option value="superadmin">🛡️ Superadmin</option>
                        <option value="admin">👔 Pronar Biznesi</option>
                      </select>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      {u.status === 'active' ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-black border border-emerald-100 flex items-center gap-1">
                          AKTIV
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 px-2 py-1 rounded-md text-[10px] font-black border border-red-100 flex items-center gap-1">
                          JO AKTIV
                        </span>
                      )}
                      <p className="text-[11px] font-bold text-gray-400">
                        {u.created_at ? format(new Date(u.created_at), "dd MMM yyyy", { locale: sq }) : "---"}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Butoni Edit tani është jashtë kushtit, ndaj shfaqet për të gjithë */}
                      <button 
                        onClick={() => openEditModal(u)}
                        className="p-2.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-xl transition-colors border border-gray-100 hover:border-indigo-100 shadow-sm"
                        title="Modifiko të Dhënat & Fjalëkalimin"
                      >
                        <Edit size={16} />
                      </button>
                      
                      {/* Butoni Fshi mbetet brenda kushtit, shfaqet VETËM për të tjerët */}
                      {u.email !== currentUserEmail && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors border border-gray-100 hover:border-red-100 shadow-sm"
                          title="Fshi Përdoruesin"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PËR SHTIMIN E PËRDORUESIT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-lg text-gray-900">Shto Përdorues të Ri</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white border border-gray-200 p-1.5 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Emri i Plotë</label>
                <input 
                  type="text" required
                  value={addFormData.full_name} onChange={e => setAddFormData({...addFormData, full_name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:bg-white font-medium text-sm transition-all"
                  placeholder="psh. Agim Ramadani"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Email</label>
                <input 
                  type="email" required
                  value={addFormData.email} onChange={e => setAddFormData({...addFormData, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:bg-white font-medium text-sm transition-all"
                  placeholder="agimi@shembull.com"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Fjalëkalimi</label>
                <input 
                  type="password" required minLength={6}
                  value={addFormData.password} onChange={e => setAddFormData({...addFormData, password: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:bg-white font-medium text-sm transition-all"
                  placeholder="Minimumi 6 karaktere"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Roli</label>
                <select 
                  value={addFormData.role} onChange={e => setAddFormData({...addFormData, role: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 focus:bg-white font-bold text-sm text-gray-800 cursor-pointer"
                >
                  <option value="superadmin">🛡️ Superadmin i Sistemit</option>
                  <option value="admin">👔 Pronar Biznesi (Admin)</option>
                </select>
              </div>
              <div className="mt-4 flex gap-3">
                <button 
                  type="button" onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                >
                  Anulo
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                >
                  {isSubmitting ? "Po ruhet..." : "Ruaj Përdoruesin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PËR NDRYSHIMIN (EDIT) */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-gray-900">Menaxho Përdoruesin</h3>
                <p className="text-xs font-medium text-gray-500 mt-0.5">Ndrysho të dhënat dhe sigurinë</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {message.text && (
              <div className={`mx-6 mt-5 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle2 size={14} /> : <ShieldOff size={14} />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleEditUser} className="p-6 flex flex-col gap-4">
              
              {/* EMRI & EMAIL */}
              <div className="grid grid-cols-1 gap-4 mb-2">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Emri i Plotë</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" required
                      value={editFormData.full_name}
                      onChange={e => setEditFormData({...editFormData, full_name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 pl-10 pr-4 py-3 rounded-xl outline-none focus:border-indigo-400 font-bold text-gray-900 text-sm" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="email" required
                      value={editFormData.email}
                      onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 pl-10 pr-4 py-3 rounded-xl outline-none focus:border-indigo-400 font-bold text-gray-900 text-sm" 
                    />
                  </div>
                </div>
              </div>

              {/* STATUSI */}
              <div className="pt-4 border-t border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Statusi i Llogarisë</label>
                <select 
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl outline-none focus:border-indigo-400 font-bold text-gray-800 cursor-pointer text-sm"
                >
                  <option value="active">🟢 Aktiv (Mund të logohet)</option>
                  <option value="inactive">🔴 Jo-Aktiv (I bllokuar)</option>
                </select>
              </div>

              {/* FJALËKALIMI */}
              <div className="pt-4 border-t border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Reseto Fjalëkalimin</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    value={editFormData.password}
                    onChange={e => setEditFormData({...editFormData, password: e.target.value})}
                    placeholder="Lëre bosh për ta mbajtur të njëjtin..." 
                    className="w-full bg-gray-50 border border-gray-100 pl-10 pr-4 py-3 rounded-xl outline-none focus:border-red-400 font-bold text-gray-900 text-sm" 
                  />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white p-3.5 rounded-xl font-black transition-all shadow-md flex justify-center items-center gap-2">
                {isSubmitting ? "Po ruhet..." : "Ruaj Ndryshimet"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}