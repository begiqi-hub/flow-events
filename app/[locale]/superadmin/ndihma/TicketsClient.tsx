"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { sq } from "date-fns/locale";
import { 
  LifeBuoy, Search, CheckCircle2, Clock, Send, 
  Building2, Mail, Phone, ShieldCheck, AlertCircle, XCircle, Image as ImageIcon
} from "lucide-react";
import { replyToTicket, closeTicket } from "./actions";

export default function TicketsClient({ locale, tickets }: { locale: string, tickets: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTicketId, setActiveTicketId] = useState<string | null>(tickets.length > 0 ? tickets[0].id : null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-Refresh në prapaskenë çdo 5 sekonda
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  // Auto-scroll në fund të bisedës
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTicketId, tickets]);

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.businesses?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicketId) return;

    setIsSending(true);
    const res = await replyToTicket(activeTicketId, replyText, locale);
    setIsSending(false);
    
    if (res.success) {
      setReplyText("");
    } else {
      alert("Gabim gjatë dërgimit të mesazhit!");
    }
  };

  const handleCloseTicket = async () => {
    if (!activeTicketId) return;
    if (!confirm("A jeni i sigurt që doni ta mbyllni këtë kërkesë?")) return;
    await closeTicket(activeTicketId, locale);
  };

  // Gjeneron një numër të shkurtër tikete nga ID-ja (psh. #A1B2C3)
  const getTicketNumber = (id: string) => {
    return `#${id.substring(0, 6).toUpperCase()}`;
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 h-[calc(100vh-80px)] flex flex-col font-sans">
      
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <LifeBuoy className="text-amber-500" size={28} /> Qendra e Mbështetjes
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">Lexo dhe kthe përgjigje për kërkesat e bizneseve.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-full min-h-[500px]">
        
        {/* KOLONA E MAJTË: LISTA E INBOX-IT */}
        <div className="w-full md:w-[350px] lg:w-[400px] border-r border-gray-100 flex flex-col bg-gray-50/50 shrink-0">
          
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Kërko kërkesa..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 border-transparent pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-50 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredTickets.length > 0 ? filteredTickets.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTicketId(t.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${
                  activeTicketId === t.id 
                    ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50' 
                    : 'bg-transparent border-transparent hover:bg-white hover:border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${activeTicketId === t.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                    <span className="text-indigo-400 mr-1">{getTicketNumber(t.id)}</span> • {t.businesses?.name || "Biznes i panjohur"}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.status === 'open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {t.status === 'open' ? 'E Hapur' : 'E Mbyllur'}
                  </span>
                </div>
                <h4 className={`text-sm font-bold line-clamp-1 mb-1 ${activeTicketId === t.id ? 'text-gray-900' : 'text-gray-700'}`}>
                  {t.subject}
                </h4>
                <p className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {format(new Date(t.updated_at), "dd MMM HH:mm", { locale: sq })}
                </p>
              </button>
            )) : (
              <div className="text-center p-8 text-gray-400">
                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
                <p className="font-bold text-sm">Nuk u gjet asnjë kërkesë.</p>
              </div>
            )}
          </div>
        </div>

        {/* KOLONA E DJATHTË: CHAT-I */}
        {activeTicket ? (
          <div className="flex-1 flex flex-col bg-white relative">
            
            {/* Chat Header */}
            <div className="h-20 border-b border-gray-100 px-6 flex items-center justify-between bg-white shrink-0 shadow-sm relative z-10">
              <div>
                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  <span className="text-indigo-400 mr-2">{getTicketNumber(activeTicket.id)}</span>
                  {activeTicket.subject}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-xs font-bold text-gray-500">
                  <span className="flex items-center gap-1"><Building2 size={12} className="text-indigo-400"/> {activeTicket.businesses?.name}</span>
                  <span className="flex items-center gap-1"><Mail size={12} className="text-gray-400"/> {activeTicket.businesses?.email}</span>
                </div>
              </div>
              
              {activeTicket.status === 'open' ? (
                <button 
                  onClick={handleCloseTicket}
                  className="bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Mbylle Kërkesën
                </button>
              ) : (
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                  <CheckCircle2 size={16} /> E Zgjidhur
                </span>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC] custom-scrollbar space-y-6">
              
              {/* Mesazhi i Parë (Nga Biznesi) */}
              <div className="flex flex-col items-center mb-8">
                <span className="bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Krijuar më: {format(new Date(activeTicket.created_at), "dd MMMM yyyy", { locale: sq })}
                </span>
              </div>

              {activeTicket.messages?.map((msg: any) => {
                const isSuperadmin = msg.sender_type === 'superadmin';
                
                // Kapim fushat më të zakonshme ku mund të jetë ruajtur URL-ja e fotos në databazë
                const imageUrl = msg.file_url || msg.image_url || msg.attachment_url;

                return (
                  <div key={msg.id} className={`flex w-full ${isSuperadmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isSuperadmin ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        {isSuperadmin ? (
                          <>
                            <span className="text-[11px] font-bold text-gray-400">{format(new Date(msg.created_at), "HH:mm")}</span>
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-wide flex items-center gap-1">Stafi <ShieldCheck size={12}/></span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-black text-gray-700 uppercase tracking-wide flex items-center gap-1"><Building2 size={12}/> {activeTicket.businesses?.name}</span>
                            <span className="text-[11px] font-bold text-gray-400">{format(new Date(msg.created_at), "HH:mm")}</span>
                          </>
                        )}
                      </div>
                      
                      <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                        isSuperadmin 
                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                      }`}>
                        
                        {/* NËSE KA FOTO E SHFAQIM KËTU */}
                        {imageUrl && (
                          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-3">
                            <img 
                              src={imageUrl} 
                              alt="Bashkëngjitje" 
                              className="max-w-full sm:max-w-[300px] max-h-[300px] object-cover rounded-xl border border-black/10 hover:opacity-90 transition-opacity"
                            />
                          </a>
                        )}
                        
                        {/* Teksti i mesazhit */}
                        {msg.message && <p>{msg.message}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Pjesa e Dërgimit të Mesazhit */}
            {activeTicket.status === 'open' ? (
              <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <form onSubmit={handleSendReply} className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Shkruaj përgjigjen tënde këtu..." 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={isSending}
                    className="flex-1 bg-gray-50 border border-gray-200 px-5 py-3.5 rounded-2xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all text-sm font-medium disabled:opacity-50"
                  />
                  <button 
                    type="submit" 
                    disabled={!replyText.trim() || isSending}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    {isSending ? "..." : <><Send size={18} /> Dërgo</>}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0 text-center">
                <p className="text-sm font-bold text-gray-500 flex items-center justify-center gap-2">
                  <XCircle size={16}/> Kjo kërkesë është mbyllur dhe nuk mund të dërgohen më mesazhe.
                </p>
              </div>
            )}

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] text-gray-400">
            <LifeBuoy size={64} className="mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-gray-700 mb-1">Zgjidh një Kërkesë</h3>
            <p className="text-sm font-medium">Kliko mbi një nga kërkesat majtas për të lexuar bisedën.</p>
          </div>
        )}

      </div>
    </div>
  );
}