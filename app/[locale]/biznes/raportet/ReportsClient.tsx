"use client";

import { useState, useMemo } from "react";
import { 
  BarChart3, TrendingUp, Printer, DollarSign, 
  CalendarCheck, Building2, CreditCard, PieChart, Filter, CalendarDays
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isValid } from "date-fns";

export default function ReportsClient({ business, allBookings }: any) {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(today), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState("all"); 

  // --- FILTRIMI I PASTËR DHE I SHPEJTË ---
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
      
      // Për rezervimet e vjetra (para se të shtonim payment_status), lexojmë statusin e vjetër si fallback
      let actualStatus = b.payment_status;
      if (!actualStatus || actualStatus === 'pending') {
        if (b.status === 'paid' || b.status === 'deposit') actualStatus = b.status;
      }

      const isStatusMatch = statusFilter === "all" || actualStatus === statusFilter;

      return isDateInRange && isStatusMatch;
    });
  }, [allBookings, dateFrom, dateTo, statusFilter]);

  // --- LLOGARITJET ---
  let teHyraTotale = 0;
  let paradhenjeTotale = 0;
  let pagesaGjithsej = 0;
  let mbetjeTotale = 0;

  const monthNames = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
  const monthlyData = Array(12).fill(0).map((_, i) => ({ month: monthNames[i], revenue: 0, count: 0 }));
  const hallsData: Record<string, { name: string, count: number }> = {};
  const seasonData: Record<string, number> = {};

  filteredBookings.forEach((b: any) => {
    const total = Number(b.total_amount) || 0;
    const deposit = Number(b.deposit_amount || 0) || 0; 
    
    teHyraTotale += total;

    // Llogaritja e saktë e pagesës nga fusha zyrtare
    let actualStatus = b.payment_status;
    if (!actualStatus || actualStatus === 'pending') {
      if (b.status === 'paid' || b.status === 'deposit') actualStatus = b.status;
    }

    if (actualStatus === 'paid') {
      pagesaGjithsej += total;
    } else if (actualStatus === 'deposit') {
      paradhenjeTotale += deposit;
      pagesaGjithsej += deposit;
      mbetjeTotale += (total - deposit);
    } else {
      mbetjeTotale += total;
    }

    const date = new Date(b.event_date);
    const mIndex = date.getMonth();
    const mName = monthNames[mIndex];

    monthlyData[mIndex].revenue += total;
    monthlyData[mIndex].count += 1;

    if (!seasonData[mName]) seasonData[mName] = 0;
    seasonData[mName] += 1;

    const hallId = b.hall_id || 'unknown';
    const hallName = b.halls?.name || 'Sallë e Papërcaktuar';
    if (!hallsData[hallId]) hallsData[hallId] = { name: hallName, count: 0 };
    hallsData[hallId].count += 1;
  });

  const maxMonthRevenue = Math.max(...monthlyData.map(m => m.revenue), 1); 
  const topHalls = Object.values(hallsData).sort((a, b) => b.count - a.count).slice(0, 4);
  const topSeasons = Object.entries(seasonData).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const handlePrint = () => window.print();

  const safeFormatDate = (dateStr: string) => {
    if (!dateStr) return '...';
    const d = new Date(dateStr);
    return isValid(d) ? format(d, 'dd.MM.yyyy') : '...';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="print:hidden">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <BarChart3 className="text-gray-400" size={32} />
              Raportet Financiare
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              Analizo të hyrat, paradhëniet dhe mbetjet sipas datave.
            </p>
          </div>
          <button onClick={handlePrint} className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap">
            <Printer size={18} /> Shtyp Raportin
          </button>
        </div>

        {/* FILTRAT */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 mb-8 items-end">
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Filter size={14}/> Prej Datës</label>
            <input type="date" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 text-sm font-medium" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deri Datën</label>
            <input type="date" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 text-sm font-medium" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="w-full md:w-auto flex-1 max-w-xs">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Statusi i Pagesës</label>
            <select className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 text-sm font-bold text-gray-700" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Të Gjitha</option>
              <option value="paid">Të Paguara (Plotësisht)</option>
              <option value="deposit">Paradhënie</option>
              <option value="pending">Mbetje (E Papaguar)</option>
            </select>
          </div>
        </div>

        {/* KARTAT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-900 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
            <div className="absolute -right-6 -top-6 text-white/10"><DollarSign size={140} /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">1. Të Hyra Totale</p>
              <p className="text-4xl font-black text-white truncate">{teHyraTotale.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
              <p className="text-xs font-bold text-emerald-400 mt-3">Shuma e plotë e rezervimeve</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">2. Paradhënie</p>
                <p className="text-3xl font-black text-gray-900 truncate">{paradhenjeTotale.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
              </div>
              <p className="text-xs font-medium text-gray-500 mt-3">Kapari / Avansi i paguar</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">3. Mbetje</p>
                <p className="text-3xl font-black text-gray-900 truncate">{mbetjeTotale.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
              </div>
              <p className="text-xs font-medium text-gray-500 mt-3">Shuma e mbetur pa paguar</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">4. Pagesa Gjithsej</p>
                <p className="text-3xl font-black text-gray-900 truncate">{pagesaGjithsej.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
              </div>
              <p className="text-xs font-medium text-gray-500 mt-3">Shuma totale e arkëtuar</p>
            </div>
          </div>
        </div>

        {/* GRAFIKËT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Ecuria Mujore (Të hyrat)</h2>
            <div className="h-48 flex items-end gap-1 sm:gap-2">
              {monthlyData.map((data, index) => {
                const heightPercent = maxMonthRevenue > 0 ? (data.revenue / maxMonthRevenue) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col justify-end group relative h-full">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                      {data.revenue.toLocaleString('de-DE')} €
                    </div>
                    <div className="w-full bg-emerald-100 group-hover:bg-emerald-500 rounded-t-sm transition-all" style={{ height: `${heightPercent}%`, minHeight: data.revenue > 0 ? '4px' : '0px' }}></div>
                    <div className="text-center text-[9px] font-bold text-gray-400 uppercase mt-2 hidden sm:block">{data.month.slice(0,3)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Top Sallat</h2>
            <div className="space-y-4">
              {topHalls.length > 0 ? topHalls.map((hall, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-xs">#{index + 1}</div>
                    <h4 className="font-bold text-gray-900 text-sm">{hall.name}</h4>
                  </div>
                  <p className="text-xs font-black text-gray-500">{hall.count} evente</p>
                </div>
              )) : (<p className="text-xs text-gray-400">Nuk ka të dhëna.</p>)}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-[#FF5C39]"/> Top Sezonat</h2>
            <div className="space-y-4">
              {topSeasons.length > 0 ? topSeasons.map(([month, count], index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-bold text-gray-700 text-sm">{month}</span>
                  <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">{count} Evente</span>
                </div>
              )) : (<p className="text-xs text-gray-400">Nuk ka të dhëna.</p>)}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================= */}
      {/* 2. TABELA DHE FORMATI I PRINTIMIT */}
      {/* ========================================= */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 15mm; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />

      <div className="print-area bg-white sm:rounded-3xl sm:border sm:border-gray-100 sm:shadow-sm p-0 sm:p-8">
        
        <div className="hidden print:flex justify-between items-start mb-10 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-widest">{business.name}</h1>
            <p className="text-gray-500 font-medium mt-1">Numri i Biznesit: {business.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-gray-500 font-medium">{business.city || "Adresa e panjohur"}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest mb-1">Raporti i Eventeve</h2>
            <p className="text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-lg inline-block">
              Periudha: {safeFormatDate(dateFrom)} — {safeFormatDate(dateTo)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/50 print:bg-gray-100 border-y border-gray-200">
                <th className="py-4 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">Data</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">Klienti</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">ID (Numri Personal)</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">Salla</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right print:text-black">Shuma Totale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.length > 0 ? filteredBookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-bold text-gray-900">{format(new Date(b.event_date), 'dd.MM.yyyy')}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">{b.clients?.name || "-"}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-500">{b.clients?.personal_id || "-"}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-600">{b.halls?.name || "-"}</td>
                  <td className="py-3 px-4 text-sm font-black text-emerald-600 text-right print:text-black">{Number(b.total_amount).toLocaleString('de-DE', {minimumFractionDigits: 2})} €</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500 font-medium print:hidden">
                    Nuk ka të dhëna për këtë periudhë/status.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredBookings.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-900">
                  <td colSpan={4} className="py-4 px-4 text-right font-bold text-gray-900 uppercase tracking-wider text-sm print:text-black">Total Përmbledhje:</td>
                  <td className="py-4 px-4 text-right font-black text-xl text-gray-900 print:text-black bg-gray-50 print:bg-transparent">
                    {teHyraTotale.toLocaleString('de-DE', {minimumFractionDigits: 2})} €
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

      </div>

    </div>
  );
}