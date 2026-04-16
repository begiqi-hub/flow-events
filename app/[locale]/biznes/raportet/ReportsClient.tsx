"use client";

import { useState, useMemo } from "react";
import { 
  BarChart3, TrendingUp, Printer, DollarSign, 
  CalendarCheck, Building2, CreditCard, PieChart, Filter, CalendarDays, Download, Wallet, Activity
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isValid } from "date-fns";
import { useTranslations } from "next-intl"; 

export default function ReportsClient({ business, allBookings }: any) {
  const t = useTranslations("ReportsClient"); 
  
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(today), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [isDownloading, setIsDownloading] = useState(false);

  const currencySymbols: Record<string, string> = {
    "EUR": "€", "USD": "$", "GBP": "£", "CHF": "CHF", "ALL": "L", "MKD": "ден"
  };
  const symbol = business?.currency ? (currencySymbols[business.currency] || business.currency) : "€";

  const filteredBookings = useMemo(() => {
    return allBookings.filter((b: any) => {
      const eventDate = new Date(b.event_date);
      eventDate.setHours(0, 0, 0, 0);
      
      let isDateInRange = true;
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (isValid(from) && eventDate < from) isDateInRange = false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(0, 0, 0, 0);
        if (isValid(to) && eventDate > to) isDateInRange = false;
      }

      const isStatusMatch = statusFilter === "all" || b.status === statusFilter;

      return isDateInRange && isStatusMatch;
    });
  }, [allBookings, dateFrom, dateTo, statusFilter]);

  const selectedYear = dateFrom ? new Date(dateFrom).getFullYear() : today.getFullYear();
  
  const yearlyBookings = useMemo(() => {
    return allBookings.filter((b: any) => {
      const eventDate = new Date(b.event_date);
      if (eventDate.getFullYear() !== selectedYear) return false;

      const isStatusMatch = statusFilter === "all" || b.status === statusFilter;
      return isStatusMatch;
    });
  }, [allBookings, selectedYear, statusFilter]);

  let teHyraTotale = 0; 
  let mbetjeTotale = 0;
  let kostotTotale = 0; 

  filteredBookings.forEach((b: any) => {
    const expected = Number(b.expected_revenue) || 0;
    const paid = Number(b.net_paid) || 0;
    
    const kosto = b.status === 'cancelled' ? 0 : (Number(b.calculated_cost) || 0);

    teHyraTotale += expected;
    kostotTotale += kosto;
    
    if (b.status !== 'cancelled') {
        mbetjeTotale += Math.max(0, expected - paid);
    }
  });

  const fitimiPastër = teHyraTotale - kostotTotale;

  const monthNames = [t("jan"), t("feb"), t("mar"), t("apr"), t("may"), t("jun"), t("jul"), t("aug"), t("sep"), t("oct"), t("nov"), t("dec")];
  const monthlyData = Array(12).fill(0).map((_, i) => ({ month: monthNames[i], revenue: 0, profit: 0, count: 0 }));
  const hallsData: Record<string, { name: string, count: number }> = {};
  const seasonData: Record<string, number> = {};

  yearlyBookings.forEach((b: any) => {
    const expected = Number(b.expected_revenue) || 0;
    const cost = b.status === 'cancelled' ? 0 : (Number(b.calculated_cost) || 0);
    
    const date = new Date(b.event_date);
    const mIndex = date.getMonth();
    const mName = monthNames[mIndex];

    monthlyData[mIndex].revenue += expected;
    monthlyData[mIndex].profit += (expected - cost);
    monthlyData[mIndex].count += 1;
    
    if (!seasonData[mName]) seasonData[mName] = 0;
    seasonData[mName] += 1;

    const hallId = b.hall_id || 'unknown';
    const hallName = b.halls?.name || t("printUnknownAddress"); 
    if (!hallsData[hallId]) hallsData[hallId] = { name: hallName, count: 0 };
    hallsData[hallId].count += 1;
  });

  const maxMonthRevenue = Math.max(...monthlyData.map(m => m.revenue), 1); 
  const topHalls = Object.values(hallsData).sort((a, b) => b.count - a.count).slice(0, 4);
  const topSeasons = Object.entries(seasonData).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const safeFormatDate = (dateStr: string) => {
    if (!dateStr) return '...';
    const d = new Date(dateStr);
    return isValid(d) ? format(d, 'dd.MM.yyyy') : '...';
  };

  const handlePrint = () => window.print();
  const handleDownloadPDF = () => window.print();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 print:p-0 print:m-0">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 15mm; }
          html, body, main, div {
            height: auto !important; min-height: auto !important; max-height: none !important;
            overflow: visible !important; position: static !important;
          }
          aside, nav, header, .sidebar, [data-sidebar], .print\\:hidden { display: none !important; }
          .print-area { display: block !important; width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
          table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
          tr { page-break-inside: avoid !important; page-break-after: auto; }
        }
      `}} />

      <div className="print:hidden">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <BarChart3 className="text-gray-400" size={32} />
              {t("title")}
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-medium">{t("subtitle")}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap">
              <Printer size={18} /> {t("printBtn")}
            </button>
            <button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap disabled:bg-indigo-400">
              <Download size={18} /> {isDownloading ? t("generatingPdf") : t("downloadPdf")}
            </button>
          </div>
        </div>

        {/* FILTRAT */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 mb-8 items-end">
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Filter size={14}/> {t("filterFrom")}</label>
            <input type="date" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 text-sm font-medium" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("filterTo")}</label>
            <input type="date" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 text-sm font-medium" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="w-full md:w-auto flex-1 max-w-xs">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("filterStatus")}</label>
            <select className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 text-sm font-bold text-gray-700" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{t("statusAll")}</option>
              <option value="confirmed">{t("statusConfirmedPlural")}</option>
              <option value="cancelled">{t("statusCancelledPlural")}</option>
              <option value="postponed">{t("statusPostponedPlural")}</option>
            </select>
          </div>
        </div>

        {/* KARTAT FINANCIARE ME FITIMIN E PASTËR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
  
          <div className="bg-gray-900 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={14}/> {t("netProfit")}</p>
            <p className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {fitimiPastër.toLocaleString('de-DE', { minimumFractionDigits: 2 })} {symbol}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("grossRevenue")}</p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              {teHyraTotale.toLocaleString('de-DE', { minimumFractionDigits: 2 })} {symbol}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">{t("totalCosts")}</p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              {kostotTotale.toLocaleString('de-DE', { minimumFractionDigits: 2 })} {symbol}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-red-100 bg-red-50/30">
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">{t("totalDebts")}</p>
            <p className="text-2xl sm:text-3xl font-black text-red-600 leading-tight">
              {mbetjeTotale.toLocaleString('de-DE', { minimumFractionDigits: 2 })} {symbol}
            </p>
          </div>

        </div>

        {/* 3 KARTAT E GRAFIKËVE */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span>{t("monthlyProgress")} (Viti {selectedYear})</span>
              <span className="text-[10px] text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase font-bold tracking-widest">{t("netProfit")}</span>
            </h2>
            <div className="h-48 flex items-end gap-1 sm:gap-2">
              {monthlyData.map((data, index) => {
                const heightPercent = maxMonthRevenue > 0 ? (data.revenue / maxMonthRevenue) * 100 : 0;
                const profitPercent = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col justify-end group relative h-full">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap z-10 pointer-events-none flex flex-col items-center">
                      <span className="font-bold text-emerald-400">{t("colProfit")}: {data.profit.toLocaleString('de-DE')} {symbol}</span>
                      <span className="font-medium text-gray-400">Totali: {data.revenue.toLocaleString('de-DE')} {symbol}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-t-sm flex flex-col justify-end relative overflow-hidden" style={{ height: `${heightPercent}%`, minHeight: data.revenue > 0 ? '4px' : '0px' }}>
                       <div className="w-full bg-emerald-400 group-hover:bg-emerald-500 transition-colors" style={{ height: `${profitPercent}%` }}></div>
                    </div>
                    <div className="text-center text-[9px] font-bold text-gray-400 uppercase mt-2 hidden sm:block">{data.month.slice(0,3)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t("topHalls")} ({selectedYear})</h2>
            <div className="space-y-4">
              {topHalls.length > 0 ? topHalls.map((hall, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-xs">#{index + 1}</div>
                    <h4 className="font-bold text-gray-900 text-sm">{hall.name}</h4>
                  </div>
                  <p className="text-xs font-black text-gray-500">{hall.count} {t("events")}</p>
                </div>
              )) : (<p className="text-xs text-gray-400">{t("noData")}</p>)}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-[#FF5C39]"/> {t("topSeasons")}</h2>
            <div className="space-y-4">
              {topSeasons.length > 0 ? topSeasons.map(([month, count], index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-bold text-gray-700 text-sm">{month}</span>
                  <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">{count} {t("eventsCapital")}</span>
                </div>
              )) : (<p className="text-xs text-gray-400">{t("noData")}</p>)}
            </div>
          </div>
        </div>

      </div>

      {/* TABELA E ZGJERUAR PËR WEB DHE PRINTIM */}
      <div className="print-area bg-white sm:rounded-3xl sm:border sm:border-gray-100 sm:shadow-sm p-0 sm:p-8 mt-8 print:mt-0 w-full">
        
        <div className="hidden print:flex justify-between items-start mb-8 border-b border-gray-300 pb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-widest">{business.name}</h1>
            <p className="text-gray-500 font-medium mt-1">{t("printBusinessNum")} <span className="font-bold text-gray-800">{business.nui || "N/A"}</span></p>
            <p className="text-gray-500 font-medium">{business.city || t("printUnknownAddress")}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest mb-1">{t("financialReport")}</h2>
            <p className="text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-lg inline-block">
              {t("printPeriod")} {safeFormatDate(dateFrom)} — {safeFormatDate(dateTo)}
            </p>
          </div>
        </div>

        <div className="print:hidden mb-6 flex justify-between items-center px-2">
           <h2 className="text-xl font-bold text-gray-900">{t("detailedOverview")}</h2>
        </div>

        <div className="overflow-x-auto print:overflow-visible w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/50 print:bg-gray-100 border-y border-gray-300">
                <th className="py-4 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">{t("colDate")}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">{t("colClient")}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">{t("colSale")}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">{t("colCost")}</th>
                <th className="py-4 px-4 text-xs font-bold text-emerald-600 uppercase tracking-wider text-right print:text-black">{t("colProfit")}</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 print:divide-gray-300">
              {filteredBookings.length > 0 ? (
                <>
                  {filteredBookings.map((b: any) => {
                     const total = Number(b.expected_revenue) || 0;
                     const kosto = b.status === 'cancelled' ? 0 : (Number(b.calculated_cost) || 0);
                     const fitim = total - kosto;
                     
                     return (
                      <tr key={b.id} className={`hover:bg-gray-50 ${b.status === 'cancelled' ? 'opacity-60' : ''}`}>
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">
                          {format(new Date(b.event_date), 'dd.MM.yyyy')}
                          {b.status === 'cancelled' && <span className="block text-[10px] text-red-500 uppercase tracking-widest mt-0.5">{t("cancelledBadge")}</span>}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-800">{b.clients?.name || "-"}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-700">
                          {total.toLocaleString('de-DE')} {symbol}
                          {b.refunded_amount > 0 && <span className="block text-[10px] text-red-500 mt-0.5">- {b.refunded_amount} {symbol} {t("refundedBadge")}</span>}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-orange-600">{kosto.toLocaleString('de-DE')} {symbol}</td>
                        <td className="py-3 px-4 text-sm font-black text-emerald-600 text-right print:text-black">
                          {fitim.toLocaleString('de-DE', {minimumFractionDigits: 2})} {symbol}
                        </td>
                      </tr>
                    );
                  })}
                  
                  <tr className="border-t-[3px] border-gray-900 print:border-black bg-gray-50/50 print:bg-transparent">
                    <td colSpan={2} className="py-6 px-4 text-right font-black text-gray-900 uppercase tracking-wider text-base print:text-black">
                      {t("summaryTotal")}
                    </td>
                    <td className="py-6 px-4 font-black text-lg text-gray-900 print:text-black whitespace-nowrap">
                      {teHyraTotale.toLocaleString('de-DE')} {symbol}
                    </td>
                    <td className="py-6 px-4 font-black text-lg text-orange-600 print:text-black whitespace-nowrap">
                      {kostotTotale.toLocaleString('de-DE')} {symbol}
                    </td>
                    <td className="py-6 px-4 text-right font-black text-2xl text-emerald-600 print:text-black whitespace-nowrap">
                      {fitimiPastër.toLocaleString('de-DE', {minimumFractionDigits: 2})} {symbol}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500 font-medium print:hidden">
                    {t("noDataPeriod")}
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