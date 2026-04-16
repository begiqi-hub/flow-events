"use client";

import { useState, useRef } from "react";
import { 
  Check, X, Clock, Banknote, Search, AlertCircle, Download, FileText, Building2
} from "lucide-react";
import { format } from "date-fns";
import { sq } from "date-fns/locale";
import { approvePayment, rejectPayment } from "./actions";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";

export default function PaymentsClient({ 
  initialPayments, locale, systemSettings, bankAccount 
}: { 
  initialPayments: any[], locale: string, systemSettings: any, bankAccount: any 
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null); // Për faturën që do printojmë
  const router = useRouter();

  // Print Setup
  const invoiceRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Fatura-${selectedPayment?.businesses?.name || 'Flow-Events'}`,
  });

  const filteredPayments = payments.filter(p => {
    const matchesStatus = filter === "all" || p.status === filter;
    const searchLower = searchQuery.toLowerCase();
    const businessName = p.businesses?.name?.toLowerCase() || "";
    const invoiceNum = p.invoice_number?.toLowerCase() || "";
    return matchesStatus && (businessName.includes(searchLower) || invoiceNum.includes(searchLower));
  });

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`A jeni i sigurt?`)) return;
    setLoadingId(id);
    const res = action === 'approve' ? await approvePayment(id, locale) : await rejectPayment(id, locale);
    if (res.success) {
      router.refresh();
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: action === 'approve' ? 'completed' : 'rejected' } : p));
    } else { alert(res.error); }
    setLoadingId(null);
  };

  // Funksioni që hap modalin/printimin
  const triggerPrint = (payment: any) => {
    setSelectedPayment(payment);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Banknote className="text-emerald-600" size={32} /> Aprovimi i Pagesave
          </h1>
          <p className="text-gray-500 font-medium mt-1">Menaxho transaksionet dhe faturat e bizneseve.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Kërko biznes ose faturë..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex bg-white border border-gray-100 p-1 rounded-2xl shadow-sm w-full sm:w-auto">
            {[{ id: 'all', label: 'Të Gjitha' }, { id: 'pending', label: 'Pezull' }, { id: 'completed', label: 'Aprovuar' }].map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>{f.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 uppercase text-[10px] font-black text-gray-400 tracking-[0.2em]">
                <th className="px-8 py-5">Biznesi & Pakoja</th>
                <th className="px-8 py-5">Referenca</th>
                <th className="px-8 py-5">Shuma</th>
                <th className="px-8 py-5">Statusi</th>
                <th className="px-8 py-5 text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                        {p.businesses?.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{p.businesses?.name}</p>
                        <p className="text-xs text-indigo-600 font-bold">{p.description || "Abonim"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{p.invoice_number}</span>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold italic">{p.created_at && format(new Date(p.created_at), "dd MMM yyyy, HH:mm", { locale: sq })}</p>
                  </td>
                  <td className="px-8 py-6 font-black text-gray-900 text-lg">{p.amount}€</td>
                  <td className="px-8 py-6">
                    {p.status === 'pending' ? (
                      <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-[10px] font-black border border-amber-100 w-fit uppercase"><Clock size={12} /> Pezull</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100 w-fit uppercase"><Check size={12} /> Aprovuar</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {/* BUTONI PËR SHKARKIM/PRINTIM */}
                      <button 
                        onClick={() => triggerPrint(p)}
                        className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all border border-gray-100"
                        title="Shkarko Faturën"
                      >
                        <Download size={18} />
                      </button>

                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => handleAction(p.id, 'reject')} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"><X size={18} /></button>
                          <button onClick={() => handleAction(p.id, 'approve')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2">
                             <Check size={14} /> APROVO
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TEMPLATE E FATURËS PËR PRINTIM (FSHUR NGA UI)             */}
      {/* ========================================================= */}
      <div className="hidden">
        <div ref={invoiceRef} className="p-16 bg-white text-black font-sans w-full">
           <div className="flex justify-between items-start border-b-4 border-gray-900 pb-10 mb-10">
              <div>
                <h1 className="text-5xl font-black tracking-tighter mb-2">INVOICE</h1>
                <p className="text-xl font-mono font-bold text-gray-500">{selectedPayment?.invoice_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Data e Pagesës</p>
                <p className="text-xl font-bold">{selectedPayment?.paid_at ? format(new Date(selectedPayment.paid_at), "dd MMM yyyy", { locale: sq }) : format(new Date(), "dd MMM yyyy")}</p>
              </div>
           </div>

           <div className="flex justify-between gap-20 mb-16">
              <div className="flex-1">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Lëshuar Nga (Platforma):</p>
                <p className="text-2xl font-black mb-2">{systemSettings.platform_name || "Flow Events"}</p>
                <p className="text-gray-600 leading-relaxed font-medium">{systemSettings.address}</p>
                <p className="text-gray-600 font-medium">{systemSettings.contact_email}</p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Për Biznesin (Klienti):</p>
                <p className="text-2xl font-black mb-2">{selectedPayment?.businesses?.name}</p>
                <p className="text-lg font-bold text-gray-700">NUI: {selectedPayment?.businesses?.nui}</p>
                <p className="text-gray-600 font-medium">{selectedPayment?.businesses?.address}</p>
              </div>
           </div>

           <table className="w-full mb-16">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="py-5 text-left text-sm font-black uppercase tracking-widest">Përshkrimi i Shërbimit</th>
                  <th className="py-5 text-right text-sm font-black uppercase tracking-widest">Totali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-8">
                    <p className="text-xl font-black">Abonim në Platformë</p>
                    <p className="text-gray-500 mt-1 font-medium italic">Pakoja: {selectedPayment?.description || "SaaS Service"}</p>
                  </td>
                  <td className="py-8 text-right text-2xl font-black">{selectedPayment?.amount}€</td>
                </tr>
              </tbody>
           </table>

           <div className="flex justify-end mb-20">
              <div className="w-1/3 border-t-4 border-gray-900 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black uppercase tracking-tighter">TOTALI I PAGUAR</span>
                  <span className="text-3xl font-black">{selectedPayment?.amount}€</span>
                </div>
              </div>
           </div>

           <div className="bg-gray-50 p-10 rounded-3xl border border-gray-200">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Detajet e Transaksionit</p>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Mënyra e Pagesës</p>
                  <p className="font-black text-lg">Transfer Bankar</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Statusi i Faturës</p>
                  <p className="font-black text-lg text-emerald-600 uppercase">E PAGUAR PLOTËSISHT</p>
                </div>
              </div>
           </div>

           <div className="mt-20 text-center border-t border-gray-100 pt-10 text-gray-400 text-sm font-bold italic">
             Kjo faturë është gjeneruar automatikisht nga sistemi HALLEVO.
           </div>
        </div>
      </div>

    </div>
  );
}