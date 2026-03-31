"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { sq } from "date-fns/locale";
import { 
  Building2, Activity, LifeBuoy, Users, CreditCard, 
  ArrowUpRight, MoreVertical, CheckCircle2, Clock, MapPin, Search, ChevronRight, Zap
} from "lucide-react";

export default function SuperadminDashboardClient({ locale, stats, recentBusinesses, recentTickets }: any) {
  
  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 min-h-screen bg-[#F4F6F8] font-sans">
      
      {/* HEADER I SUPERADMINIT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 animate-in fade-in">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mission Control</h1>
          <p className="text-gray-500 font-medium mt-1">Mirësevjen Superadmin! Ja si po performon platforma sot.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/superadmin/bizneset/shto`} className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2">
            <Building2 size={16} /> Shto Biznes të Ri
          </Link>
        </div>
      </div>

      {/* 4 KARTAT E KRYESORE (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* KARTA 1: TË ARDHURAT (MRR) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-5 text-emerald-600 group-hover:scale-110 transition-transform duration-500 pointer-events-none -mr-6 -mt-6">
            <CreditCard size={120} />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <CreditCard size={24} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <ArrowUpRight size={14} /> +12%
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Të Ardhurat (MRR)</h3>
            <p className="text-3xl font-black text-gray-900">{stats.mrr.toLocaleString('de-DE', { minimumFractionDigits: 2 })} <span className="text-lg text-gray-400">€</span></p>
          </div>
        </div>

        {/* KARTA 2: BIZNESET */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-5 text-blue-600 group-hover:scale-110 transition-transform duration-500 pointer-events-none -mr-6 -mt-6">
            <Building2 size={120} />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 size={24} />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Biznese Totale</h3>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-black text-gray-900">{stats.totalBusinesses}</p>
              <p className="text-sm font-bold text-gray-400 mb-1">({stats.activeBusinesses} Aktive)</p>
            </div>
          </div>
        </div>

        {/* KARTA 3: KËRKESAT / TICKETS */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-5 text-amber-600 group-hover:scale-110 transition-transform duration-500 pointer-events-none -mr-6 -mt-6">
            <LifeBuoy size={120} />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stats.openTickets > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
              <LifeBuoy size={24} />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Kërkesa Ndihme</h3>
            <p className="text-3xl font-black text-gray-900">{stats.openTickets}</p>
          </div>
        </div>

        {/* KARTA 4: PËRDORUESIT */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-5 text-purple-600 group-hover:scale-110 transition-transform duration-500 pointer-events-none -mr-6 -mt-6">
            <Users size={120} />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Përdorues (Staf)</h3>
            <p className="text-3xl font-black text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LISTA E BIZNESEVE TË FUNDIT */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Zap className="text-blue-500" size={20} /> Bizneset e Fundit
            </h2>
            <Link href={`/${locale}/superadmin/bizneset`} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Shiko të gjitha <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Biznesi</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Statusi</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Paketa</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Regjistruar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBusinesses.length > 0 ? recentBusinesses.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-600 font-bold uppercase shrink-0">
                          {b.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{b.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10}/> {b.city || "E pacaktuar"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {b.status === 'active' ? (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-100 flex items-center gap-1 w-max">
                          <CheckCircle2 size={12}/> Aktiv
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[11px] font-bold border border-amber-100 flex items-center gap-1 w-max">
                          <Clock size={12}/> Provë (Trial)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-700">{b.package?.name || "Standard"}</p>
                      <p className="text-xs font-medium text-gray-400">{b.package?.price || "0.00"} € / muaj</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                      {format(new Date(b.created_at), "dd MMM, yyyy", { locale: sq })}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">Nuk ka asnjë biznes të regjistruar ende.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LISTA E TICKETS NË PRITJE */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[500px]">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center shrink-0">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <LifeBuoy className="text-amber-500" size={20} /> Kërkesa Ndihme
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {recentTickets.length > 0 ? recentTickets.map((t: any) => (
              <Link 
                key={t.id}
                href={`/${locale}/superadmin/ndihma?ticket=${t.id}`}
                className="block bg-gray-50 hover:bg-amber-50/50 border border-gray-100 hover:border-amber-200 p-4 rounded-2xl transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-amber-600 transition-colors">
                    {t.businesses?.name}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"></span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-snug">{t.subject}</h4>
                <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {format(new Date(t.updated_at), "HH:mm - dd MMM")}
                </p>
              </Link>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <p className="font-bold text-gray-900 mb-1">Kuti e Pastër!</p>
                <p className="text-sm font-medium">Nuk keni asnjë kërkesë ndihme në pritje. Punë e shkëlqyer!</p>
              </div>
            )}
          </div>
          
          {recentTickets.length > 0 && (
            <div className="p-4 border-t border-gray-50 shrink-0">
              <Link href={`/${locale}/superadmin/ndihma`} className="w-full bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2">
                Shiko të gjitha mesazhet
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}