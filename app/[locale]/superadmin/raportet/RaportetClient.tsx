"use client";

import { 
  BarChart3, TrendingUp, Clock, CheckCircle2, 
  XCircle, FileText, Download, Wallet, ArrowUpRight
} from "lucide-react";
import { format } from "date-fns";
import { sq } from "date-fns/locale";

export default function RaportetClient({ locale, data }: { locale: string, data: any }) {
  const { payments, stats } = data;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-100">
              <BarChart3 size={28} />
            </div>
            Raportet Financiare
          </h1>
          <p className="text-gray-500 font-medium mt-1 ml-1">Pasqyra e të hyrave nga abonimet e bizneseve.</p>
        </div>
        <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
          <Download size={18} /> Eksporto PDF
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Fitimi Total" value={`${stats.totalEarnings}€`} sub="Nga fillimi" icon={<Wallet size={24}/>} color="bg-indigo-600" />
        <StatCard title="Këtë Muaj" value={`${stats.monthlyEarnings}€`} sub="Fitim aktiv" icon={<TrendingUp size={24}/>} color="bg-emerald-500" />
        <StatCard title="Në Pritje" value={`${stats.pendingAmount}€`} sub="Fatura hapur" icon={<Clock size={24}/>} color="bg-amber-500" />
        <StatCard title="Transaksione" value={stats.transactionCount} sub="Volume total" icon={<FileText size={24}/>} color="bg-gray-800" />
      </div>

      {/* LISTA E PAGESAVE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50">
          <h3 className="font-black text-gray-900 text-lg">Historiku i Abonimeve</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Biznesi</th>
                <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Nr. Faturës</th>
                <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Data</th>
                <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Shuma</th>
                <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Statusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-bold text-gray-900">{p.businesses.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{p.businesses.city}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-mono text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                      {p.invoice_number}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-500">
                    {format(new Date(p.created_at), "dd MMM yyyy", { locale: sq })}
                  </td>
                  <td className="px-8 py-5 font-black text-gray-900 text-right text-lg">
                    {p.amount} <span className="text-xs text-gray-400">{p.currency}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <StatusBadge status={p.status} />
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <FileText size={48} />
                      <p className="font-black">Asnjë transaksion i regjistruar.</p>
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

function StatCard({ title, value, sub, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${color} opacity-[0.03] rounded-full group-hover:scale-110 transition-transform`} />
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-xl text-white shadow-lg`}>{icon}</div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-gray-900 leading-none mt-1">{value}</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1">
            {sub} <ArrowUpRight size={10} />
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    rejected: "bg-red-50 text-red-600 border-red-100",
  };
  const labels: any = { completed: "Paguar", pending: "Në Pritje", rejected: "Refuzuar" };
  return (
    <span className={`${styles[status]} px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 w-max`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'completed' ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
      {labels[status]}
    </span>
  );
}