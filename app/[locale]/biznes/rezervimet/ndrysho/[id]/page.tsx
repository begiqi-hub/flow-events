"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarDays, Users, Banknote, 
  ArrowLeft, Save, User, CheckCircle2, AlertTriangle, Sparkles, Building2, XCircle, ArrowRightLeft, Clock4, Info, Utensils, Receipt, RotateCcw, PartyPopper, CheckCheck, FileText, Lock, Undo2
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
  
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [auditLog, setAuditLog] = useState<any>({ created_at: null, updated_at: null });
  const [historicallyPaid, setHistoricallyPaid] = useState<number>(0);

  const [originalTotal, setOriginalTotal] = useState("0");
  const [lastMathTotal, setLastMathTotal] = useState(0);

  const [waivePenalty, setWaivePenalty] = useState(false);

  const currencySymbols: Record<string, string> = {
    "EUR": "€", "USD": "$", "GBP": "£", "CHF": "CHF", "ALL": "L", "MKD": "ден"
  };
  const symbol = businessInfo?.currency ? (currencySymbols[businessInfo.currency] || businessInfo.currency) : "€";

  const [formData, setFormData] = useState({
    client_name: "", event_type: "", hall_id: "", menu_id: "",
    event_date: "", start_time: "", end_time: "", participants: "",
    total_amount: "0", status: "confirmed", cancel_reason: "",
    new_payment_amount: "", payment_method: "cash",
    payment_type: "payment", 
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
        setBusinessInfo(data.business);
        
        setAuditLog({ 
          created_at: (data.booking as any).created_at || null, 
          updated_at: (data.booking as any).updated_at || null 
        });
        
        const preSelected = data.booking.booking_extras?.map((be: any) => be.extras) || [];
        setSelectedExtras(preSelected);

        let totalPaid = 0;
        data.booking.payments?.forEach((p: any) => {
          if (p.type === 'refund') {
            totalPaid -= Number(p.amount); 
          } else {
            totalPaid += Number(p.amount); 
          }
        });
        setHistoricallyPaid(totalPaid);

        const dbTotal = data.booking.total_amount?.toString() || "0";
        setOriginalTotal(dbTotal);

        const dbMenu = data.allMenus?.find((m: any) => m.id === (data.booking as any).menu_id);
        const dbMenuPrice = dbMenu ? Number(dbMenu.price_per_person) : 0;
        const dbHall = data.allHalls?.find((h: any) => h.id === data.booking.hall_id);
        const dbHallPrice = dbHall?.price ? Number(dbHall.price) : 0;
        const dbPax = Number(data.booking.participants) || 0;
        const dbExtras = preSelected.reduce((sum: number, ext: any) => sum + Number(ext.price), 0);
        
        setLastMathTotal((dbPax * dbMenuPrice) + dbHallPrice + dbExtras);

        let theDate = "";
        if (data.booking.event_date) {
           const dObj = new Date(data.booking.event_date);
           const y = dObj.getUTCFullYear();
           const m = String(dObj.getUTCMonth() + 1).padStart(2, '0');
           const d = String(dObj.getUTCDate()).padStart(2, '0');
           theDate = `${y}-${m}-${d}`;
        }

        setFormData({
          client_name: data.booking.clients?.name || t("unknownClient") || "Klient i Panjohur",
          event_type: (data.booking as any).event_type || "",
          hall_id: data.booking.hall_id || "",
          menu_id: (data.booking as any).menu_id || "", 
          event_date: theDate,
          start_time: formatTimeForInput(data.booking.start_time),
          end_time: formatTimeForInput(data.booking.end_time),
          participants: data.booking.participants?.toString() || "",
          total_amount: dbTotal,
          status: data.booking.status || "confirmed",
          cancel_reason: data.booking.cancel_reason || "",
          new_payment_amount: "",
          payment_method: "cash",
          payment_type: "payment",
          staff_notes: data.booking.staff_notes || "",
          admin_notes: data.booking.admin_notes || ""
        });
      }
      setFetching(false);
    }
    loadData();
  }, [id, t]);

  const recalculateTotal = (overrides: any) => {
    const pax = overrides.participants !== undefined ? Number(overrides.participants) : Number(formData.participants);
    const menuId = overrides.menu_id !== undefined ? overrides.menu_id : formData.menu_id;
    const hallId = overrides.hall_id !== undefined ? overrides.hall_id : formData.hall_id;
    const extras = overrides.selectedExtras !== undefined ? overrides.selectedExtras : selectedExtras;

    const currentMenu = menusList.find((m: any) => m.id === menuId);
    const menuPrice = currentMenu ? Number(currentMenu.price_per_person) : 0;
    const currentHall = hallsList.find((h: any) => h.id === hallId);
    const hallPrice = currentHall?.price ? Number(currentHall.price) : 0;
    const extrasTotal = extras.reduce((sum: number, ext: any) => sum + Number(ext.price), 0);

    const currentMath = (pax * menuPrice) + hallPrice + extrasTotal;
    
    const discount = Number(originalTotal) - lastMathTotal; 
    const finalNewTotal = Math.max(0, currentMath + discount);

    const updatedForm = { ...formData };
    if (overrides.participants !== undefined) updatedForm.participants = overrides.participants;
    if (overrides.menu_id !== undefined) updatedForm.menu_id = overrides.menu_id;
    if (overrides.hall_id !== undefined) updatedForm.hall_id = overrides.hall_id;
    
    setFormData({ ...updatedForm, total_amount: finalNewTotal.toFixed(2) });
  };

  const handleParticipantChange = (e: any) => recalculateTotal({ participants: e.target.value });
  const handleMenuChange = (e: any) => recalculateTotal({ menu_id: e.target.value });
  const handleHallChange = (e: any) => recalculateTotal({ hall_id: e.target.value });
  
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
    
    const currentMenu = menusList.find((m: any) => m.id === formData.menu_id);
    const menuPrice = currentMenu ? Number(currentMenu.price_per_person) : 0;
    const currentHall = hallsList.find((h: any) => h.id === formData.hall_id);
    const hallPrice = currentHall?.price ? Number(currentHall.price) : 0;
    const extrasTotal = selectedExtras.reduce((sum: number, ext: any) => sum + Number(ext.price), 0);
    
    const currentMath = (Number(formData.participants) * menuPrice) + hallPrice + extrasTotal;
    setLastMathTotal(currentMath);
    setOriginalTotal(newTotal);
  };

  const currentTotal = Number(formData.total_amount) || 0;
  const newPaymentInput = Number(formData.new_payment_amount) || 0;
  const remainingToPay = Math.max(0, currentTotal - historicallyPaid);
  
  const remainingAfterNewPayment = formData.payment_type === 'payment' 
      ? Math.max(0, remainingToPay - newPaymentInput)
      : Math.max(0, remainingToPay + newPaymentInput);

  const handleStatusClick = (newStatus: string) => {
    if (newStatus === 'completed') {
      if (remainingAfterNewPayment > 0) {
        setToast({ 
          show: true, 
          message: `Nuk mund ta mbyllni këtë event sepse klienti ju detyrohet edhe ${symbol} ${remainingAfterNewPayment.toFixed(2)}. Ju lutem shtoni pagesën.`, 
          type: "error" 
        });
        return; 
      }
    }
    setFormData({...formData, status: newStatus});
  };

  const renderCancellationPolicy = () => {
    if (!formData.event_date) return null;
    const eventDate = new Date(formData.event_date);
    const today = new Date();
    eventDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
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
              {!waivePenalty && (
                <p className="text-red-500/90 font-medium mt-1">Anulimi po bëhet vetëm {diffDays} ditë para eventit. Aplikohet gjoba prej <strong>{penalty}%</strong> ({symbol} {penaltyValue.toFixed(2)}).</p>
              )}
              
              <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={waivePenalty}
                  onChange={(e) => setWaivePenalty(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDIMI MANUAL I ARSYES SË ANULIMIT
    if (formData.status === 'cancelled' && !formData.cancel_reason.trim()) {
      setToast({ show: true, message: "Ju lutem shënoni arsyen e anulimit të eventit!", type: "error" });
      return;
    }

    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    if (formData.payment_type === 'refund' && Number(formData.new_payment_amount) > historicallyPaid) {
      setToast({ show: true, message: `Nuk mund të rimbursoni më shumë se ${symbol} ${historicallyPaid.toFixed(2)} që klienti ka paguar!`, type: "error" });
      setLoading(false);
      return;
    }

    if (formData.status === 'completed' && remainingAfterNewPayment > 0) {
      setToast({ show: true, message: `Provë e dështuar! Ka ende mbetje të papaguar: ${symbol} ${remainingAfterNewPayment.toFixed(2)}`, type: "error" });
      setLoading(false);
      return;
    }

    const dataToSubmit = { 
      ...formData, 
      total_amount: formData.total_amount.toString(),
      new_payment_amount: formData.new_payment_amount.toString(),
      selectedExtras, 
      historically_paid: historicallyPaid 
    };
    
    if (dataToSubmit.status !== 'cancelled') dataToSubmit.cancel_reason = "";

    try {
      const res = await updateBookingAction(id, dataToSubmit);
      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: t("toastSuccess") || "Rezervimi u ruajt me sukses!", type: "success" });
        setTimeout(() => { router.push(`/${locale}/biznes/rezervimet`); }, 1500);
      }
    } catch (error) {
      setToast({ show: true, message: t("toastErrorNet") || "Gabim në lidhje me serverin.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 relative min-h-[80vh]">
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 z-[100]">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95">
             <h3 className="text-xl font-semibold text-gray-900 mb-2">{toast.type === "success" ? t("toastSuccessTitle") || "Sukses" : t("toastWarningTitle") || "Kujdes"}</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium">{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className={`w-full text-white font-semibold py-4 px-6 rounded-2xl ${toast.type === "success" ? "bg-emerald-500" : "bg-[#FF5C39]"}`}>{t("closeBtn") || "Mbyll"}</button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <Link href={`/${locale}/biznes/rezervimet`} className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-gray-700 mb-2 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> {t("backBtn") || "Kthehu"}
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">{t("pageTitle") || "Ndrysho Rezervimin"}</h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">{t("pageSubtitle") || "Përditëso të dhënat dhe ruaj ndryshimet."}</p>
      </div>

      <form onSubmit={handleSubmit} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100">
           <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"><User size={14} /> {t("clientLabel") || "Klienti"}</label>
           <div className="p-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 w-full">{formData.client_name}</div>
        </div>

        <div className="p-6 md:p-8 border-b border-gray-100">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             
             <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">{t("eventTypeLabel") || "Lloji i Eventit"}</label>
                <div className="relative">
                  <PartyPopper size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    list="event-types" 
                    required 
                    placeholder={t("eventTypePlaceholder") || "psh: Dasëm"} 
                    className="w-full border border-gray-200 p-3.5 pl-10 rounded-xl outline-none focus:border-gray-400 text-gray-700 font-medium" 
                    value={formData.event_type} 
                    onChange={(e) => setFormData({...formData, event_type: e.target.value})} 
                  />
                  <datalist id="event-types">
                    <option value="Dasëm" />
                    <option value="Fejesë" />
                    <option value="Ditëlindje" />
                    <option value="Event Korporativ / Biznes" />
                    <option value="Konferencë / Seminar" />
                    <option value="Aheng Familjar" />
                    <option value="Mbrëmje e Maturës" />
                    <option value="Syneti / Pagëzim" />
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">{t("hallLabel") || "Salla"}</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select className="w-full border border-gray-200 p-3.5 pl-10 rounded-xl outline-none focus:border-gray-400 font-medium bg-white text-gray-700" value={formData.hall_id} onChange={handleHallChange}>
                    <option value="">{t("hallPlaceholder") || "Zgjidh Sallën"}</option>
                    {hallsList.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">{t("menuLabel") || "Menuja"}</label>
                <div className="relative">
                  <Utensils size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select className="w-full border border-gray-200 p-3.5 pl-10 rounded-xl outline-none focus:border-gray-400 font-medium bg-white text-gray-700" value={formData.menu_id} onChange={handleMenuChange}>
                    <option value="">{t("menuPlaceholder") || "Zgjidh Menu"}</option>
                    {menusList.map((m: any) => <option key={m.id} value={m.id}>{m.name} - {symbol} {m.price_per_person}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">{t("participantsLabel") || "Numri i Pjesëmarrësve"}</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" required placeholder={t("participantsPlaceholder") || "Psh: 200"} className="w-full border border-gray-200 p-3.5 pl-10 rounded-xl outline-none focus:border-gray-400 text-gray-700 font-medium" value={formData.participants} onChange={handleParticipantChange} />
                </div>
              </div>

           </div>
        </div>

        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">{t("eventDateLabel") || "Data e Eventit"}</label>
              <input type="date" required className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-400 text-gray-700 font-medium" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">{t("eventTimeLabel") || "Ora (Fillimi - Mbarimi)"}</label>
              <div className="flex items-center gap-2">
                <input type="time" required className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-400 text-gray-700 font-medium" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                <span className="text-gray-300">-</span>
                <input type="time" required className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-400 text-gray-700 font-medium" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-b border-gray-100 space-y-4 bg-purple-50/20">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Sparkles size={16} className="text-purple-400"/> {t("extrasLabel") || "Shërbime Ekstra"}</h3>
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
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6"><Receipt size={20} className="text-emerald-500"/> {t("financeTitle") || "Financat & Pagesat"}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                  {t("invoiceTotalLabel") || "Totali i Faturës"} ({symbol})
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold ml-2">Auto</span>
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="w-full border border-emerald-300 p-4 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 font-semibold text-gray-800 bg-white shadow-sm text-lg transition-all" 
                  value={formData.total_amount} 
                  onChange={handleManualTotalChange} 
                />
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-gray-500">{t("paidSoFarLabel") || "E paguar deri tani"}</span>
                   <span className="text-base font-semibold text-emerald-600">{symbol} {historicallyPaid.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                   <span className="text-sm font-medium text-gray-500">{t("leftToPayLabel") || "Mbetja"}</span>
                   <span className="text-lg font-semibold text-red-500">{remainingToPay > 0 ? symbol + " " + remainingToPay.toFixed(2) : symbol + " 0.00"}</span>
                 </div>
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
                   {formData.payment_type === 'refund' ? 'Shuma për t\'u kthyer' : (t("addPaymentLabel") || "Shto Pagesë të Re")}
                </label>
                
                <p className="text-xs text-gray-500 mb-4 font-medium">
                  {formData.payment_type === 'refund' 
                    ? `Sa po i ktheni klientit mbrapsht? (Maksimumi i mundshëm: ${symbol} ${historicallyPaid.toFixed(2)})` 
                    : "Nëse klienti po paguan tani, shtoni vlerën më poshtë."}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* KËTU U HEQ IKONA E VALUTËS QË BËNTE ZHURMË */}
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder={t("amountPlaceholder") || "Shuma..."} 
                      className={`w-full border p-3.5 rounded-xl outline-none font-semibold text-gray-800 bg-gray-50 ${formData.payment_type === 'refund' ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`} 
                      value={formData.new_payment_amount} 
                      onChange={(e) => setFormData({...formData, new_payment_amount: e.target.value})} 
                    />
                  </div>
                  <select className="border border-gray-300 p-3.5 rounded-xl outline-none bg-gray-50 text-sm font-semibold text-gray-600" value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})}>
                    <option value="cash">{t("methodCash") || "Cash"}</option>
                    <option value="bank">{t("methodBank") || "Bankë"}</option>
                    <option value="pos">{t("methodPos") || "POS"}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-gray-50 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t("finalStatusLabel") || "Statusi i Eventit"}</label>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => handleStatusClick('confirmed')} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'confirmed' ? 'border-emerald-500 bg-emerald-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <CheckCircle2 size={18}/> {t("statusConfirmed") || "Konfirmuar"}
              </button>
              <button type="button" onClick={() => handleStatusClick('pending')} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'pending' ? 'border-amber-500 bg-amber-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <Clock4 size={18}/> {t("statusPending") || "Në Pritje"}
              </button>
              <button type="button" onClick={() => handleStatusClick('postponed')} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'postponed' ? 'border-blue-500 bg-blue-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <ArrowRightLeft size={18}/> {t("statusPostponed") || "Shtyrë"}
              </button>
              
              <button type="button" onClick={() => handleStatusClick('cancelled')} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'cancelled' ? 'border-red-500 bg-red-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <XCircle size={18}/> {t("statusCancelled") || "Anuluar"}
              </button>

              <button type="button" onClick={() => handleStatusClick('completed')} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'completed' ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                <CheckCheck size={18}/> {t("statusCompleted") || "Përfunduar"}
              </button>
            </div>
          </div>

          {formData.status === 'cancelled' && (
            <div className="w-full animate-in slide-in-from-top-2 fade-in space-y-4 pt-4 border-t border-gray-200">
              {renderCancellationPolicy()}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("cancelReasonLabel") || "Arsyeja e Anulimit"}</label>
                {/* U HEQ ATRIBUTI 'required' QË TË MOS NXJERRË MESAZHIN ANGLISHT TË BROWSERIT */}
                <input 
                  type="text" 
                  placeholder={t("cancelReasonPlaceholder") || "Pse po anulohet ky event?"} 
                  className="w-full bg-white border border-gray-300 p-4 rounded-xl outline-none focus:border-red-400 text-gray-700 font-medium transition-colors" 
                  value={formData.cancel_reason} 
                  onChange={(e) => setFormData({...formData, cancel_reason: e.target.value})} 
                />
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-gray-400 text-xs font-medium space-y-1">
                <p>{t("registeredBy") || "Krijuar më"} <span className="text-gray-600 font-semibold">{auditLog.created_at ? format(new Date(auditLog.created_at), 'dd.MM.yyyy HH:mm') : '...'}</span> {t("by") || "nga"} {businessInfo?.name}</p>
                {auditLog.updated_at && new Date(auditLog.updated_at).getTime() - new Date(auditLog.created_at).getTime() > 60000 && (
                  <p>{t("changedBy") || "Ndryshuar më"} <span className="text-blue-500 font-semibold">{format(new Date(auditLog.updated_at), 'dd.MM.yyyy HH:mm')}</span> {t("by") || "nga"} {businessInfo?.name}</p>
                )}
            </div>

            <button type="submit" disabled={loading || fetching} className="w-full md:w-auto bg-gray-900 text-white font-semibold py-4 px-12 rounded-xl hover:bg-black disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-md">
              <Save size={20} /> {loading ? (t("savingBtn") || "Po Ruhet...") : (t("saveBtn") || "Ruaj Ndryshimet")}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}