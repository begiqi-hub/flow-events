"use client";

import { useState } from "react";
import { format } from "date-fns";
import { sq } from "date-fns/locale";
import { FileText, Search, Plus, Edit, Trash2, LogIn, Activity } from "lucide-react";

export default function AuditLogsClient({ logs }: { logs: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Funksion për të filtruar log-et sipas kërkimit
  const filteredLogs = logs.filter(log => 
    log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Zgjedhim ngjyrën dhe ikonën sipas veprimit
  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE": return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 w-max border border-emerald-100"><Plus size={12}/> Krijo</span>;
      case "UPDATE": return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 w-max border border-amber-100"><Edit size={12}/> Ndrysho</span>;
      case "DELETE": return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 w-max border border-red-100"><Trash2 size={12}/> Fshi</span>;
      case "LOGIN":  return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 w-max border border-blue-100"><LogIn size={12}/> Hyrje</span>;
      default:       return <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 w-max border border-gray-200"><Activity size={12}/> {action}</span>;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 animate-in fade-in duration-500 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 shrink-0">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Audit Logs</h1>
            <p className="text-gray-500 font-medium mt-1">Gjurmo çdo veprim dhe ndryshim në platformë.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Kërko email ose detaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* Tabela e Log-eve */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Koha</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Përdoruesi</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Veprimi</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Moduli</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Detaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-bold text-gray-900">{format(new Date(log.created_at), "dd MMM, yyyy", { locale: sq })}</p>
                    <p className="text-xs font-bold text-gray-400">{format(new Date(log.created_at), "HH:mm:ss")}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded border border-indigo-100 w-max">{log.user_email}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-600 uppercase tracking-wider">
                    {log.entity}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600 min-w-[300px]">
                    {log.details || "-"}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-900 font-bold text-lg mb-1">Nuk u gjet asnjë rekord</p>
                    <p className="text-gray-500 text-sm">Provo të kërkosh me një term tjetër ose sistemi nuk ka ende veprime të regjistruara.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}