"use client";

import { useState, useRef } from "react";
import { 
  Check, X, Clock, Banknote, Search, AlertCircle, Download, FileText, Building2, CreditCard, CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { sq } from "date-fns/locale";
import { approvePayment, rejectPayment } from "./actions";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";

export default function PaymentsClient({ 
  initialPayments, packages, locale, systemSettings, bankAccount 
}: { 
  initialPayments: any[], packages: any[], locale: string, systemSettings: any, bankAccount: any 
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const router = useRouter();

  const invoiceRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Fatura-${selectedPayment?.businesses?.name || 'HALLEVO'}`,
    pageStyle: `@page { size: A4 portrait; margin: 15mm; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: sans-serif; } }`
  });

  const filteredPayments = payments.filter(p => {
    const matchesStatus = filter === "all" || p.status === filter;
    const searchLower = searchQuery.toLowerCase();
    const businessName = p.businesses?.name?.toLowerCase() || "";
    const invoiceNum = p.invoice_number?.toLowerCase() || "";
    return matchesStatus && (businessName.includes(searchLower) || invoiceNum.includes(searchLower));
  });

  const handleApprove = async (id: string) => {
    if (!confirm("A jeni i sigurt që doni të APROVONI këtë pagesë? Abonimi i biznesit do të aktivizohet automatikisht.")) return;
    setLoadingId(id + 'approve');
    const res = await approvePayment(id, locale);
    if (res.success) {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'completed' } : p));
      router.refresh();
    } else { alert(res.error); }
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Kujdes! A jeni i sigurt që doni të REFUZONI këtë pagesë? Biznesi do të njoftohet.")) return;
    setLoadingId(id + 'reject');
    const res = await rejectPayment(id, locale);
    if (res.success) {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
      router.refresh();
    } else { alert(res.error); }
    setLoadingId(null);
  };

  const triggerPrint = (payment: any) => {
    setSelectedPayment(payment);
    setTimeout(() => { handlePrint(); }, 100);
  };

  // Rregulluar: I sigurt nga gabimet nëse packages është bosh
  const getPackageDetails = (descriptionId: string, amount: number) => {
    const pkg = (packages || []).find((pk: any) => pk.id === descriptionId);
    if (!pkg) return { name: "Abonim / Tjetër", cycle: "" };
    
    const isYearly = Number(amount) > (Number(pkg.monthly_price) * 6);
    return { name: pkg.name, cycle: isYearly ? "Abonim Vjetor" : "Abonim Mujor" };
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 uppercase text-[10px] font-black text-gray-400 tracking-[0.2em]">
                <th className="px-8 py-5">Biznesi & Pakoja</th>
                <th className="px-8 py-5">Mënyra e Pagesës</th>
                <th className="px-8 py-5">Referenca</th>
                <th className="px-8 py-5">Shuma</th>
                <th className="px-8 py-5">Statusi</th>
                <th className="px-8 py-5 text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map((p) => {
                const pkgDetails = getPackageDetails(p.description, p.amount);
                const isCard = p.payment_method === 'paddle' || p.payment_method === 'card';

                return (
                <tr key={p.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-black text-sm shrink-0">
                        {p.businesses?.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">{p.businesses?.name}</p>
                        <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">
                          {pkgDetails.name} <span className="text-gray-400">({pkgDetails.cycle})</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-8 py-6">
                    {isCard ? (
                      <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold w-fit"><CreditCard size={14}/> Kartë Bankare</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold w-fit"><Banknote size={14}/> Transfertë</span>
                    )}
                  </td>

                  <td className="px-8 py-6">
                    <span className="font-mono text-xs font-black text-gray-800 bg-gray-100/50 border border-gray-200 px-2.5 py-1 rounded-lg">{p.invoice_number}</span>
                    <p className="text-[10px] text-gray-500 mt-1.5 font-bold uppercase tracking-widest">{p.created_at && format(new Date(p.created_at), "dd MMM yyyy, HH:mm", { locale: sq })}</p>
                  </td>
                  
                  <td className="px-8 py-6 font-black text-gray-900 text-xl">{Number(p.amount).toFixed(2)}€</td>
                  
                  <td className="px-8 py-6">
                    {p.status === 'pending' ? (
                      <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl text-[10px] font-black border border-amber-100 w-fit uppercase tracking-widest"><Clock size={14} /> Pezull</span>
                    ) : p.status === 'rejected' ? (
                      <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-xl text-[10px] font-black border border-red-100 w-fit uppercase tracking-widest"><X size={14} /> Refuzuar</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-[10px] font-black border border-emerald-100 w-fit uppercase tracking-widest"><CheckCircle2 size={14} /> Aprovuar</span>
                    )}
                  </td>

                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => triggerPrint(p)}
                        className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-200 shadow-sm"
                        title="Shkarko Faturën"
                      >
                        <Download size={18} />
                      </button>

                      {p.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleReject(p.id)} 
                            disabled={loadingId !== null}
                            className="p-2.5 text-red-500 hover:text-white hover:bg-red-500 border border-gray-200 rounded-xl transition-all shadow-sm disabled:opacity-50"
                            title="Refuzo Pagesën"
                          >
                            {loadingId === p.id + 'reject' ? "..." : <X size={18} strokeWidth={3} />}
                          </button>
                          
                          <button 
                            onClick={() => handleApprove(p.id)} 
                            disabled={loadingId !== null}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                          >
                            {loadingId === p.id + 'approve' ? "..." : <><Check size={16} strokeWidth={3} /> APROVO</>}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
              
              {filteredPayments.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-gray-500 font-bold">Nuk u gjet asnjë transaksion.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TEMPLATE E FATURËS PËR PRINTIM (E PERMIRËSUAR)            */}
      {/* ========================================================= */}
      <div className="hidden">
        <div ref={invoiceRef} className="p-8 bg-white text-black font-sans w-full max-w-[210mm] mx-auto">
           {/* Koka e Faturës */}
           <div className="flex justify-between items-start border-b-4 border-gray-900 pb-6 mb-8 mt-4">
              <div>
                <h1 className="text-4xl font-black tracking-tighter mb-1 uppercase">Faturë</h1>
                <p className="text-lg font-mono font-bold text-gray-500">REF: {selectedPayment?.invoice_number}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data e Përpunimit</p>
                <p className="text-lg font-bold text-gray-900">{selectedPayment?.paid_at ? format(new Date(selectedPayment.paid_at), "dd.MM.yyyy", { locale: sq }) : format(new Date(), "dd.MM.yyyy")}</p>
              </div>
           </div>

           {/* Lëshuesi / Paguesi */}
           <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Furnitori (Lëshuesi):</p>
                <p className="text-xl font-black mb-1">{systemSettings.platform_name || "HALLEVO"}</p>
                {systemSettings.address && <p className="text-sm text-gray-600 font-medium">{systemSettings.address}</p>}
                <p className="text-sm text-gray-600 font-medium font-mono mt-1">{systemSettings.contact_email || "support@hallevo.com"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Klienti (Paguesi):</p>
                <p className="text-xl font-black mb-1">{selectedPayment?.businesses?.name}</p>
                <p className="text-sm font-bold text-gray-700 font-mono mb-1">NUI: {selectedPayment?.businesses?.nui || "-"}</p>
                {selectedPayment?.businesses?.address && <p className="text-sm text-gray-600 font-medium">{selectedPayment?.businesses?.address}</p>}
              </div>
           </div>

           {/* Tabela e Shërbimeve */}
           <table className="w-full mb-8 border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="py-3 text-left text-[11px] font-black uppercase tracking-widest">Përshkrimi i Shërbimit</th>
                  <th className="py-3 text-right text-[11px] font-black uppercase tracking-widest">Shuma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 border-b-2 border-gray-200">
                <tr>
                  <td className="py-6">
                    <p className="text-lg font-black uppercase text-gray-900">
                      {selectedPayment ? getPackageDetails(selectedPayment.description, selectedPayment.amount).name : "Abonim"} 
                      {" "} - {selectedPayment ? getPackageDetails(selectedPayment.description, selectedPayment.amount).cycle : ""}
                    </p>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Abonim në platformën {systemSettings.platform_name || "HALLEVO"} për menaxhimin e eventeve.</p>
                  </td>
                  <td className="py-6 text-right text-xl font-black font-mono text-gray-900">{Number(selectedPayment?.amount).toFixed(2)} €</td>
                </tr>
              </tbody>
           </table>

           {/* Totali */}
           <div className="flex justify-end mb-12">
              <div className="w-full sm:w-2/3">
                <div className="flex justify-between items-center py-4 bg-gray-100 px-6 rounded-xl border border-gray-200 print:bg-gray-100">
                  <span className="text-base font-black uppercase tracking-widest whitespace-nowrap">TOTALI I PAGUAR</span>
                  <span className="text-2xl font-black text-indigo-700 font-mono whitespace-nowrap ml-4">{Number(selectedPayment?.amount).toFixed(2)} €</span>
                </div>
              </div>
           </div>

           {/* Detajet e Transaksionit */}
           <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 break-inside-avoid print:bg-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Detajet e Transaksionit</p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Mënyra e Pagesës</p>
                  <p className="font-black text-base text-gray-900">
                    {selectedPayment?.payment_method === 'paddle' ? "Kartë Bankare" : "Transfertë Bankare"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Statusi i Faturës</p>
                  {selectedPayment?.status === 'completed' ? (
                     <p className="font-black text-base text-emerald-600 uppercase">E PAGUAR PLOTËSISHT</p>
                  ) : selectedPayment?.status === 'rejected' ? (
                     <p className="font-black text-base text-red-600 uppercase">E REFUZUAR</p>
                  ) : (
                     <p className="font-black text-base text-amber-600 uppercase">NË PRITJE (PEZULL)</p>
                  )}
                </div>
              </div>
           </div>

           <div className="mt-12 text-center border-t border-gray-200 pt-6 text-gray-400 text-xs font-bold italic">
             Kjo faturë është gjeneruar automatikisht nga sistemi {systemSettings.platform_name || "HALLEVO"}.
           </div>
        </div>
      </div>

    </div>
  );
}