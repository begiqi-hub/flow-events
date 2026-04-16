"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarDays, Users, Banknote, Phone, Mail, Briefcase, MapPin,
  ArrowLeft, Save, User, CheckCircle2, AlertTriangle, Sparkles, Building2, XCircle, ArrowRightLeft, Clock4, Info, Utensils, Receipt, RotateCcw, PartyPopper, CheckCheck, FileText, Lock, Undo2, History, ChevronDown, ChevronUp
} from "lucide-react";
import Link from "next/link";
import { getBookingAction, updateBookingAction } from "./actions";
import { format } from "date-fns";
import { useTranslations } from "next-intl"; 

export default function EditBookingPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const id = resolvedParams.id;
  
  const t = useTranslations("EditBookingPage"); 

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [hallsList, setHallsList] = useState<any[]>([]);
  const [menusList, setMenusList] = useState<any[]>([]);
  const [availableExtras, setAvailableExtras] = useState<any[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]); 
  
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [historicallyPaid, setHistoricallyPaid] = useState<number>(0);

  const [creatorName, setCreatorName] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const [isClientSectionOpen, setIsClientSectionOpen] = useState(true); 
  const [showClientDropdown, setShowClientDropdown] = useState(false); 
  
  const [bookingType, setBookingType] = useState<'menu' | 'rent'>('menu');
  const [customHallPrice, setCustomHallPrice] = useState<number>(0);

  const [isManualTotal, setIsManualTotal] = useState(false);

  const [waivePenalty, setWaivePenalty] = useState(false);

  const currencySymbols: Record<string, string> = { "EUR": "€", "USD": "$", "GBP": "£", "CHF": "CHF", "ALL": "L", "MKD": "ден" };
  const symbol = businessInfo?.currency ? (currencySymbols[businessInfo.currency] || businessInfo.currency) : "€";

  const [formData, setFormData] = useState({
    client_name: "", client_phone: "", client_email: "", client_type: "individual", business_num: "",
    personal_no: "", gender: "", city: "", address: "",
    
    event_type: "", hall_id: "", menu_id: "",
    event_date: "", start_time: "", end_time: "", participants: "",
    total_amount: "0", status: "confirmed", cancel_reason: "",
    new_payment_amount: "", payment_method: "cash", payment_type: "payment", 
    staff_notes: "", admin_notes: ""
  });

  const formatTimeForInput = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    } catch { return ""; }
  };

  useEffect(() => {
    async function loadData() {
      const rawData = await getBookingAction(id);
      if (!rawData) {
         setToast({ show: true, message: t("toastNotFound") || "Rezervimi nuk u gjet!", type: "error" });
         setFetching(false);
         return;
      }
      const data = JSON.parse(JSON.stringify(rawData));

      if (data && data.booking) {
        setHallsList(data.allHalls || []);
        setAvailableExtras(data.allExtras || []);
        setMenusList(data.allMenus || []);
        setClientsList(data.allClients || []); 
        setBusinessInfo(data.business);
        
        setCreatorName(data.booking.creator?.full_name || data.business?.name || "Sistemi");
        setCreatedAt(data.booking.created_at);
        setAuditLogs(data.auditLogs || []);

        const preSelected = data.booking.booking_extras?.map((be: any) => be.extras) || [];
        setSelectedExtras(preSelected);

        let totalPaid = 0;
        data.booking.payments?.forEach((p: any) => {
          if (p.type === 'refund') totalPaid -= Number(p.amount); 
          else totalPaid += Number(p.amount); 
        });
        setHistoricallyPaid(totalPaid);

        const dbTotal = Number(data.booking.total_amount) || 0;

        const dbMenuId = (data.booking as any).menu_id;
        const initialBookingType = dbMenuId ? 'menu' : 'rent';
        setBookingType(initialBookingType);

        const dbMenu = data.allMenus?.find((m: any) => m.id === dbMenuId);
        const dbMenuPrice = dbMenu ? Number(dbMenu.price_per_person) : 0;
        const dbPax = Number(data.booking.participants) || 0;
        const dbExtras = preSelected.reduce((sum: number, ext: any) => sum + Number(ext.price), 0);
        
        let initialRent = 0;
        if (initialBookingType === 'rent') {
           initialRent = dbTotal - dbExtras;
           setCustomHallPrice(initialRent > 0 ? initialRent : 0);
        } else {
           setCustomHallPrice(0);
        }

        const mathTotal = initialBookingType === 'menu' ? (dbPax * dbMenuPrice) + dbExtras : initialRent + dbExtras;
        if (Math.abs(mathTotal - dbTotal) > 0.01) {
            setIsManualTotal(true);
        }

        let theDate = "";
        if (data.booking.event_date) {
           const dObj = new Date(data.booking.event_date);
           theDate = `${dObj.getUTCFullYear()}-${String(dObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dObj.getUTCDate()).padStart(2, '0')}`;
        }

        setFormData({
          client_name: data.booking.clients?.name || "",
          client_phone: data.booking.clients?.phone || "",
          client_email: data.booking.clients?.email || "",
          client_type: data.booking.clients?.client_type || "individual",
          business_num: data.booking.clients?.business_num || "",
          personal_no: data.booking.clients?.personal_id || "",
          gender: data.booking.clients?.gender || "",
          city: data.booking.clients?.city || "",
          address: data.booking.clients?.address || "",
          
          event_type: (data.booking as any).event_type || "",
          hall_id: data.booking.hall_id || "",
          menu_id: dbMenuId || "", 
          event_date: theDate,
          start_time: formatTimeForInput(data.booking.start_time),
          end_time: formatTimeForInput(data.booking.end_time),
          participants: data.booking.participants?.toString() || "",
          total_amount: dbTotal.toFixed(2),
          status: data.booking.status || "confirmed",
          cancel_reason: data.booking.cancel_reason || "",
          new_payment_amount: "", payment_method: "cash", payment_type: "payment",
          staff_notes: data.booking.staff_notes || "",
          admin_notes: data.booking.admin_notes || ""
        });
      }
      setFetching(false);
    }
    loadData();
  }, [id, t]);

  const recalculateTotal = (overrides: any) => {
    if (isManualTotal && overrides.forceAuto !== true) {
        const updatedForm = { ...formData };
        if (overrides.participants !== undefined) updatedForm.participants = overrides.participants;
        if (overrides.menu_id !== undefined) updatedForm.menu_id = overrides.menu_id;
        if (overrides.hall_id !== undefined) updatedForm.hall_id = overrides.hall_id;
        setFormData(updatedForm);
        return;
    }

    const pax = overrides.participants !== undefined ? Number(overrides.participants) : Number(formData.participants);
    const menuId = overrides.menu_id !== undefined ? overrides.menu_id : formData.menu_id;
    const hallRent = overrides.hallPrice !== undefined ? Number(overrides.hallPrice) : customHallPrice;
    const extras = overrides.selectedExtras !== undefined ? overrides.selectedExtras : selectedExtras;
    const bType = overrides.bookingType !== undefined ? overrides.bookingType : bookingType;

    const currentMenu = menusList.find((m: any) => m.id === menuId);
    const menuPrice = currentMenu ? Number(currentMenu.price_per_person) : 0;
    const extrasTotal = extras.reduce((sum: number, ext: any) => sum + Number(ext.price), 0);

    let currentMath = 0;
    if (bType === 'menu') {
        currentMath = (pax * menuPrice) + extrasTotal;
    } else {
        currentMath = hallRent + extrasTotal;
    }

    const finalNewTotal = Math.max(0, currentMath);

    const updatedForm = { ...formData };
    if (overrides.participants !== undefined) updatedForm.participants = overrides.participants;
    if (overrides.menu_id !== undefined) updatedForm.menu_id = overrides.menu_id;
    if (overrides.hall_id !== undefined) updatedForm.hall_id = overrides.hall_id;
    
    setFormData({ ...updatedForm, total_amount: finalNewTotal.toFixed(2) });
  };

  const handleParticipantChange = (e: any) => recalculateTotal({ participants: e.target.value });
  const handleMenuChange = (e: any) => recalculateTotal({ menu_id: e.target.value });
  
  const handleHallChange = (e: any) => {
    const newHallId = e.target.value;
    const newHall = hallsList.find(h => h.id === newHallId);
    const newPrice = newHall?.price ? Number(newHall.price) : 0;
    setCustomHallPrice(newPrice);
    recalculateTotal({ hall_id: newHallId, hallPrice: newPrice });
  };
  
  const toggleExtra = (extra: any) => {
    const exists = selectedExtras.find((e: any) => e.id === extra.id);
    let newExtras;
    if (exists) newExtras = selectedExtras.filter((e: any) => e.id !== extra.id);
    else newExtras = [...selectedExtras, extra];
    setSelectedExtras(newExtras);
    recalculateTotal({ selectedExtras: newExtras });
  };

  const handleManualTotalChange = (e: any) => {
    const newTotal = e.target.value;
    setFormData({...formData, total_amount: newTotal});
    setIsManualTotal(true); 
  };

  const resetToAutoCalculation = () => {
    setIsManualTotal(false);
    recalculateTotal({ forceAuto: true });
  };

  const handleSelectClient = (client: any) => {
    setFormData({
      ...formData,
      client_name: client.name || "",
      client_phone: client.phone || "",
      client_email: client.email || "",
      client_type: client.client_type || "individual",
      business_num: client.business_num || "",
      personal_no: client.personal_id || "",
      gender: client.gender || "",
      city: client.city || "",
      address: client.address || "",
    });
    setShowClientDropdown(false);
  };

  const filteredClients = clientsList.filter(c => 
    c.name.toLowerCase().includes(formData.client_name.toLowerCase()) || 
    (c.phone && c.phone.includes(formData.client_name))
  );

  const currentTotal = Number(formData.total_amount) || 0;
  const newPaymentInput = Number(formData.new_payment_amount) || 0;
  const remainingToPay = Math.max(0, currentTotal - historicallyPaid);
  const remainingAfterNewPayment = formData.payment_type === 'payment' 
      ? Math.max(0, remainingToPay - newPaymentInput)
      : Math.max(0, remainingToPay + newPaymentInput);

  const handleStatusClick = (newStatus: string) => {
    if (newStatus === 'completed' && remainingAfterNewPayment > 0) {
      setToast({ show: true, message: `Nuk mund ta mbyllni këtë event sepse klienti ju detyrohet edhe ${symbol} ${remainingAfterNewPayment.toFixed(2)}. Ju lutem shtoni pagesën.`, type: "error" });
      return; 
    }
    setFormData({...formData, status: newStatus});
  };

  const handleSave = async (e: React.FormEvent | React.MouseEvent, isQuotation: boolean = false) => {
    if (e) e.preventDefault();
    if (formData.status === 'cancelled' && !formData.cancel_reason.trim()) {
      setToast({ show: true, message: "Ju lutem shënoni arsyen e anulimit të eventit!", type: "error" });
      return;
    }

    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    const finalStatus = isQuotation ? 'quotation' : formData.status;

    const dataToSubmit = { 
      ...formData, 
      total_amount: formData.total_amount.toString(), 
      new_payment_amount: formData.new_payment_amount.toString(), 
      selectedExtras, 
      historically_paid: historicallyPaid,
      status: finalStatus
    };
    
    try {
      const res = await updateBookingAction(id, dataToSubmit);
      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: t("toastSuccess") || "Rezervimi u ruajt me sukses!", type: "success" });
        setTimeout(() => { 
          if (isQuotation) router.push(`/${locale}/biznes/ofertat/${id}/printo`);
          else router.push(`/${locale}/biznes/rezervimet`);
        }, 1000);
      }
    } catch (error) {
      setToast({ show: true, message: t("toastErrorNet") || "Gabim në lidhje me serverin.", type: "error" });
      setLoading(false);
    }
  };

  const renderCancellationPolicy = () => {
    if (!formData.event_date) return null;
    const eventDate = new Date(formData.event_date); const today = new Date();
    eventDate.setHours(0,0,0,0); today.setHours(0,0,0,0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const penalty = businessInfo?.cancel_penalty || 0;
    const limitDays = businessInfo?.cancel_days || 0;
    const totalAmount = Number(formData.total_amount) || 0;
    const penaltyValue = waivePenalty ? 0 : (totalAmount * penalty) / 100;
    const refundValue = Math.max(0, historicallyPaid - penaltyValue);
    const clientOwes = Math.max(0, penaltyValue - historicallyPaid);

    if (penalty === 0 && !waivePenalty) return null;

    if (diffDays <= limitDays || waivePenalty) {
      return (
        <div className={`p-5 rounded-2xl text-sm border transition-colors ${waivePenalty ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-red-50/50 border-red-100 text-red-800'}`}>
          <div className="flex gap-3 mb-4">
            {waivePenalty ? <CheckCircle2 size={20} className="text-indigo-500 shrink-0" /> : <AlertTriangle size={20} className="text-red-500 shrink-0" />}
            <div>
              <strong className={`block text-base font-semibold ${waivePenalty ? 'text-indigo-700' : 'text-red-600'}`}>
                {waivePenalty ? "Gjoba u fal. Kthim i plotë!" : (t("penaltyTitle") || "Kujdes: Afati i Anulimit ka kaluar!")}
              </strong>
              {!waivePenalty && <p className="text-red-500/90 font-medium mt-1">Anulimi po bëhet vetëm {diffDays} ditë para eventit. Aplikohet gjoba prej <strong>{penalty}%</strong> ({symbol} {penaltyValue.toFixed(2)}).</p>}
              <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input type="checkbox" checked={waivePenalty} onChange={(e) => setWaivePenalty(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"/>
                <span className={`font-bold ${waivePenalty ? 'text-indigo-600' : 'text-gray-600'}`}>Fale Gjobën (Kthe 100% të pagesës)</span>
              </label>
            </div>
          </div>
          <div className={`bg-white p-4 rounded-xl border grid grid-cols-2 gap-4 text-center shadow-sm ${waivePenalty ? 'border-indigo-100' : 'border-red-100'}`}>
             <div>
               <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-medium">{t("clientPaidLabel") || "Klienti ka paguar"}</p>
               <strong className="text-lg text-gray-900 font-semibold">{symbol} {historicallyPaid.toFixed(2)}</strong>
             </div>
             <div>
               <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-medium">{refundValue > 0 ? (t("toReturnLabel") || "Për t'u Kthyer (Refund)") : (t("clientOwesLabel") || "Klienti Detyrohet")}</p>
               <strong className={`text-lg font-semibold ${refundValue > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{symbol} {refundValue > 0 ? refundValue.toFixed(2) : clientOwes.toFixed(2)}</strong>
             </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl text-emerald-800 text-sm flex gap-3">
          <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
          <div>
            <strong className="text-emerald-600 block text-base font-semibold">{t("safeTitle") || "Anulim i Sigurt"}</strong>
            <p className="font-medium text-emerald-600/80">Jeni jashtë afatit të gjobave. <br/> {historicallyPaid > 0 && <span className="text-emerald-600 font-semibold">Duhet t'i ktheni klientit {symbol} {historicallyPaid.toFixed(2)}. Përdorni opsionin Rimbursim më lart.</span>}</p>
          </div>
        </div>
      );
    }
  };

  const lastModifierName = auditLogs.length > 0 ? (auditLogs[0].users?.full_name || businessInfo?.name) : null;
  const lastModifiedAt = auditLogs.length > 0 ? auditLogs[0].created_at : null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 relative min-h-[80vh]">
      {toast.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95">
             <h3 className="text-xl font-semibold text-gray-900 mb-2">{toast.type === "success" ? t("toastSuccessTitle") || "Sukses" : t("toastWarningTitle") || "Kujdes"}</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium">{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className={`w-full text-white font-semibold py-4 px-6 rounded-2xl ${toast.type === "success" ? "bg-emerald-500" : "bg-[#FF5C39]"}`}>{t("closeBtn") || "Mbyll"}</button>
          </div>
        </div>
      )}

      {showLogsModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
               <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800"><History size={20} className="text-indigo-500"/> Historiku i Modifikimeve</h3>
               <button onClick={() => setShowLogsModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1.5 rounded-full shadow-sm"><XCircle size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 bg-slate-50">
               {auditLogs.length === 0 ? (
                 <p className="text-gray-500 text-center py-4">Nuk ka asnjë ndryshim të regjistruar.</p>
               ) : (
                 auditLogs.map((log: any, idx: number) => {
                   let details = "";
                   try { details = JSON.parse(log.after_state).detaje; } catch { details = "Ndryshim pa detaje."; }
                   return (
                     <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative">
                       <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black uppercase">
                             {(log.users?.full_name || "A").substring(0,2)}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-gray-900">{log.users?.full_name || businessInfo?.name}</p>
                             <p className="text-[10px] font-bold text-gray-400">{log.action}</p>
                           </div>
                         </div>
                         <p className="text-[11px] text-gray-400 font-medium">{format(new Date(log.created_at), 'dd.MM HH:mm')}</p>
                       </div>
                       <p className="text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg ml-10 border border-gray-100">{details}</p>
                     </div>
                   );
                 })
               )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <Link href={`/${locale}/biznes/rezervimet`} className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-gray-700 mb-2 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> {t("backBtn") || "Kthehu"}
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">{t("pageTitle") || "Ndrysho Rezervimin"}</h1>
      </div>

      <form onSubmit={(e) => handleSave(e, false)} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* ==================================================== */}
        {/* 1. KLIENTI WIZARD */}
        {/* ==================================================== */}
        <div className="bg-gray-50/30 border-b border-gray-100">
           <button 
             type="button" 
             onClick={() => setIsClientSectionOpen(!isClientSectionOpen)}
             className="w-full p-6 md:p-8 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer group"
           >
             <div className="flex items-center gap-4">
                 <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 group-hover:scale-105 transition-transform shadow-sm"><User size={22} /></div>
                 <div className="text-left">
                     <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-0.5">Të Dhënat e Klientit</h3>
                     <p className="text-xs font-medium text-gray-500">Klienti aktual: <span className="text-indigo-600 font-bold">{formData.client_name || "I pacaktuar"}</span> • Kliko për të {isClientSectionOpen ? 'mbyllur' : 'hapur'}</p>
                 </div>
             </div>
             <div className={`text-gray-400 bg-white border border-gray-200 p-2 rounded-full shadow-sm transition-transform duration-300 ${isClientSectionOpen ? 'rotate-180' : ''}`}>
               <ChevronDown size={20} />
             </div>
           </button>

           {isClientSectionOpen && (
             <div className="p-6 md:p-8 pt-0 animate-in slide-in-from-top-2 fade-in duration-300">
               
               <div className="flex p-1 bg-gray-200/50 rounded-xl w-fit mb-8 border border-gray-100">
                  <button 
                    type="button" 
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${formData.client_type === 'individual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`} 
                    onClick={() => {
                      if (formData.client_type !== 'individual') {
                        setFormData({...formData, client_type: 'individual'});
                        setShowClientDropdown(false);
                      }
                    }}
                  >
                    <User size={16} /> Individ
                  </button>
                  <button 
                    type="button" 
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${formData.client_type === 'business' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`} 
                    onClick={() => {
                      if (formData.client_type !== 'business') {
                        setFormData({...formData, client_type: 'business'});
                        setShowClientDropdown(false);
                      }
                    }}
                  >
                    <Building2 size={16} /> Biznes
                  </button>
               </div>

               {formData.client_type === 'individual' ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><User size={14}/> Emri dhe Mbiemri</label>
                      <div className="relative">
                        <input 
                          type="text" required placeholder="Shkruaj emrin..." 
                          className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium transition-all" 
                          value={formData.client_name} 
                          onChange={(e) => { setFormData({...formData, client_name: e.target.value}); setShowClientDropdown(true); }} 
                          onFocus={() => setShowClientDropdown(true)}
                          onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                        />
                        {showClientDropdown && filteredClients.length > 0 && (
                          <div className="absolute z-50 w-full bg-white border border-gray-200 shadow-xl rounded-xl mt-1 max-h-48 overflow-y-auto">
                            {filteredClients.map(c => (
                               <div key={c.id} className="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-0" onMouseDown={() => handleSelectClient(c)}>
                                  <p className="font-bold text-sm text-gray-800">{c.name} <span className="text-[10px] text-indigo-500 uppercase">({c.client_type})</span></p>
                                  <p className="text-xs text-gray-500">{c.phone || "Pa numër"} {c.city ? `• ${c.city}` : ""}</p>
                               </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Numri Personal (ID)</label>
                      <input type="text" placeholder="p.sh. 1234567890" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium transition-all" value={formData.personal_no} onChange={(e) => setFormData({...formData, personal_no: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Gjinia</label>
                      <select className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium bg-white transition-all" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                        <option value="">Zgjidh Gjininë</option>
                        <option value="M">Mashkull</option>
                        <option value="F">Femër</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><MapPin size={14}/> Qyteti</label>
                      <input type="text" placeholder="p.sh. Prishtinë" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium transition-all" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><Phone size={14}/> Telefoni</label>
                      <input type="text" placeholder="+383 4X XXX XXX" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium transition-all" value={formData.client_phone} onChange={(e) => setFormData({...formData, client_phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><Mail size={14}/> Email</label>
                      <input type="email" placeholder="email@shembull.com" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium transition-all" value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} />
                    </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><Building2 size={14}/> Emri i Biznesit</label>
                      <div className="relative">
                        <input 
                          type="text" required placeholder="Kërko biznesin..." 
                          className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium transition-all" 
                          value={formData.client_name} 
                          onChange={(e) => { setFormData({...formData, client_name: e.target.value}); setShowClientDropdown(true); }}
                          onFocus={() => setShowClientDropdown(true)}
                          onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                        />
                        {showClientDropdown && filteredClients.length > 0 && (
                          <div className="absolute z-50 w-full bg-white border border-gray-200 shadow-xl rounded-xl mt-1 max-h-48 overflow-y-auto">
                            {filteredClients.map(c => (
                               <div key={c.id} className="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-0" onMouseDown={() => handleSelectClient(c)}>
                                  <p className="font-bold text-sm text-gray-800">{c.name} <span className="text-[10px] text-indigo-500 uppercase">({c.client_type})</span></p>
                                  <p className="text-xs text-gray-500">{c.phone || "Pa numër"} {c.city ? `• ${c.city}` : ""}</p>
                               </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><Briefcase size={14}/> NUI (Numri Unik)</label>
                      <input type="text" placeholder="812345678" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium transition-all" value={formData.business_num} onChange={(e) => setFormData({...formData, business_num: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><MapPin size={14}/> Adresa e Biznesit</label>
                      <input type="text" placeholder="Rruga Nënë Tereza, Nr. 15" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium transition-all" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><MapPin size={14}/> Qyteti</label>
                      <input type="text" placeholder="p.sh. Prishtinë" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium transition-all" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><Phone size={14}/> Telefoni</label>
                      <input type="text" placeholder="+383 4X XXX XXX" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium transition-all" value={formData.client_phone} onChange={(e) => setFormData({...formData, client_phone: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><Mail size={14}/> Email i Biznesit</label>
                      <input type="email" placeholder="email@shembull.com" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-800 font-medium transition-all" value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} />
                    </div>
                 </div>
               )}
             </div>
           )}
        </div>

        {/* ==================================================== */}
        {/* 2. DETAJET E EVENTIT DHE MËNYRA E LLOGARITJES */}
        {/* ==================================================== */}
        <div className="p-6 md:p-8 border-b border-gray-100">
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Lloji i Eventit</label>
                <div className="relative">
                  <PartyPopper size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" list="event-types" required placeholder="psh: Dasëm" className="w-full border border-gray-200 p-4 pl-11 rounded-xl outline-none focus:border-indigo-400 font-semibold text-gray-800 shadow-sm" value={formData.event_type} onChange={(e) => setFormData({...formData, event_type: e.target.value})} />
                  <datalist id="event-types"><option value="Dasëm" /><option value="Fejesë" /><option value="Ditëlindje" /><option value="Event Korporativ / Biznes" /><option value="Konferencë / Seminar" /></datalist>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Salla</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select className="w-full border border-gray-200 p-4 pl-11 rounded-xl outline-none focus:border-indigo-400 font-semibold bg-white text-gray-800 shadow-sm" value={formData.hall_id} onChange={handleHallChange}>
                    <option value="">-- Zgjidh Sallën --</option>
                    {hallsList.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Numri i Pjesëmarrësve</label>
                <div className="relative">
                  <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" required placeholder="Psh: 200" className="w-full border border-gray-200 p-4 pl-11 rounded-xl outline-none focus:border-indigo-400 font-semibold text-gray-800 shadow-sm" value={formData.participants} onChange={handleParticipantChange} />
                </div>
              </div>
           </div>

           <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Banknote size={16} className="text-emerald-500"/> Si do të llogaritet ky event?</h4>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                 <label className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${bookingType === 'menu' ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    <input type="radio" checked={bookingType === 'menu'} onChange={() => { setBookingType('menu'); setCustomHallPrice(0); recalculateTotal({ bookingType: 'menu', hallPrice: 0 }); }} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    <div>
                       <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5"><Utensils size={14} className="text-indigo-500"/> Me Menu (Ushqim/Person)</p>
                       <p className="text-[11px] text-gray-500 font-medium mt-0.5">Përfshin ushqimin. Llogaritet: Pjesëmarrës × Çmimi i Menusë</p>
                    </div>
                 </label>

                 <label className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${bookingType === 'rent' ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    <input type="radio" checked={bookingType === 'rent'} onChange={() => { setBookingType('rent'); setFormData({...formData, menu_id: ""}); recalculateTotal({ bookingType: 'rent', menu_id: "" }); }} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                    <div>
                       <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5"><Building2 size={14} className="text-emerald-500"/> Vetëm Qiraja e Sallës</p>
                       <p className="text-[11px] text-gray-500 font-medium mt-0.5">Salla pa ushqim. Vendosni një çmim fiks total për sallën.</p>
                    </div>
                 </label>
              </div>

              {bookingType === 'menu' ? (
                 <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Zgjidh Menunë</label>
                    <select className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-indigo-400 font-semibold bg-white text-gray-800 shadow-sm" value={formData.menu_id} onChange={handleMenuChange}>
                       <option value="">-- Zgjidh Menu --</option>
                       {menusList.map((m: any) => <option key={m.id} value={m.id}>{m.name} - {symbol} {m.price_per_person} / person</option>)}
                    </select>
                 </div>
              ) : (
                 <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Çmimi i Qirasë së Sallës ({symbol})</label>
                    <input type="number" step="0.01" className="w-full border border-emerald-200 bg-white p-4 rounded-xl outline-none focus:border-emerald-500 text-gray-900 font-black shadow-sm text-lg" value={customHallPrice} onChange={(e) => { const val = Number(e.target.value) || 0; setCustomHallPrice(val); recalculateTotal({ hallPrice: val, bookingType: 'rent' }); }} placeholder="0.00" />
                 </div>
              )}
           </div>

        </div>

        {/* ==================================================== */}
        {/* 3. DATA, ORA DHE EKSTRAT */}
        {/* ==================================================== */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Data e Eventit</label>
              <input type="date" required className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-700 font-medium transition-all" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Ora (Fillimi - Mbarimi)</label>
              <div className="flex items-center gap-2">
                <input type="time" required className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-700 font-medium transition-all" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                <span className="text-gray-300">-</span>
                <input type="time" required className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-700 font-medium transition-all" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-b border-gray-100 space-y-4 bg-purple-50/20">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Sparkles size={16} className="text-purple-400"/> Shërbime Ekstra</h3>
          <div className="flex flex-wrap gap-3">
            {availableExtras.map((extra: any) => {
              const isSelected = selectedExtras.some((e: any) => e.id === extra.id);
              return (
                <button key={extra.id} type="button" onClick={() => toggleExtra(extra)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${isSelected ? 'border-purple-300 bg-purple-50 shadow-sm' : 'border-gray-200 bg-white hover:border-purple-200'}`}>
                   <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300'}`}>
                     {isSelected && <CheckCircle2 size={10} strokeWidth={4} />}
                   </div>
                   <span className={`text-sm font-medium ${isSelected ? 'text-purple-800' : 'text-gray-600'}`}>{extra.name} <span className="text-purple-400/80">+{symbol} {Number(extra.price)}</span></span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================================================== */}
        {/* 4. SHËNIMET DHE FINANCAT */}
        {/* ==================================================== */}
        <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
                <FileText size={14} /> Shënime Operative (Për Stafin)
              </label>
              <textarea 
                className="w-full bg-white border border-amber-200 rounded-xl p-3.5 text-sm text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-2 shadow-sm resize-none h-28"
                placeholder="Psh: Klienti dëshiron tortë pa sheqer..."
                value={formData.staff_notes}
                onChange={(e) => setFormData({...formData, staff_notes: e.target.value})}
              ></textarea>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                <Lock size={14} /> Shënime Sekrete (Vetëm për Admin)
              </label>
              <textarea 
                className="w-full bg-white border border-gray-300 rounded-xl p-3.5 text-sm text-gray-700 focus:outline-none focus:border-gray-500 focus:ring-2 shadow-sm resize-none h-28"
                placeholder="Psh: Këtij klienti i kemi bërë 20% ulje nga miqësia..."
                value={formData.admin_notes}
                onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6"><Receipt size={20} className="text-emerald-500"/> Financat & Pagesat</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    Totali i Faturës ({symbol})
                  </label>
                  {isManualTotal ? (
                     <button type="button" onClick={resetToAutoCalculation} className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider hover:bg-red-200 transition-colors flex items-center gap-1"><RotateCcw size={10}/> Manual: Kthe në Auto</button>
                  ) : (
                     <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={10}/> Auto-Kalkulim</span>
                  )}
                </div>
                <input 
                  type="number" 
                  step="0.01" 
                  className={`w-full border p-4 rounded-xl outline-none focus:ring-2 font-semibold text-gray-800 text-lg transition-all ${isManualTotal ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-emerald-300 focus:border-emerald-500 bg-white'}`} 
                  value={formData.total_amount} 
                  onChange={handleManualTotalChange} 
                />
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                 <div className="flex justify-between items-center"><span className="text-sm font-medium text-gray-500">E paguar deri tani</span><span className="text-base font-semibold text-emerald-600">{symbol} {historicallyPaid.toFixed(2)}</span></div>
                 <div className="flex justify-between items-center border-t border-gray-100 pt-2"><span className="text-sm font-medium text-gray-500">Mbetja për t'u paguar</span><span className="text-lg font-semibold text-red-500">{remainingToPay > 0 ? symbol + " " + remainingToPay.toFixed(2) : symbol + " 0.00"}</span></div>
              </div>
            </div>

            <div>
              <div className={`p-6 rounded-2xl border shadow-sm h-full ${formData.payment_type === 'refund' ? 'bg-red-50 border-red-100' : 'bg-white border-emerald-100'}`}>
                
                <div className="flex p-1 bg-gray-100 rounded-lg mb-4 w-full">
                   <button 
                     type="button" 
                     onClick={() => setFormData({...formData, payment_type: 'payment'})}
                     className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${formData.payment_type === 'payment' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500"}`}
                   >
                     <Banknote size={14} /> Shto Pagesë
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setFormData({...formData, payment_type: 'refund'})}
                     className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${formData.payment_type === 'refund' ? "bg-white text-red-600 shadow-sm" : "text-gray-500"}`}
                   >
                     <Undo2 size={14} /> Kthe Paratë (Refund)
                   </button>
                </div>

                <label className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-2 ${formData.payment_type === 'refund' ? 'text-red-600' : 'text-emerald-600'}`}>
                   {formData.payment_type === 'refund' ? 'Shuma për t\'u kthyer' : 'Shto Pagesë Sot (Opsionale)'}
                </label>
                
                <p className="text-xs text-gray-500 mb-4 font-medium">
                  {formData.payment_type === 'refund' 
                    ? `Maksimumi që mund të ktheni: ${symbol} ${historicallyPaid.toFixed(2)}` 
                    : "Nëse klienti po paguan tani, shtoni vlerën më poshtë."}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="Shuma..."
                      className={`w-full border p-3.5 rounded-xl outline-none font-semibold text-gray-800 bg-gray-50 ${formData.payment_type === 'refund' ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`} 
                      value={formData.new_payment_amount} 
                      onChange={(e) => setFormData({...formData, new_payment_amount: e.target.value})} 
                    />
                  </div>
                  <select className="border border-gray-300 p-3.5 rounded-xl outline-none bg-gray-50 text-sm font-semibold text-gray-600" value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})}>
                    <option value="cash">Në dorë (Cash)</option><option value="bank">Bankë</option><option value="pos">POS</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 5. STATUSI PËRFUNDIMTAR */}
        {/* ==================================================== */}
        <div className="p-6 md:p-8 bg-gray-50 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Gjendja Përfundimtare e Eventit</label>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => handleStatusClick('confirmed')} className={`px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'confirmed' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Konfirmuar</button>
              <button type="button" onClick={() => handleStatusClick('pending')} className={`px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Në Pritje</button>
              <button type="button" onClick={() => handleStatusClick('postponed')} className={`px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'postponed' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Shtyrë</button>
              <button type="button" onClick={() => handleStatusClick('cancelled')} className={`px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'cancelled' ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Anuluar</button>
              <button type="button" onClick={() => handleStatusClick('completed')} className={`px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'completed' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Përfunduar</button>
            </div>
          </div>

          {formData.status === 'cancelled' && (
            <div className="w-full animate-in slide-in-from-top-2 fade-in space-y-4 pt-4 border-t border-gray-200">
              {renderCancellationPolicy()}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Arsyeja e Anulimit</label>
                <input 
                  type="text" 
                  placeholder="Pse po anulohet ky event?" 
                  className="w-full bg-white border border-gray-300 p-4 rounded-xl outline-none focus:border-red-400 text-gray-700 font-medium transition-colors" 
                  value={formData.cancel_reason} 
                  onChange={(e) => setFormData({...formData, cancel_reason: e.target.value})} 
                />
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-gray-400 text-xs font-medium space-y-1.5 flex-1">
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Regjistruar: <span className="text-gray-600 font-bold">{createdAt ? format(new Date(createdAt), 'dd.MM.yyyy HH:mm') : '...'}</span> nga <span className="text-gray-700 font-bold">{creatorName}</span>
                </p>
                {lastModifierName && lastModifiedAt && new Date(lastModifiedAt).getTime() - new Date(createdAt).getTime() > 60000 && (
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Ndryshuar: <span className="text-blue-500 font-bold">{format(new Date(lastModifiedAt), 'dd.MM.yyyy HH:mm')}</span> nga <span className="text-gray-700 font-bold">{lastModifierName}</span>
                  </p>
                )}
                <button type="button" onClick={() => setShowLogsModal(true)} className="mt-2 flex items-center gap-1 text-indigo-500 hover:text-indigo-700 font-bold transition-colors bg-indigo-50 px-2 py-1 rounded-md">
                  <History size={12} /> Shiko historikun e plotë
                </button>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              {formData.status === 'pending' && (
                <button type="button" onClick={(e) => handleSave(e, true)} disabled={loading} className="bg-amber-50 text-amber-700 font-bold py-4 px-8 rounded-xl hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 border border-amber-200 shadow-sm">
                  <FileText size={20} /> Gjenero Ofertë
                </button>
              )}
              <button type="submit" disabled={loading} className="w-full sm:w-auto bg-[#0F172A] text-white font-semibold py-4 px-12 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md disabled:bg-gray-400">
                <Save size={20} /> {loading ? "Po Ruhet..." : "Ruaj Ndryshimet"}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}