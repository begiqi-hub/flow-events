"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Users, Phone, Mail, Pencil, TrendingUp, CalendarCheck, MapPin, Search, Building, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl"; // <--- SHTUAR PËR GJUHËT

export default function KlientetClient({ clients, locale }: { clients: any[], locale: string }) {
  const t = useTranslations("KlientetClient"); // <--- THËRRASIM PËRKTHIMET
  
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); 
  
  // LOGJIKA E FAQËZIMIT (PAGINATION)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Këtu mund ta bësh 15 ose 20 nëse do

  // Rikthehemi në faqen e parë sa herë që përdoruesi kërkon diçka të re
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  const filteredClients = useMemo(() => {
    return clients.filter((client: any) => {
      const searchMatch = 
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm) ||
        client.personal_id?.includes(searchTerm) ||
        client.business_num?.includes(searchTerm);
        
      const typeMatch = typeFilter === "all" || client.client_type === typeFilter;
      
      return searchMatch && typeMatch;
    });
  }, [clients, searchTerm, typeFilter]);

  // Llogaritjet për Faqet
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      
      {/* HEADER DHE KËRKIMI */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="text-gray-400" size={32} />
            {t("pageTitle")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {t("pageSubtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder")} 
              className="w-full bg-white border border-gray-200 pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-gray-900 focus:ring-1 text-sm font-medium shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="w-full sm:w-auto bg-white border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-gray-900 text-sm font-bold text-gray-700 shadow-sm cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">{t("filterAll")}</option>
            <option value="individual">{t("filterIndividual")}</option>
            <option value="business">{t("filterBusiness")}</option>
          </select>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">{t("tableHeaderClientInfo")}</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">{t("tableHeaderContactLoc")}</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">{t("tableHeaderHistoryCRM")}</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">{t("tableHeaderActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {currentClients.length > 0 ? currentClients.map((client: any) => {
                const totalBookings = client.bookings.length;
                const totalSpent = client.bookings
                  .filter((b: any) => b.status !== 'cancelled')
                  .reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);

                const isBusiness = client.client_type === 'business';
                const visibleID = isBusiness ? client.business_num : client.personal_id;

                return (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${isBusiness ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                          {isBusiness ? <Building size={20}/> : client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 mb-1">{client.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${isBusiness ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                              {isBusiness ? t("businessLabel") : t("individualLabel")}
                            </span>
                            {visibleID && (
                              <span className="text-xs text-gray-500 font-medium">ID: {visibleID}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 space-y-1.5">
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" /> {client.phone}
                      </p>
                      {client.email && (
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" /> {client.email}
                        </p>
                      )}
                      {client.city && (
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" /> {client.city}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-max border border-emerald-100/50">
                          <TrendingUp size={12} /> {totalSpent.toFixed(2)} {t("spentLabel")}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md w-max">
                          <CalendarCheck size={12} /> {totalBookings} {t("eventsLabel")}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center">
                        <Link 
                          href={`/${locale}/biznes/klientet/ndrysho/${client.id}`}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-900 border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-white rounded-xl transition-all shadow-sm text-sm font-bold"
                        >
                          <Pencil size={16} /> {t("btnDetails")}
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <Search size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t("noClientTitle")}</h3>
                    <p className="text-gray-500 text-sm">{t("noClientDesc")}</p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* KONTROLLET E FAQËZIMIT (PAGINATION) */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-500">
              {t("showing")} <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> {t("upTo")} <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredClients.length)}</span> {t("from")} <span className="font-bold text-gray-900">{filteredClients.length}</span> {t("clientsCount")}
            </span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1 text-sm font-bold"
              >
                <ChevronLeft size={16} /> {t("btnBack")}
              </button>
              
              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-bold text-gray-900">{t("pageText")} {currentPage} / {totalPages}</span>
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1 text-sm font-bold"
              >
                {t("btnForward")} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}