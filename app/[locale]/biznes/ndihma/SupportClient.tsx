"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Send, Plus, MessageSquare, Clock, CheckCircle2, ArrowLeft, 
  LifeBuoy, Search, BookOpen, ChevronRight, HelpCircle, 
  Settings, Users, Wallet, Calendar, FileText, Paperclip, X, Image as ImageIcon
} from "lucide-react";
import { createTicketAction, sendMessageAction } from "./actions";
import { format } from "date-fns";

// 1. DATA PËR HELP CENTER (Artikujt Ndihmës)
const HELP_ARTICLES = [
  {
    id: "rezervimet",
    category: "Rezervimet",
    icon: <Calendar size={20} />,
    color: "bg-blue-50 text-blue-600",
    questions: [
      { q: "Si të shtoj një rezervim të ri?", a: "Shko te Dashboard ose te faqja Rezervimet dhe kliko butonin '+ Shto Rezervim'. Plotëso të dhënat e klientit dhe sallën." },
      { q: "Si të ndryshoj statusin e një rezervimi?", a: "Te lista e rezervimeve, kliko butonin 'Modifiko' (ikona lapsit) dhe zgjidh statusin e ri: I konfirmuar, I anuluar, etj." }
    ]
  },
  {
    id: "financat",
    category: "Financat & Pagesat",
    icon: <Wallet size={20} />,
    color: "bg-emerald-50 text-emerald-600",
    questions: [
      { q: "Si të regjistroj një pagesë (kapar)?", a: "Hap detajet e rezervimit dhe te seksioni i financave kliko 'Paguaj Mbetjen'. Zgjidh shumën dhe metodën (Cash, Bankë, POS)." },
      { q: "Ku mund të shoh raportin e fitimeve?", a: "Klikoni te menuja 'Raportet' për të parë statistikat mujore dhe vjetore të shitjeve dhe fitimit të pastër." }
    ]
  },
  {
    id: "recepsioni",
    category: "Recepsioni & Salla",
    icon: <Users size={20} />,
    color: "bg-purple-50 text-purple-600",
    questions: [
      { q: "Çfarë është Kalendari i Recepsionit?", a: "Është një pamje full-screen e optimizuar për stafin në sallë, që tregon vetëm eventet aktive pa detaje financiare sekrete." },
      { q: "Si të shënoj shënime për stafin?", a: "Gjatë krijimit ose modifikimit të rezervimit, plotëso fushën 'Shënime për Stafin'. Këto do të jenë të dukshme te ekrani i Recepsionit." }
    ]
  },
  {
    id: "dokumentet",
    category: "Kontratat & Faturat",
    icon: <FileText size={20} />,
    color: "bg-orange-50 text-orange-600",
    questions: [
      { q: "Si të gjeneroj një kontratë?", a: "Te rreshti i rezervimit, kliko butonin 'Kontrata'. Sistemi do të gjenerojë automatikisht PDF-në me të dhënat e klientit." },
      { q: "Ku mund ta vendos logon dhe vulën?", a: "Shko te 'Konfigurimet' -> 'Detajet e Biznesit'. Aty mund të ngarkosh logon dhe vulën që do të shfaqen në dokumente." }
    ]
  }
];

