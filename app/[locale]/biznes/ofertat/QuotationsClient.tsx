"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, Clock, MapPin, CheckCircle2, 
  FileText, X, Sparkles, Phone, Banknote, Building, CreditCard as CardIcon, Plus, Users, Utensils, PartyPopper, MessageCircle, Edit
} from "lucide-react";
import { convertQuotationToBooking } from "./actions";
import { useRouter } from "next/navigation";

export default function QuotationsClient({ business, quotations, locale }: any) {
  const router = useRouter();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [deposit, setDeposit] = useState("");
  const [method, setMethod] = useState("cash");
  const [loading, setLoading] = useState(false);

  const symbol = business?.currency || "€";

  // FUNKSIONI I DATAVE PËR WHATSAPP
  const formatDateNumbers = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const fullYear = d.getFullYear();
      return `${day}.${month}.${fullYear}`;
    } catch {
      return 'N/A';
    }
  };

  const handleConvert = async () => {
    setLoading(true);
    const res = await convertQuotationToBooking(selectedQuote.id, Number(deposit) || 0, method);
    if (res.error) {
      alert(res.error);
      setLoading(false);
    } else {
      setSelectedQuote(null);
      setLoading(false);
      router.push(`/${locale}/biznes/rezervimet`);
    }
  };

  // FUNKSIONI PËR WHATSAPP (OFERTA)
  const handleWhatsAppShare = (quote: any) => {
    if (!quote.clients?.phone) {
      alert("Klienti nuk ka numër telefoni të regjistruar!");
      return;
    }

    const cleanPhone = quote.clients.phone.replace(/[^0-9]/g, '');
    const eventDate = formatDateNumbers(quote.event_date);
    const totalAmount = Number(quote.total_amount).toFixed(2);

    const message = `*Ofertë nga ${business.name}*
Përshëndetje *${quote.clients.name}*,
Këtu keni detajet e ofertës që kërkuat për organizimin e eventit tuaj.

Data e propozuar: ${eventDate}
Salla: ${quote.halls?.name || "N/A"}
Të ftuar: ${quote.participants} persona

Vlera Totale: ${totalAmount} ${symbol}

Ju lutem na njoftoni sapo të merrni një vendim në mënyrë që të bllokojmë datën për ju. Ofertat janë të vlefshme për një kohë të kufizuar.

Me respekt,
${business.name}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 bg-white min-h-screen">
      
      {/* MODALI I KONVERTIMIT */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 bg-indigo-50 border-b border-indigo-100">
              <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                <Sparkles className="text-indigo-500" /> Konfirmo Ofertën
              </h2>
              <button onClick={() => setSelectedQuote(null)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-600 font-medium">
                Kjo do ta kthejë ofertën e <strong>{selectedQuote.clients?.name}</strong> në një rezervim zyrtar dhe do të bllokojë datën në kalendar.
              </p>

              <div className="bg-gray-50 text-gray-800 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                <span className="font-bold text-sm">Vlera e Plotë:</span>
                <span className="text-xl font-black">{symbol} {Number(selectedQuote.total_amount).toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">A la klienti paradhënie? ({symbol})</label>
                <input 
                  type="number" 
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  className="w-full border border-gray-200 p-3.5 rounded-xl font-bold text-lg focus:outline-none focus:border-indigo-500"
                  placeholder="0.00"
                  max={selectedQuote.total_amount}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Metoda e Pagesës</label>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setMethod('cash')} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center gap-1 ${method === 'cash' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 bg-white text-gray-500'}`}>
                    <Banknote size={20}/> Cash
                  </button>
                  <button onClick={() => setMethod('bank')} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center gap-1 ${method === 'bank' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 bg-white text-gray-500'}`}>
                    <Building size={20}/> Bankë
                  </button>
                  <button onClick={() => setMethod('pos')} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center gap-1 ${method === 'pos' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 bg-white text-gray-500'}`}>
                    <CardIcon size={20}/> POS
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={handleConvert}
                disabled={loading || Number(deposit) > Number(selectedQuote.total_amount)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
              >
                {loading ? "Po konvertohet..." : "Konfirmo dhe Rezervo Datën"} <CheckCircle2 size={18}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ofertat e Hapura</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Këto evente nuk janë konfirmuar ende dhe nuk e bllokojnë kalendarin.</p>
        </div>
        <Link 
          href={`/${locale}/biznes/rezervimet/shto`} 
          className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-gray-200 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Krijo Ofertë të Re
        </Link>
      </div>

      {/* TABELA */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Klienti</th>
              <th className="pb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Detajet e Eventit</th>
              <th className="pb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Salla & Data</th>
              <th className="pb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vlera Potenciale</th>
              <th className="pb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quotations.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-500 font-medium text-base">Nuk keni asnjë ofertë të hapur momentalisht.</td></tr>
            ) : (
              quotations.map((quote: any) => (
                <tr key={quote.id} className="hover:bg-gray-50/70 transition-colors">
                  
                  <td className="py-5 px-4 align-top w-1/5">
                    <p className="font-bold text-gray-900 text-base mb-1.5">{quote.clients?.name}</p>
                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                      <Phone size={12}/> {quote.clients?.phone || "N/A"}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 uppercase tracking-wider">
                      <Sparkles size={10}/> Ofertë (E Lirë)
                    </div>
                  </td>

                  <td className="py-5 px-4 align-top w-1/4">
                    <div className="space-y-1.5">
                      <p className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                        <PartyPopper size={14} className="text-gray-400"/> {quote.event_type || "N/A"}
                      </p>
                      <p className="text-[13px] font-medium text-gray-600 flex items-center gap-2">
                        <Users size={14} className="text-gray-400"/> {quote.participants} Persona
                      </p>
                      <p className="text-[13px] font-medium text-gray-600 flex items-center gap-2">
                        <Utensils size={14} className="text-gray-400"/> {quote.menus?.name || "Pa menu"}
                      </p>
                    </div>
                  </td>

                  <td className="py-5 px-4 align-top w-1/4">
                    <p className="font-semibold text-gray-800 text-sm flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-gray-400"/> {quote.halls?.name || "E pacaktuar"}
                    </p>
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-700 bg-indigo-50/80 px-2 py-1 rounded-md border border-indigo-100/50">
                        <CalendarIcon size={13}/> 
                        {new Date(quote.event_date).toLocaleDateString('en-GB').replace(/\//g, '.')}
                      </span>
                      <span className="flex items-center gap-1.5 text-[12px] font-bold text-amber-700 bg-amber-50/80 px-2 py-1 rounded-md border border-amber-100/50">
                        <Clock size={13}/> 
                        {new Date(quote.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  </td>

                  <td className="py-5 px-4 align-middle">
                    <p className="text-xl font-black text-gray-900">{symbol} {Number(quote.total_amount).toFixed(2)}</p>
                  </td>

                  <td className="py-5 px-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-3">
                      
                      {/* BUTONI I WHATSAPP PËR OFERTËN */}
                      <button 
                        onClick={() => handleWhatsAppShare(quote)}
                        className="p-2.5 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors bg-white border border-[#25D366] rounded-lg shadow-sm"
                        title="Dërgo me WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </button>

                      {/* BUTONI PËR TË NDRYSHUAR/EDITUAR OFERTËN */}
                      <Link 
                        href={`/${locale}/biznes/rezervimet/ndrysho/${quote.id}`}
                        className="p-2.5 text-blue-600 hover:bg-blue-100 transition-colors bg-blue-50 border border-blue-100 rounded-lg shadow-sm"
                        title="Ndrysho Ofertën"
                      >
                        <Edit size={18} />
                      </Link>

                      {/* BUTONI I PRINTIMIT TË OFERTËS */}
                      <Link 
                        href={`/${locale}/biznes/ofertat/${quote.id}/printo`}
                        className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm"
                        title="Printo Ofertën PDF"
                      >
                        <FileText size={18} />
                      </Link>

                      <button 
                        onClick={() => setSelectedQuote(quote)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all shadow-md shadow-indigo-200"
                      >
                        <CheckCircle2 size={16} /> Kthe në Rezervim
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}