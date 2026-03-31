"use client";

import { useState, useEffect, useRef } from "react";
import { Printer, ArrowLeft, Building2, PenTool, X, Trash2, CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { saveClientSignatureAction } from "./actions";

export default function KontrataClient({ booking, locale }: { booking: any, locale: string }) {
  const [isMounted, setIsMounted] = useState(false);
  
  // STATET PËR MODALIN E NËNSHKRIMIT
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isSignatureModalOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const ratio = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      canvas.width = displayWidth * ratio;
      canvas.height = displayHeight * ratio;

      ctx.scale(ratio, ratio);
      
      ctx.strokeStyle = '#0F172A'; 
      ctx.lineWidth = 3;           
      ctx.lineCap = 'round';       
      ctx.lineJoin = 'round';      
      ctx.imageSmoothingEnabled = true; 
    }
  }, [isSignatureModalOpen]);

  const handlePrint = () => window.print();

  // FUNKSIONI I DATAVE (DD.MM.YYYY)
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

  const getCoordinates = (event: any): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault(); 
    const coords = getCoordinates(e);
    if (!coords) return;
    
    setIsDrawing(true);
    lastPos.current = { x: coords.x, y: coords.y };
  };

  const draw = (e: any) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    lastPos.current = { x: coords.x, y: coords.y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSaving(true);
    
    const signatureImage = canvas.toDataURL("image/png");
    
    const res = await saveClientSignatureAction(booking.id, signatureImage);
    if (res.success) {
      setIsSignatureModalOpen(false);
      window.location.reload(); 
    } else {
      alert("Ndodhi një gabim gjatë ruajtjes!");
      setIsSaving(false);
    }
  };

  const business = booking.businesses;
  const client = booking.clients; 
  const symbol = { "EUR": "€", "USD": "$", "GBP": "£", "CHF": "CHF", "ALL": "L" }[business.currency] || "€";

  // FUNKSIONI PËR WHATSAPP (KONTRATA)
  const handleWhatsAppShare = () => {
    if (!client?.phone) {
      alert("Klienti nuk ka numër telefoni të regjistruar!");
      return;
    }

    const cleanPhone = client.phone.replace(/[^0-9]/g, '');

    const eventDate = formatDateNumbers(booking.event_date);
    const totalAmount = Number(booking.total_amount).toFixed(2);
    
    // Gjej totalin e paguar pa i ngatërruar me refunds (pasi kontrata tregon sa u la kapar në fillim zakonisht, por po e llogarisim si totalin e momentit)
    let amountPaid = 0;
    booking.payments?.forEach((p: any) => {
      if (p.type === 'refund') amountPaid -= Number(p.amount);
      else amountPaid += Number(p.amount);
    });
    
    const balance = Math.max(0, Number(booking.total_amount) - amountPaid).toFixed(2);

    const message = `*Kontrata e Rezervimit - ${business.name}*
Përshëndetje *${client.name}*,
Ky mesazh vlen si konfirmim zyrtar i rezervimit tuaj.

Data e eventit: ${eventDate}
Salla: ${booking.halls?.name || "N/A"}
Numri i të ftuarve: ${booking.participants} persona

Totali i Kontratës: ${totalAmount} ${symbol}
Paradhënia (E Paguar): ${amountPaid.toFixed(2)} ${symbol}
Mbetja për t'u paguar: ${balance} ${symbol}

Ju kujtojmë se në rast anulimi aplikohen rregullat e biznesit (${business.cancel_penalty || 0}% penallti).
Ju lutem na kontaktoni nëse keni ndonjë pyetje.

Me respekt,
${business.name}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (!isMounted) return null;

  const eventDate = formatDateNumbers(booking.event_date);
  const contractDate = formatDateNumbers(booking.created_at);
  
  const startTime = new Date(booking.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const endTime = new Date(booking.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  const totalAmount = Number(booking.total_amount).toFixed(2);
  const totalPaid = booking.payments?.reduce((sum: number, p: any) => sum + (p.type === 'refund' ? -Number(p.amount) : Number(p.amount)), 0) || 0;
  const balance = Math.max(0, Number(booking.total_amount) - totalPaid).toFixed(2);
  const menuPrice = booking.menus ? Number(booking.menus.price_per_person).toFixed(2) : "0.00";
  
  const customRules = business.contract_template || `1. Ndalohet rreptësisht sjellja e ushqimeve apo pijeve nga jashtë pa miratimin e menaxhmentit.
2. Qiramarrësi mban përgjegjësi të plotë financiare për çdo dëmtim të pronës ose inventarit.
3. Dekorimet duhet të aprovohen paraprakisht dhe nuk lejohet përdorimi i materialeve që dëmtojnë muret.`;

  return (
    <div className="max-w-[900px] mx-auto p-4 md:p-8 bg-[#F4F6F8] min-h-screen print:bg-white print:p-0 print:max-w-none font-sans text-gray-900 relative">
      
      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <PenTool className="text-indigo-600" /> Nënshkrimi i Klientit
              </h2>
              <button onClick={() => setIsSignatureModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-sm border border-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 flex-1">
              <p className="text-sm font-medium text-gray-500 mb-6 text-center leading-relaxed">
                Ju lutem vizatoni firmën tuaj brenda kutisë së mëposhtme.
              </p>
              
              <div className="border-2 border-dashed border-indigo-200 rounded-3xl overflow-hidden bg-white shadow-inner touch-none">
                <canvas 
                  ref={canvasRef}
                  width={400} 
                  height={200} 
                  className="w-full h-[200px] cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              
              <div className="flex justify-end mt-4">
                <button onClick={clearCanvas} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={15} /> Pastro Kutinë
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsSignatureModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all text-sm">
                Anulo
              </button>
              <button 
                onClick={saveSignature}
                disabled={isSaving}
                className="bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md text-sm"
              >
                {isSaving ? "Po Ruhet..." : "Ruaj Nënshkrimin"} {isSaving ? "" : <CheckCircle2 size={16}/>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @media print {
          @page { size: A4 portrait; margin: 20mm; }
          html, body, main, div { height: auto !important; overflow: visible !important; position: static !important; background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          aside, header, nav, footer, .no-print { display: none !important; }
          #contract-printable-area { width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
        }
      `}} />

      {/* HEADER I BUTONAVE */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm no-print flex-wrap gap-4">
        <Link href={`/${locale}/biznes/rezervimet`} className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Kthehu
        </Link>
        <div className="flex gap-3 flex-wrap">
          {!booking.client_signature_url && (
            <button 
              onClick={() => setIsSignatureModalOpen(true)} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all text-sm border border-gray-200"
            >
              <PenTool size={16} /> Nënshkruaj
            </button>
          )}
          <button 
            onClick={handleWhatsAppShare}
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all text-sm"
          >
            <MessageCircle size={18} /> Dërgo në WhatsApp
          </button>
          <button onClick={handlePrint} className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all text-sm">
            <Printer size={16} /> Printo
          </button>
        </div>
      </div>

      <div id="contract-printable-area" className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 flex flex-col leading-relaxed text-[14px]">
        
        <div className="flex flex-col items-center border-b-2 border-gray-900 pb-6 mb-8 text-center shrink-0 avoid-break">
          {business.logo_url ? (
            <img src={business.logo_url} alt="Logo" className="h-16 w-auto object-contain mb-4" />
          ) : (
            <div className="w-16 h-16 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center mb-4">
              <Building2 size={32} />
            </div>
          )}
          <h1 className="text-[20px] font-black uppercase tracking-widest">{business.name}</h1>
          <p className="text-[12px] font-medium text-gray-600 mt-1">{business.address}, {business.city} | Tel: {business.phone} | NUI: {business.nui || "N/A"}</p>
          <h2 className="text-[24px] font-black mt-8 uppercase underline decoration-2 underline-offset-4">Kontratë Shërbimi</h2>
          <p className="text-[13px] font-bold mt-2 text-gray-500">Data e lidhjes: {contractDate}</p>
        </div>

        <div className="mb-6 text-justify avoid-break">
          <p>Kjo kontratë ("Marrëveshje") lidhet sot, më datë <strong>{contractDate}</strong>, ndërmjet palëve të poshtëshënuara:</p>
          <ul className="list-none mt-4 space-y-2 ml-4">
            <li><strong>Pala e Parë (Qiradhënësi):</strong> <u>{business.name}</u>, me seli në {business.city}, adresa: {business.address}, NUI: {business.nui || "N/A"}, përfaqësuar nga {business.responsible_person || "përfaqësuesi i autorizuar"}.</li>
            <li><strong>Pala e Dytë (Qiramarrësi):</strong> <u>{client.name}</u>{client.client_type === 'business' ? `, NUI: ${client.business_num}` : (client.personal_id ? `, Nr. Personal: ${client.personal_id}` : "")}, tel: {client.phone}.</li>
          </ul>
        </div>

        <div className="space-y-5 text-justify">
          <div className="avoid-break">
            <h3 className="font-bold text-[15px] uppercase mb-1">Neni 1: Objekti</h3>
            <p>Salla <strong>"{booking.halls?.name}"</strong> për <strong>{booking.event_type || "Aheng/Event"}</strong>. Data <strong>{eventDate}</strong>, ora <strong>{startTime}</strong> - <strong>{endTime}</strong>.</p>
          </div>
          <div className="avoid-break">
            <h3 className="font-bold text-[15px] uppercase mb-1">Neni 2: Financat</h3>
            <p>Totali: <strong>{symbol} {totalAmount}</strong>. Kapari: <strong>{symbol} {totalPaid.toFixed(2)}</strong>. Mbetja: <strong>{symbol} {balance}</strong> paguhet në fund të eventit.</p>
          </div>
          <div className="avoid-break">
            <h3 className="font-bold text-[15px] uppercase mb-1">Neni 3: Pjesëmarrësit</h3>
            <p>Garantuar <strong>{booking.participants} persona</strong>. {booking.menus && `Menuja "${booking.menus.name}" (${symbol} ${menuPrice}/person). `}</p>
          </div>
          <div className="avoid-break">
            <h3 className="font-bold text-[15px] uppercase mb-1">Neni 4: Anulimi</h3>
            <p>Anulimi <strong>{business.cancel_days || 0} ditë</strong> para dënohet me <strong>{business.cancel_penalty || 0}%</strong> të totalit.</p>
          </div>
          <div className="avoid-break">
            <h3 className="font-bold text-[15px] uppercase mb-1">Neni 5: Rregullorja</h3>
            <div className="whitespace-pre-line mt-2 text-gray-800 font-medium leading-relaxed">{customRules}</div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t-2 border-gray-900 flex justify-between items-end shrink-0 avoid-break relative">
          
          <div className="text-center w-1/3 relative">
            <p className="text-[12px] font-bold uppercase tracking-wider mb-10">Qiradhënësi</p>
            {business.signature_url && (
              <img src={business.signature_url} alt="Firma" className="absolute bottom-6 left-1/2 -translate-x-1/2 h-14 object-contain z-10 pointer-events-none" />
            )}
            <div className="border-b border-gray-400 mb-2 relative z-0"></div>
            <p className="text-[12px] font-bold text-gray-900">{business.name}</p>
          </div>
          
          <div className="text-center w-1/3 flex items-center justify-center">
            {business.stamp_url ? (
              <img src={business.stamp_url} alt="Vula" className="w-24 h-24 object-contain opacity-90" />
            ) : (
              <div className="w-16 h-16 border-2 border-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-300 rotate-12">VULA</div>
            )}
          </div>

          <div className="text-center w-1/3 relative">
            <p className="text-[12px] font-bold uppercase tracking-wider mb-10">Qiramarrësi</p>
            {booking.client_signature_url && (
              <img 
                src={booking.client_signature_url} 
                alt="Firma Klientit" 
                className="absolute bottom-6 left-1/2 -translate-x-1/2 h-20 object-contain z-10 pointer-events-none mix-blend-multiply" 
              />
            )}
            <div className="border-b border-gray-400 mb-2 relative z-0"></div>
            <p className="text-[12px] font-bold text-gray-900">{client.name}</p>
          </div>

        </div>

      </div>
    </div>
  );
}