export default function SupportClient({ locale, initialTickets }: { locale: string, initialTickets: any[] }) {
  const router = useRouter();
  const [view, setView] = useState<'help' | 'chat'>('help'); 
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // States për bisedat
  const [tickets, setTickets] = useState(initialTickets);
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatInput, setChatInput] = useState("");
  
  // States për Imazhet (Screenshots)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 10000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => setTickets(initialTickets), [initialTickets]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (activeTicketId) scrollToBottom(); }, [activeTicketId, tickets]);

  // Funksioni për ngarkimin e fotos
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        alert("Imazhi është shumë i madh (Maksimumi 5MB)!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const res = await createTicketAction(newSubject, newMessage, selectedImage);
    
    setIsSubmitting(false);
    if (!res.error) {
      setNewSubject(""); 
      setNewMessage(""); 
      setSelectedImage(null);
      setIsCreating(false);
      setActiveTicketId(res.ticketId as string); 
      setView('chat');
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!chatInput.trim() && !selectedImage) || !activeTicketId) return;
    
    const msg = chatInput; 
    const imgToSend = selectedImage;
    
    setChatInput("");
    setSelectedImage(null); 
    
    const res = await sendMessageAction(activeTicketId, msg, imgToSend);
    
    if (!res.error) {
      router.refresh();
    } else {
      alert(res.error);
      setChatInput(msg); 
      setSelectedImage(imgToSend);
    }
  };

  const filteredHelp = HELP_ARTICLES.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  const getTicketNumber = (id: string) => {
    return `#${id.substring(0, 6).toUpperCase()}`;
  };

  // Merr të dhënat e tiketës aktive
  const activeTicket = tickets.find(t => t.id === activeTicketId);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 h-[calc(100vh-100px)] flex flex-col animate-in fade-in">
      
      {/* HEADER NAVIGIMI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <LifeBuoy className="text-blue-600" size={32} />
            Qendra e Ndihmës
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Zgjidhni një problem ose na shkruani drejtpërdrejt.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => setView('help')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'help' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            <BookOpen size={18}/> Udhëzimet
          </button>
          <button 
            onClick={() => setView('chat')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'chat' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            <MessageSquare size={18}/> Bisedat e Mia
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex-1 flex overflow-hidden min-h-[500px]">
        
        {/* --- PAMJA E NDIHMËS (WIKI / FAQ) --- */}
        {view === 'help' && (
          <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto w-full">
              <div className="relative mb-10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input 
                  type="text" 
                  placeholder="Kërkoni për një problem (psh: pagesat, kontrata, salla)..."
                  className="w-full bg-gray-50 border-2 border-gray-100 p-5 pl-14 rounded-3xl outline-none focus:border-blue-400 transition-all text-lg font-medium shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-10">
                {filteredHelp.map(category => (
                  <div key={category.id}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`p-2.5 rounded-xl ${category.color}`}>
                        {category.icon}
                      </div>
                      <h2 className="font-black text-gray-900 text-xl">{category.category}</h2>
                    </div>
                    <div className="grid gap-4">
                      {category.questions.map((item, idx) => (
                        <details key={idx} className="group bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
                          <summary className="list-none p-5 cursor-pointer flex justify-between items-center">
                            <span className="font-bold text-gray-800">{item.q}</span>
                            <ChevronRight size={18} className="text-gray-400 group-open:rotate-90 transition-transform" />
                          </summary>
                          <div className="p-5 pt-0 text-gray-600 text-sm leading-relaxed font-medium">
                            {item.a}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 p-8 bg-blue-600 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-200">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-black mb-1">Nuk e gjetët atë që kërkoni?</h3>
                  <p className="text-blue-100 text-sm font-medium">Na dërgoni një mesazh dhe stafi ynë do t'ju ndihmojë brenda pak minutash.</p>
                </div>
                <button 
                  onClick={() => { setView('chat'); setIsCreating(true); }}
                  className="bg-white text-blue-600 px-8 py-3.5 rounded-2xl font-black hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap"
                >
                  Na Shkruani
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- PAMJA E CHAT-IT (TICKETS) --- */}
        {view === 'chat' && (
          <>
            {/* SIDEBAR Bisedat */}
            <div className={`w-full md:w-[350px] border-r border-gray-100 flex flex-col bg-gray-50/50 ${activeTicketId || isCreating ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-gray-100 bg-white">
                <button onClick={() => { setIsCreating(true); setActiveTicketId(null); setSelectedImage(null); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"><Plus size={18} /> Kërkesë e Re</button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {tickets.map(t => (
                  <button key={t.id} onClick={() => { setActiveTicketId(t.id); setIsCreating(false); setSelectedImage(null); }} className={`w-full text-left p-4 rounded-2xl border transition-all ${activeTicketId === t.id ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-100' : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900 truncate text-sm">
                        <span className="text-blue-400 mr-1">{getTicketNumber(t.id)}</span>
                        {t.subject}
                      </span>
                      {t.status === 'closed' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 animate-pulse"></span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {t.messages[t.messages.length - 1]?.image_url ? "🖼️ Foto e dërguar" : t.messages[t.messages.length - 1]?.message}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat ose Forma */}
            <div className={`flex-1 flex-col bg-white ${!activeTicketId && !isCreating ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
              
              {/* FORMA PËR TICKET TË RI */}
              {isCreating ? (
                <div className="flex-1 max-w-2xl mx-auto w-full p-10 overflow-y-auto custom-scrollbar">
                   <h2 className="text-2xl font-black text-gray-900 mb-6">Hap një Kërkesë / Problem</h2>
                   <form onSubmit={handleCreateTicket} className="space-y-5">
                      <input required placeholder="Subjekti i problemit..." className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none focus:border-blue-400 font-medium" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
                      
                      <div className="relative">
                        <textarea required placeholder="Na shpjegoni detajet..." className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none focus:border-blue-400 font-medium h-40 resize-none pb-12" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}></textarea>
                        
                        <div className="absolute bottom-4 left-4 flex items-center gap-3">
                          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-blue-600 bg-white p-2 rounded-lg border border-gray-200 shadow-sm transition-colors flex items-center gap-2">
                            <Paperclip size={18} /> <span className="text-xs font-bold">Bashkëngjit Foto (Opsionale)</span>
                          </button>
                        </div>
                      </div>

                      {selectedImage && (
                        <div className="relative inline-block border-2 border-dashed border-blue-200 p-2 rounded-xl bg-blue-50">
                          <img src={selectedImage} alt="Preview" className="h-32 w-auto object-contain rounded-lg" />
                          <button type="button" onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      )}

                      <button disabled={isSubmitting} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold w-full shadow-md mt-4">{isSubmitting ? "Po dërgohet..." : "Dërgo Kërkesën"}</button>
                   </form>
                </div>
              ) : activeTicketId && activeTicket ? (
                
                /* CHAT-I I HAPUR */
                <div className="flex-1 flex flex-col h-full bg-[#F4F6F8]">
                   <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm z-10">
                      <button onClick={() => setActiveTicketId(null)} className="md:hidden p-2 bg-gray-50 rounded-lg"><ArrowLeft size={18}/></button>
                      <h3 className="font-black text-gray-900 flex-1 flex items-center gap-2">
                        <span className="text-blue-400">{getTicketNumber(activeTicket.id)}</span>
                        {activeTicket.subject}
                      </h3>
                      {activeTicket.status === 'closed' && (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> E Mbyllur
                        </span>
                      )}
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                      {activeTicket.messages.map((msg: any) => {
                        const imageUrl = msg.image_url || msg.file_url || msg.attachment_url;
                        return (
                        <div key={msg.id} className={`flex flex-col ${msg.sender_type === 'business' ? 'items-end' : 'items-start'}`}>
                           <div className={`max-w-[85%] p-4 text-sm font-medium shadow-sm rounded-2xl ${msg.sender_type === 'business' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                             {imageUrl && (
                               <div className="mb-3">
                                 <img src={imageUrl} alt="Screenshot" className="rounded-xl max-h-[300px] w-auto object-contain shadow-sm cursor-pointer hover:opacity-90 transition-opacity border border-black/10" onClick={() => window.open(imageUrl, '_blank')} />
                               </div>
                             )}
                             {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                           </div>
                           <span className="text-[10px] text-gray-400 mt-1">{format(new Date(msg.created_at), "HH:mm")}</span>
                        </div>
                      )})}
                      <div ref={messagesEndRef} />
                   </div>

                   {/* FORMA E CHAT-IT E RRETHUAR ME KUSHT */}
                   {activeTicket.status === 'open' ? (
                     <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3 relative">
                        
                        {selectedImage && (
                          <div className="absolute bottom-[80px] left-4 bg-white p-2 rounded-2xl shadow-xl border border-gray-200 animate-in slide-in-from-bottom-2 z-20">
                            <img src={selectedImage} alt="Preview" className="h-24 w-auto object-contain rounded-xl" />
                            <button type="button" onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex gap-2 items-end bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-blue-400 focus-within:bg-white transition-colors">
                          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shrink-0">
                            <Paperclip size={20} />
                          </button>
                          
                          <textarea 
                            placeholder="Shkruaj një mesazh..." 
                            className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-sm resize-none custom-scrollbar min-h-[44px] max-h-[120px]" 
                            value={chatInput} 
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e as any);
                              }
                            }}
                          />
                          
                          <button type="submit" disabled={(!chatInput.trim() && !selectedImage) || isSubmitting} className="bg-blue-600 text-white w-11 h-11 flex items-center justify-center rounded-xl shadow-sm shrink-0 disabled:bg-gray-300 transition-colors">
                            <Send size={18} className="ml-1" />
                          </button>
                        </form>
                     </div>
                   ) : (
                     <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0 text-center">
                        <p className="text-sm font-bold text-gray-500 flex items-center justify-center gap-2">
                           <X size={16}/> Kjo kërkesë është mbyllur dhe nuk mund të dërgohen më mesazhe.
                        </p>
                     </div>
                   )}
                </div>
              ) : (
                <div className="text-center text-gray-400 p-8">
                  <LifeBuoy size={64} className="mx-auto mb-4 opacity-10" />
                  <h3 className="text-lg font-bold">Zgjidhni një bisedë ose klikoni 'Kërkesë e Re'</h3>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}