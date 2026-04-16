"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users, CheckCircle2, Clock, ShieldCheck, Mail, X, Save, Trash2, Edit, Crown, Zap } from "lucide-react";
import { addStaffAction, editStaffAction, deleteStaffAction } from "./actions";
import { useTranslations } from "next-intl"; 

export default function PerdoruesitClient({ business, locale }: { business: any, locale: string }) {
  const router = useRouter();
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const t = useTranslations("PerdoruesitClient"); 

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [limitModal, setLimitModal] = useState<{title: string, message: string} | null>(null);

  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", role: "manager" });
  // SHTUAM 'email' TEK STATE I EDITIMIT
  const [editData, setEditData] = useState({ full_name: "", email: "", password: "", role: "", status: "" });
  
  const staff = business?.users || [];

  const roleTranslator: any = {
    superadmin: t("roleSuperadmin"),
    admin: t("roleAdmin"),
    manager: t("roleManager"),
    reception: t("roleReception")
  };

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await addStaffAction(business.id, formData);
    
    if (res?.isLimitError) {
      setIsAddModalOpen(false); 
      setLimitModal({ title: res.limitTitle || "Limit i arritur", message: res.error || "" });
    } 
    else if (res?.error) {
      showToast(res.error, "error");
    } 
    else {
      setIsAddModalOpen(false);
      showToast(t("toastAddSuccess"), "success");
      setFormData({ full_name: "", email: "", password: "", role: "manager" });
      router.refresh();
    }
    
    setLoading(false);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditData({
      full_name: user.full_name,
      email: user.email, // <--- E MBUSHIM ME EMAIL-IN AKTUAL KUR HAPET MODALI
      password: "", 
      role: user.role,
      status: user.status || "active"
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await editStaffAction(editingUser.id, editData);
    if (res.error) {
      showToast(res.error, "error");
    } else {
      setEditingUser(null);
      showToast(t("toastEditSuccess"), "success");
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if(!confirm(t("confirmDelete"))) return;
    setLoading(true);
    const res = await deleteStaffAction(id);
    if (res.error) showToast(res.error, "error");
    else {
      setEditingUser(null);
      showToast(t("toastDeleteSuccess"), "success");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 relative font-sans">
      
      {/* NJOFTIMI (TOAST) */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
            <CheckCircle2 size={18} /> {toast.message}
          </div>
        </div>
      )}

      {/* MODALI I UPSELL-IT */}
      {limitModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute -top-10 -right-10 text-indigo-50 opacity-40 pointer-events-none">
              <Crown size={180} />
            </div>
            <div className="relative z-10">
              <div className="mx-auto w-24 h-24 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-[2rem] mb-6 shadow-inner border border-indigo-100">
                  <Crown size={40} className="drop-shadow-sm" />
              </div>
              <h3 className="text-[1.7rem] leading-tight font-black text-gray-900 mb-3 tracking-tight">
                {limitModal.title}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-8 text-sm">
                {limitModal.message}
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                  onClick={() => router.push(`/${locale}/biznes/abonimi`)} 
                  className="w-full py-4 bg-[#0f172a] text-white rounded-2xl font-black hover:bg-[#1e293b] shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 group"
                 >
                    <Zap size={18} className="text-amber-400 group-hover:scale-110 transition-transform" /> 
                    Shiko Paketat e Reja
                 </button>
                 <button 
                  onClick={() => setLimitModal(null)} 
                  className="w-full py-4 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 text-sm"
                 >
                    Anulo dhe kthehu
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALI PËR TË SHTUAR PUNONJËS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 relative flex flex-col animate-in zoom-in-95">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors">
              <X size={18} />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
                <UserPlus className="text-blue-500" size={24}/> {t("modalAddTitle")}
              </h2>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-5" autoComplete="off">
              <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">{t("fullNameLabel")}</label>
                <input type="text" required placeholder={t("fullNamePlaceholder")} value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">{t("emailLabel")}</label>
                <input type="email" autoComplete="off" required placeholder={t("emailPlaceholder")} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">{t("passwordLabel")}</label>
                <input type="password" autoComplete="new-password" required placeholder={t("passwordPlaceholder")} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">{t("roleLabel")}</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 appearance-none cursor-pointer">
                  <option value="admin">{t("roleAdminFull")}</option>
                  <option value="manager">{t("roleManagerFull")}</option>
                  <option value="reception">{t("roleReceptionFull")}</option>
                </select>
              </div>
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button type="submit" disabled={loading} className="w-full bg-[#0F172A] hover:bg-black text-white py-4 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-70">
                  <Save size={16}/> {loading ? t("savingBtn") : t("saveStaffBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALI PËR TË MENAXHUAR (NDRYSHUAR) PUNONJËSIN */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 relative flex flex-col animate-in zoom-in-95">
            <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors">
              <X size={18} />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
                <Edit className="text-blue-500" size={24}/> {t("modalEditTitle")}
              </h2>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">{t("fullNameLabel")}</label>
                <input type="text" required value={editData.full_name} onChange={(e) => setEditData({...editData, full_name: e.target.value})} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 focus:border-blue-500 focus:ring-1" />
              </div>
              
              {/* SHTUAM FUSHËN E EMAILIT KËTU */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">{t("emailLabel")}</label>
                <input type="email" required value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 focus:border-blue-500 focus:ring-1" />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">{t("newPasswordLabel")}</label>
                <input type="password" autoComplete="new-password" placeholder={t("newPasswordPlaceholder")} value={editData.password} onChange={(e) => setEditData({...editData, password: e.target.value})} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 focus:border-blue-500 focus:ring-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">{t("roleLabel")}</label>
                  <select value={editData.role} onChange={(e) => setEditData({...editData, role: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-[14px] font-medium text-gray-900 focus:border-blue-500 focus:ring-1">
                    <option value="admin">{t("roleAdmin")}</option>
                    <option value="manager">{t("roleManager")}</option>
                    <option value="reception">{t("roleReception")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">{t("statusLabel")}</label>
                  <select value={editData.status} onChange={(e) => setEditData({...editData, status: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-[14px] font-medium text-gray-900 focus:border-blue-500 focus:ring-1">
                    <option value="active">{t("statusActive")}</option>
                    <option value="inactive">{t("statusInactive")}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between gap-3">
                <button type="button" onClick={() => handleDelete(editingUser.id)} className="px-4 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl text-[14px] font-bold transition-colors flex items-center gap-2">
                  <Trash2 size={16}/> {t("deleteBtn")}
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-70">
                  <Save size={16}/> {loading ? t("savingBtn") : t("saveChangesBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER KRYESOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("pageTitle")}</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">{t("pageSubtitle")}</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#0F172A] hover:bg-black text-white px-5 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-md w-full md:w-auto">
          <UserPlus size={18} /> {t("addStaffBtn")}
        </button>
      </div>

      {/* TABELA E STAFIT */}
      <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden mb-10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest w-1/3">{t("tableColName")}</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest w-1/4">{t("tableColRole")}</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest w-1/4">{t("tableColStatus")}</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right w-1/6">{t("tableColActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <Users size={48} className="text-gray-200 mb-4" strokeWidth={1.5} />
                      <p className="text-gray-500 font-medium text-[15px]">{t("noStaffFound")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                staff.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold group-hover:bg-[#0F172A] group-hover:text-white transition-all">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-[15px] mb-0.5">{user.full_name}</p>
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                            <Mail size={12} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-blue-500" />
                        <span className="text-[14px] font-bold text-gray-700">
                          {roleTranslator[user.role] || user.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {user.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={13} /> {t("statusActive")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-wider">
                          <Clock size={13} /> {t("statusInactive")}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                      >
                        {t("manageBtn")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KARTAT E ROLEVE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#F4F9FF] border border-blue-100 rounded-3xl p-7 shadow-sm">
          <h3 className="text-[17px] font-bold text-[#1D4ED8] mb-2.5">{t("cardAdminTitle")}</h3>
          <p className="text-[13px] font-medium text-blue-600/80 leading-relaxed pr-4">{t("cardAdminDesc")}</p>
        </div>
        <div className="bg-[#F0FDF4] border border-emerald-100 rounded-3xl p-7 shadow-sm">
          <h3 className="text-[17px] font-bold text-emerald-700 mb-2.5">{t("cardManagerTitle")}</h3>
          <p className="text-[13px] font-medium text-emerald-600/80 leading-relaxed pr-4">{t("cardManagerDesc")}</p>
        </div>
        <div className="bg-[#FFF8F1] border border-orange-100 rounded-3xl p-7 shadow-sm">
          <h3 className="text-[17px] font-bold text-[#C2410C] mb-2.5">{t("cardReceptionTitle")}</h3>
          <p className="text-[13px] font-medium text-orange-700/80 leading-relaxed pr-4">{t("cardReceptionDesc")}</p>
        </div>
      </div>

    </div>
  );
}