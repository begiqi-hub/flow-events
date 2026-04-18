"use client";

import { useState, useRef, useMemo } from "react";
import { 
  BarChart3, TrendingUp, FileText, Download, Wallet, 
  ArrowUpRight, Calendar as CalendarIcon, Building2
} from "lucide-react";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { useReactToPrint } from "react-to-print";

export default function RaportetClient({ locale, data, systemSettings }: { locale: string, data: any, systemSettings: any }) {
  const { payments: initialPayments, stats: initialStats } = data;
  
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Raporti_i_te_Hyrave_${format(new Date(), "dd_MM_yyyy")}`,
    pageStyle: `
      @page { size: A4 landscape; margin: 10mm; } 
      @media print { 
        body { -webkit-print-color-adjust: exact; font-family: sans-serif; background: white !important; }
        .no-print { display: none !important; }
      }
    `
  });

  const filteredData = useMemo(() => {
    let filteredPayments = [...initialPayments];
    if (startDate) {
      filteredPayments = filteredPayments.filter(p => 
        isAfter(new Date(p.created_at), startOfDay(new Date(startDate))) || 
        format(new Date(p.created_at), 'yyyy-MM-dd') === startDate
      );
    }
    if (endDate) {
      filteredPayments = filteredPayments.filter(p => 
        isBefore(new Date(p.created_at), endOfDay(new Date(endDate))) || 
        format(new Date(p.created_at), 'yyyy-MM-dd') === endDate
      );
    }
    return {
      payments: filteredPayments,
      displayTotal: filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    };
  }, [initialPayments, startDate, endDate]);

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 font-sans">
      
      {/* 1. DASHBOARD UI (Fshihet në printim) */}
      <div className="no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-2xl text-white shadow-lg shrink-0">
                <BarChart3 size={24} className="md:w-7 md:h-7" />
              </div>
              Raportet Financiare
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-medium mt-1 ml-1">Pasqyra e të hyrave REALE (Vetëm të paguara).</p>
          </div>
          <button 
            onClick={() => handlePrint()}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Download size={18} /> Eksporto PDF (Landscape)
          </button>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-10">
          <div className="flex items-center gap-3 px-2 lg:px-4 text-gray-500 font-bold text-sm uppercase tracking-widest shrink-0">
            <CalendarIcon size={18} className="text-indigo-500"/> Filtro periudhën:
          </div>
          <div className="flex flex-col sm:flex-row flex-1 w-full gap-4">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:flex-1 bg-gray-50 border border-gray-100 px-4 py-3.5 rounded-2xl outline-none focus:border-indigo-400 font-medium" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:flex-1 bg-gray-50 border border-gray-100 px-4 py-3.5 rounded-2xl outline-none focus:border-indigo-400 font-medium" />
          </div>
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(""); setEndDate(""); }} className="w-full lg:w-auto text-red-500 hover:bg-red-50 font-bold text-sm px-4 py-3 rounded-xl transition-colors">
              Pastro Filtrat
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          <StatCard title="Fitimi i Filtruar" value={`${Number(filteredData.displayTotal).toFixed(2)}€`} sub="Të hyra aktive" icon={<Wallet size={24}/>} color="bg-indigo-600" />
          <StatCard title="Këtë Muaj" value={`${Number(initialStats.monthlyEarnings).toFixed(2)}€`} sub="Realizuar" icon={<TrendingUp size={24}/>} color="bg-emerald-500" />
          <StatCard title="Transaksione" value={filteredData.payments.length} sub="Volume total" icon={<FileText size={24}/>} color="bg-gray-800" />
        </div>
      </div>

      {/* 2. DOKUMENTI PËR PRINTIM (Responsive Container) */}
      <div ref={printRef} className="bg-white rounded-3xl md:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none w-full">
        
        {/* HEADER-I ZYRTAR I RAPORTIT */}
        <div className="px-6 py-8 md:px-10 md:py-10 border-b-2 border-gray-900 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div>
              <h2 className="font-black text-gray-900 text-2xl md:text-3xl uppercase tracking-tighter mb-4">Raporti i të Hyrave</h2>
              <div className="space-y-0.5">
                <p className="text-sm md:text-base font-black text-gray-800 uppercase">{systemSettings?.platform_name || "HALLEVO"}</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-500 tracking-widest">NUI: {systemSettings?.vat_number || "8181881"}</p>
                {systemSettings?.address && <p className="text-[10px] font-medium text-gray-400">{systemSettings.address}</p>}
              </div>
            </div>
            
            <div className="text-left sm:text-right bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-xl w-full sm:w-auto border border-gray-100 sm:border-none">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Periudha e Raportit:</p>
               <p className="font-bold text-base text-gray-900">
                 {startDate ? format(new Date(startDate), "dd.MM.yyyy") : "Fillimi"} - {endDate ? format(new Date(endDate), "dd.MM.yyyy") : "Sot"}
               </p>
            </div>
          </div>
        </div>
        
        {/* TABELA ME SCROLL HORIZONTAL NË MOBILE */}
        <div className="p-4 md:p-6 bg-white overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="px-4 py-3 text-[10px] font-black text-gray-900 uppercase tracking-widest w-[120px]">Data</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-900 uppercase tracking-widest w-[140px]">Nr. Faturës</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-900 uppercase tracking-widest">Biznesi</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-900 uppercase tracking-widest">Lokacioni</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-900 uppercase tracking-widest text-right w-[150px]">Shuma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-xs font-bold text-gray-700">
                    {format(new Date(p.created_at), "dd.MM.yyyy")}
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded">
                      {p.invoice_number}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-black text-gray-900 uppercase">
                    {p.businesses?.name}
                  </td>
                  <td className="px-4 py-4 text-[10px] font-bold text-gray-500">
                    {p.businesses?.country || "Kosovë"}, {p.businesses?.city || "-"}
                  </td>
                  <td className="px-4 py-4 font-black text-gray-900 text-right text-sm">
                    {Number(p.amount).toFixed(2)} €
                  </td>
                </tr>
              ))}
              {filteredData.payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500 font-bold">Nuk u gjet asnjë faturë në këtë periudhë.</td>
                </tr>
              )}
            </tbody>
            
            <tfoot>
              <tr className="border-t-2 border-gray-900 bg-gray-50">
                <td colSpan={4} className="px-4 py-5 text-right font-black text-gray-900 uppercase tracking-widest text-[10px]">
                  Gjithsej shuma:
                </td>
                <td className="px-4 py-5 text-right font-bold text-base text-indigo-700 border-l border-gray-200">
                  {Number(filteredData.displayTotal).toFixed(2)} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon, color }: any) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-xl text-white shadow-md shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{title}</p>
          <p className="text-xl md:text-2xl font-black text-gray-900 mt-0.5 truncate">{value}</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1 truncate">
            {sub} <ArrowUpRight size={10} />
          </p>
        </div>
      </div>
    </div>
  );
}