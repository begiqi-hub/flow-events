"use client";

import { format } from "date-fns";
import { sq, enUS } from "date-fns/locale"; // <-- SHTUAR enUS
import { 
  FileText, User, Clock, Activity, Search, ShieldAlert, Trash2 
} from "lucide-react";
import { useState } from "react";
import { clearLogsAction } from "./actions";
import { useTranslations, useLocale } from "next-intl"; // <-- SHTUAR

export default function LogfileClient({ logs }: { logs: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const t = useTranslations("LogfileClient"); // <-- SHTUAR
  const locale = useLocale(); // <-- SHTUAR
  const currentLocaleObj = locale === 'sq' ? sq : enUS;

  const filteredLogs = logs.filter(log => 
    log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearLogs = async () => {
    if(confirm(t("confirmClear"))) {
      setIsDeleting(true);
      await clearLogsAction();
      setIsDeleting(false);
      window.location.reload();
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-indigo-500" size={32} />
            {t("pageTitle")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">{t("pageSubtitle")}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder")} 
              className="pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 w-full shadow-sm transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleClearLogs}
            disabled={isDeleting || logs.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} /> {isDeleting ? t("deletingBtn") : t("clearBtn")}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">{t("colTime")}</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">{t("colUser")}</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">{t("colAction")}</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">{t("colDetails")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={14} />
                      <span className="text-xs font-bold">{format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: currentLocaleObj })}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{log.user_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight
                      ${log.action.includes('Fshi') ? 'bg-red-50 text-red-600' : 
                        log.action.includes('Krijim') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}
                    `}>
                      <Activity size={12} /> {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{log.details || "-"}</p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-30 text-gray-500">
                      <FileText size={48} />
                      <p className="mt-2 font-bold text-lg">{t("noLogsTitle")}</p>
                      <p className="text-sm mt-1">{t("noLogsDesc")}</p>
                    </div>
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