"use client";

import { checkAvailabilityAction, saveReservationAction } from "./actions"; 
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, ChevronRight, ChevronLeft, CalendarDays, Utensils, Users, 
  Banknote, Building2, Clock, UsersRound, AlertTriangle, Sparkles, Percent,
  FileDigit, MapPin, Mail, Phone, ChevronDown, Wallet, FileText, User, Building, ShieldAlert, UserCheck, PartyPopper, Search, Lock, Layers, PenTool
} from "lucide-react";
import { useTranslations } from "next-intl"; 

export default function ReservationWizard({ business, halls, menus, extras, clients, locale }: any) {
  const router = useRouter();
  const t = useTranslations("ReservationWizard"); 

  const [currentStep, setCurrentStep] = useState(1);
  const [isPrefixOpen, setIsPrefixOpen] = useState(false);
  const prefixRef = useRef<HTMLDivElement>(null);
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const clientInputRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  
  const [toast, setToast] = useState({ 
    show: false, 
    message: "", 
    type: "success", 
    complete: false,
    bookingId: "",
    isQuotation: false
  });

  const currencySymbols: Record<string, string> = {
    "EUR": "€", "USD": "$", "GBP": "£", "CHF": "CHF", "ALL": "L", "MKD": "ден"
  };
  const symbol = business?.currency ? (currencySymbols[business.currency] || business.currency) : "€";

  const [formData, setFormData] = useState({
    event_type: "",
    event_date: "", start_time: "", end_time: "", hall_id: "", participants: "",
    
    setup_type: "banket",
    billing_model: "per_person",
    hall_rent: "", 
    
    menu_id: "", 
    extras: [] as any[], 
    
    client_type: "individual",
    client_name: "", 
    client_personal_id: "", 
    client_gender: "", 
    client_business_name: "",
    client_business_num: "",
    client_representative: "", 
    client_address: "",
    client_city: "", 
    client_phone_prefix: "+383", 
    client_phone: "", 
    client_email: "",
    
    discount_percent: "", 
    
    payment_status: "pending",
    payment_method: "cash",
    deposit_amount: "",
    
    staff_notes: "",
    admin_notes: ""
  });

  const steps = [
    { id: 1, name: t("step1"), icon: CalendarDays },
    { id: 2, name: t("step2"), icon: Utensils },
    { id: 3, name: t("step3"), icon: Sparkles },
    { id: 4, name: t("step4"), icon: Users },
    { id: 5, name: t("step5"), icon: Banknote },
  ];

  const phonePrefixes = [
    { code: "+383", country: "Kosovë", icon: "https://flagcdn.com/w40/xk.png" },
    { code: "+355", country: "Shqipëri", icon: "https://flagcdn.com/w40/al.png" },
    { code: "+389", country: "Maqedoni", icon: "https://flagcdn.com/w40/mk.png" },
    { code: "+41",  country: "Zvicër", icon: "https://flagcdn.com/w40/ch.png" },
    { code: "+49",  country: "Gjermani", icon: "https://flagcdn.com/w40/de.png" }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (prefixRef.current && !prefixRef.current.contains(event.target as Node)) {
        setIsPrefixOpen(false);
      }
      if (clientInputRef.current && !clientInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectClient = (c: any) => {
    let prefix = "+383";
    let phoneNum = c.phone || "";
    
    const matchedPrefix = phonePrefixes.find(p => phoneNum.startsWith(p.code));
    if (matchedPrefix) {
      prefix = matchedPrefix.code;
      phoneNum = phoneNum.slice(matchedPrefix.code.length).trim();
    }

    let rep = "";
    let bName = c.name;
    if (c.client_type === 'business' && c.name.includes("(Përfaqësues:")) {
       const parts = c.name.split("(Përfaqësues:");
       bName = parts[0].trim();
       rep = parts[1].replace(")", "").trim();
    }

    setFormData(prev => ({
      ...prev,
      client_type: c.client_type || 'individual',
      client_name: c.client_type === 'individual' ? c.name : prev.client_name,
      client_business_name: c.client_type === 'business' ? bName : "",
      client_representative: rep,
      client_phone_prefix: prefix,
      client_phone: phoneNum,
      client_email: c.email || "",
      client_personal_id: c.personal_id || "",
      client_gender: c.gender || "",
      client_city: c.city || "",
      client_address: c.address || "",
      client_business_num: c.business_num || ""
    }));
    
    setShowSuggestions(false);
  };

  const toggleExtra = (extra: any) => {
    const isSelected = formData.extras.find((e: any) => e.id === extra.id);
    if (isSelected) {
      setFormData({ ...formData, extras: formData.extras.filter((e: any) => e.id !== extra.id) });
    } else {
      setFormData({ ...formData, extras: [...formData.extras, extra] });
    }
  };

  const isStep1Valid = formData.event_date && formData.start_time && formData.end_time && formData.participants && formData.hall_id;
  const isStep2Valid = formData.billing_model === 'flat_rent' || true; 

  const selectedHall = halls?.find((h: any) => h.id === formData.hall_id);
  
  let maxAllowedCapacity = selectedHall ? selectedHall.capacity : 0;
  if (selectedHall) {
    if (formData.setup_type === 'teater') {
      maxAllowedCapacity = Math.floor(selectedHall.capacity * 1.3); 
    } else if (formData.setup_type === 'koktej' || formData.setup_type === 'zbrazet') {
      maxAllowedCapacity = Math.floor(selectedHall.capacity * 1.6); 
    }
  }
  
  const isOverCapacity = selectedHall && Number(formData.participants) > maxAllowedCapacity;
  
  const selectedMenu = menus?.find((m: any) => m.id === formData.menu_id);
  
  const totalMenuCost = (formData.billing_model === 'per_person' && selectedMenu) 
      ? (Number(formData.participants) * Number(selectedMenu.price_per_person)) 
      : 0;
  
  const hallPrice = formData.billing_model === 'flat_rent' 
      ? (Number(formData.hall_rent) || 0) 
      : (selectedHall?.price ? Number(selectedHall.price) : 0);
  
  const extrasCost = formData.extras.reduce((sum: number, item: any) => sum + Number(item.price), 0);
  
  const subTotal = totalMenuCost + extrasCost + hallPrice;
  
  const discountPercent = Number(formData.discount_percent) || 0;
  const discountAmount = (subTotal * discountPercent) / 100;
  const finalTotal = subTotal > discountAmount ? (subTotal - discountAmount) : 0;
  
  const depositValue = Number(formData.deposit_amount) || 0;
  const remainingBalance = formData.payment_status === 'paid' ? 0 : (finalTotal - depositValue);

  const isDepositError = formData.payment_status === 'deposit' && (depositValue <= 0 || depositValue > finalTotal);

  const handleNext = async () => {
    if (loading) return; 

    if (currentStep === 1) {
      if (!isStep1Valid) return;
      
      setLoading(true);
      setToast({ show: false, message: "", type: "success", complete: false, bookingId: "", isQuotation: false });

      try {
        const check = await checkAvailabilityAction(
          formData.hall_id, 
          formData.event_date, 
          formData.start_time, 
          formData.end_time
        );

        if (!check || check.available === false) {
          setLoading(false);
          setToast({ show: true, message: check?.message || "Kjo sallë është e zënë në këtë orar!", type: "error", complete: false, bookingId: "", isQuotation: false });
          return; 
        }

        if (check.warning) {
          setToast({ show: true, message: check.message, type: "warning", complete: false, bookingId: "", isQuotation: false });
        }

        setLoading(false);
        setCurrentStep(2); 
        return; 

      } catch (error) {
        setLoading(false);
        setToast({ show: true, message: "Ndodhi një gabim gjatë lidhjes me serverin.", type: "error", complete: false, bookingId: "", isQuotation: false });
        return;
      }
    }

    if (currentStep > 1 && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePrintDocument = () => {
    if (!toast.bookingId) return;
    
    if (toast.isQuotation) {
      window.open(`/${locale}/biznes/ofertat/${toast.bookingId}/printo`, '_blank');
    } else {
      window.open(`/${locale}/biznes/rezervimet/${toast.bookingId}/fatura`, '_blank');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setToast({ show: false, message: "", type: "success", complete: false, bookingId: "", isQuotation: false });

    let actualDeposit = "0";
    if (formData.payment_status === "paid") {
      actualDeposit = finalTotal.toString(); 
    } else if (formData.payment_status === "deposit") {
      actualDeposit = depositValue.toString();
    }

    const finalData = { 
      ...formData, 
      menu_id: formData.billing_model === 'flat_rent' ? null : formData.menu_id,
      total_amount: finalTotal.toString(),
      deposit_amount: actualDeposit 
    };

    try {
      const res = await saveReservationAction(finalData);

      if (res.error) {
        setToast({ show: true, message: res.error, type: "error", complete: false, bookingId: "", isQuotation: false });
        setLoading(false);
      } else {
        setToast({ show: true, message: t("successMsg"), type: "success", complete: true, bookingId: res.bookingId, isQuotation: false });
        setLoading(false);
      }
    } catch (error) {
      setToast({ show: true, message: t("networkError"), type: "error", complete: false, bookingId: "", isQuotation: false });
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-[700px] relative">
      
       {toast.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
            <div className={`relative mx-auto -mt-16 mb-6 w-24 h-24 rounded-full flex items-center justify-center border-8 border-white shadow-lg ${toast.type === "success" ? "bg-[#F0FDF4] text-emerald-500" : "bg-[#FFF9F2] text-[#E6931E]"}`}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                {toast.type === "success" 
                  ? <path d="M12 22a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2zm6-6v2H6v-2l2-2V9a4 4 0 0 1 4-4 4 4 0 0 1 4 4v5l2 2z" />
                  : <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                }
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? t("successTitle") : t("warningTitle") || "Kujdes!"}
            </h3>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed font-medium">{toast.message}</p>
            
            {toast.complete ? (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handlePrintDocument} 
                  className="w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:bg-gray-800 hover:scale-[1.02]"
                >
                  <FileText size={20} /> {toast.isQuotation ? "Printo Ofertën" : "Printo Faturën"}
                </button>
                
                {!toast.isQuotation && (
                  <button 
                    onClick={() => window.open(`/${locale}/biznes/rezervimet/${toast.bookingId}/kontrata`, '_blank')} 
                    className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:bg-indigo-700 hover:scale-[1.02]"
                  >
                    <PenTool size={20} /> Printo Kontratën
                  </button>
                )}

                <button 
                  onClick={() => router.push(`/${locale}/biznes/${toast.isQuotation ? 'ofertat' : 'rezervimet'}`)} 
                  className="w-full bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:bg-emerald-600 hover:scale-[1.02] shadow-emerald-200 mt-2"
                >
                  Kthehu te Lista <span className="text-xl">→</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setToast({ ...toast, show: false })} className={`w-full text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : "bg-[#FF5C39] hover:bg-[#e84e2d] shadow-orange-200"}`}>
                {t("closeBtn") || "Mbyll"} <span className="text-xl">→</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SHIRITI I PROGRESIT */}
      <div className="bg-gray-50/80 border-b border-gray-100 px-6 sm:px-12 pt-8 pb-16 rounded-t-3xl overflow-hidden">
        <div className="relative flex justify-between w-full max-w-4xl mx-auto">
          <div className="absolute top-5 left-0 w-full h-1.5 bg-gray-200 -translate-y-1/2 rounded-full z-0" />
          <div 
            className="absolute top-5 left-0 h-1.5 bg-emerald-500 -translate-y-1/2 rounded-full z-0 transition-all duration-700 ease-out" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} 
          />
          
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.name} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 transition-all duration-500 
                    ${isCompleted ? 'border-emerald-500 bg-emerald-50 text-emerald-500 shadow-sm' : 
                      isCurrent ? 'border-gray-900 bg-gray-900 text-white shadow-md scale-110' : 'border-gray-300 bg-white text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? <Check size={22} strokeWidth={3.5} /> : <step.icon size={20} strokeWidth={isCurrent ? 2.5 : 2} />}
                </div>
                <span className={`absolute top-14 mt-1 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors duration-300
                  ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-gray-900' : 'text-gray-400'}
                `}>
                  {step.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-6 md:p-10 flex-1">
        
        {/* HAPI 1: KOHA DHE SALLA */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("step1Title")}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><PartyPopper size={16} className="text-gray-400" /> {t("eventTypeLabel")}</label>
                <input 
                  type="text" 
                  list="event-types" 
                  className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" 
                  placeholder={t("eventTypePlaceholder")} 
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

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><UsersRound size={16} className="text-gray-400" /> {t("guestsLabel")}</label>
                <input type="number" placeholder={t("guestsPlaceholder")} className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.participants} onChange={(e) => setFormData({...formData, participants: e.target.value})} />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Clock size={16} className="text-gray-400" /> {t("startTimeLabel")}</label>
                <input type="time" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Clock size={16} className="text-gray-400" /> {t("endTimeLabel")}</label>
                <input type="time" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><CalendarDays size={16} className="text-gray-400" /> {t("dateLabel")}</label>
                <input type="date" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Layers size={16} className="text-gray-400" /> Formati i Sallës</label>
                <select className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" value={formData.setup_type} onChange={(e) => setFormData({...formData, setup_type: e.target.value})}>
                  <option value="banket">Banket (Tavolina & Karrige - Dasma/Ahengje)</option>
                  <option value="teater">Teatër (Vetëm Karrige - Seminare)</option>
                  <option value="koktej">Koktej (Në këmbë / Shankerica)</option>
                  <option value="klase">Klasë (U-Shape / Trajnime)</option>
                  <option value="zbrazet">E Zbrazët (Vetëm Skenë/Hapësirë)</option>
                </select>
              </div>
            </div>

            <hr className="border-gray-100 mb-8" />

            <h3 className="text-lg font-bold text-gray-900 mb-4">{t("selectHallTitle")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {halls?.length > 0 ? halls.map((hall: any) => (
                <div 
                  key={hall.id} 
                  onClick={() => setFormData({...formData, hall_id: hall.id, hall_rent: hall.price?.toString() || "0"})} 
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition-all relative overflow-hidden group ${formData.hall_id === hall.id ? 'border-gray-900 bg-gray-50/50 shadow-md' : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'}`}
                >
                  {hall.image && <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: `url(${hall.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
                  <div className="relative z-10 flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${formData.hall_id === hall.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}><Building2 size={24} /></div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{hall.name}</h4>
                      <p className="text-sm text-gray-500 font-medium">{t("capacityLabel")} <span className="text-gray-900">{hall.capacity}</span></p>
                    </div>
                  </div>
                  {formData.hall_id === hall.id && <div className="absolute top-4 right-4 text-gray-900"><Check size={20} strokeWidth={3} /></div>}
                </div>
              )) : (<p className="text-gray-500 text-sm">{t("noHallsMsg")}</p>)}
            </div>

            {isOverCapacity && (
              <div className="mt-6 bg-[#FFF9F2] border border-[#E6931E]/30 text-[#E6931E] p-4 rounded-xl flex items-start gap-4">
                <AlertTriangle size={24} className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">{t("capacityWarningTitle") || "Kujdes: Kapaciteti i kaluar!"}</h4>
                  <p className="text-sm opacity-90 mt-1">
                    Keni shënuar <strong>{formData.participants} persona</strong>, por kjo sallë për formatin "{formData.setup_type}" nxë maksimalisht <strong>{maxAllowedCapacity} persona</strong>. <br/>
                    <em>(Kapaciteti bazë me tavolina është {selectedHall.capacity}). Mund të vazhdoni, por merrni parasysh hapësirën.</em>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* HAPI 2: MENUJA / QIRAJA */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("step2Title")}</h2>
            <p className="text-gray-500 mb-8 font-medium">{t("step2Subtitle")}</p>

            <div className="flex p-1 bg-gray-100 rounded-2xl w-full max-w-md mb-8 mx-auto">
                <button 
                    type="button" 
                    onClick={() => setFormData({...formData, billing_model: 'per_person'})}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.billing_model === 'per_person' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                    <Utensils size={18} /> Me Menu (Për person)
                </button>
                <button 
                    type="button" 
                    onClick={() => setFormData({...formData, billing_model: 'flat_rent', hall_rent: selectedHall?.price?.toString() || "0"})}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.billing_model === 'flat_rent' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                    <Building2 size={18} /> Qira (Vetëm Salla)
                </button>
            </div>

            {formData.billing_model === 'per_person' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95">
                  {menus?.length > 0 ? menus.map((menu: any) => (
                    <div key={menu.id} onClick={() => setFormData({...formData, menu_id: menu.id})} className={`cursor-pointer rounded-2xl border-2 transition-all relative overflow-hidden group flex flex-col ${formData.menu_id === menu.id ? 'border-gray-900 bg-gray-50/50 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-gray-300'}`}>
                      <div className="h-40 bg-gray-100 relative border-b border-gray-100 shrink-0">
                        {menu.image ? <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Utensils size={32} /></div>}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                          <span className="text-sm font-black text-gray-900">{symbol} {Number(menu.price_per_person).toFixed(2)}</span>
                          <span className="text-[10px] text-gray-500 uppercase font-bold ml-1">{t("perPersonLabel")}</span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col relative bg-white">
                        <h4 className="font-bold text-gray-900 text-lg mb-3 pr-8">{menu.name}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line pb-6">{menu.description || t("noDescriptionMsg")}</p>
                        {formData.menu_id === menu.id && <div className="absolute bottom-5 right-5 text-gray-900 bg-white rounded-full shadow-sm"><Check size={22} strokeWidth={3} /></div>}
                      </div>
                    </div>
                  )) : (<p className="text-gray-500 text-sm">{t("noMenusMsg")}</p>)}
                </div>

                {formData.menu_id && (
                  <div className="mt-4 flex justify-end">
                    <button onClick={() => setFormData({...formData, menu_id: ""})} className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
                      {t("removeMenuBtn")}
                    </button>
                  </div>
                )}

                {formData.menu_id && selectedMenu && (
                  <div className="mt-8 bg-gray-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between shadow-xl animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
                      <div className="bg-white/20 p-4 rounded-full shrink-0"><Banknote size={28} className="text-emerald-400" /></div>
                      <div>
                        <p className="text-gray-300 text-sm font-medium mb-1">{t("foodCalcTitle")}</p>
                        <p className="text-white font-bold text-lg">{formData.participants} {t("invoicePersons")} <span className="text-gray-400 mx-2">x</span> {symbol} {Number(selectedMenu.price_per_person).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto border-t border-gray-700 sm:border-0 pt-4 sm:pt-0 overflow-hidden">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{t("foodCalcTotal")}</p>
                      <p className="text-3xl sm:text-4xl font-black text-emerald-400 truncate">{symbol} {totalMenuCost.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-blue-50/50 border border-blue-100 p-8 sm:p-12 rounded-3xl max-w-xl mx-auto text-center animate-in fade-in zoom-in-95 shadow-sm">
                 <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Building2 size={36}/></div>
                 <h3 className="text-2xl font-black text-gray-900 mb-3">Qiraja e Sallës</h3>
                 <p className="text-sm text-gray-500 mb-8 font-medium">Vendosni çmimin fiks të qirasë për këtë event. Çmimi bazë i sallës është <span className="font-bold text-gray-800">{symbol}{selectedHall?.price || 0}</span></p>
                 <div className="flex items-center justify-center gap-3">
                     <span className="text-3xl font-black text-gray-400">{symbol}</span>
                     <input 
                        type="number" 
                        className="text-4xl font-black text-blue-900 bg-white border border-blue-200 rounded-2xl p-4 w-48 text-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-inner" 
                        value={formData.hall_rent}
                        onChange={(e) => setFormData({...formData, hall_rent: e.target.value})}
                     />
                 </div>
              </div>
            )}
          </div>
        )}

        {/* HAPI 3: EKSTRA */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("step3Title")}</h2>
            <p className="text-gray-500 mb-8 font-medium">{t("step3Subtitle")}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {extras && extras.length > 0 ? (
                extras.map((extra: any) => {
                  const isSelected = formData.extras.some((e: any) => e.id === extra.id);
                  return (
                    <div 
                      key={extra.id} 
                      onClick={() => toggleExtra(extra)}
                      className={`cursor-pointer rounded-2xl border-2 p-5 transition-all flex items-center justify-between group${
                        isSelected ? 'border-gray-900 bg-gray-50 shadow-md' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'}`}>
                         <Sparkles size={20} />
                        </div>
                        <div>
                         <h4 className="font-bold text-gray-900">{extra.name}</h4>
                         <p className="text-emerald-600 font-bold text-sm">+{symbol} {Number(extra.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200'}`}>
                        {isSelected && <Check size={14} strokeWidth={4} />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                  <Sparkles className="mx-auto text-gray-300 mb-3" size={32} />
                  <p className="text-gray-500 font-medium">{t("noExtrasMsg")}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HAPI 4: KLIENTI ME AUTOFILL */}
        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("step4Title")}</h2>
            
            <div className="flex p-1 bg-gray-100 rounded-2xl w-full sm:w-72 mb-8">
              <button 
                type="button" 
                onClick={() => setFormData({
                  ...formData, client_type: 'individual',
                  client_name: '', client_personal_id: '', client_phone: '', client_email: '', client_city: ''
                })}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.client_type === 'individual' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <User size={16} /> {t("individualBtn")}
              </button>
              <button 
                type="button" 
                onClick={() => setFormData({
                  ...formData, client_type: 'business',
                  client_business_name: '', client_business_num: '', client_representative: '', client_address: '', client_phone: '', client_email: '', client_city: ''
                })}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.client_type === 'business' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Building size={16} /> {t("businessBtn")}
              </button>
            </div>

            <div className="bg-gray-50/50 p-6 md:p-8 rounded-3xl border border-gray-100">
                
                {formData.client_type === 'individual' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    
                    <div className="relative" ref={clientInputRef}>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Users size={16} className="text-gray-400" /> {t("nameLabel")}</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" 
                        placeholder={t("nameSearchPlaceholder")} 
                        value={formData.client_name} 
                        onChange={(e) => {
                         setFormData({...formData, client_name: e.target.value});
                         setShowSuggestions(true);
                        }} 
                      />
                      
                      {showSuggestions && formData.client_name.length > 1 && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden py-2 max-h-60 overflow-y-auto">
                         {clients?.filter((c: any) => c.name.toLowerCase().includes(formData.client_name.toLowerCase())).map((c: any) => (
                           <button
                             key={c.id}
                             type="button"
                             onClick={() => handleSelectClient(c)}
                             className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                           >
                             <div className="bg-gray-100 p-2 rounded-full text-gray-500"><Search size={14}/></div>
                             <div>
                               <span className="block font-bold text-gray-900">{c.name}</span>
                               <span className="text-xs text-gray-500">{c.phone} • {c.city || t("noCityLabel")}</span>
                             </div>
                           </button>
                         ))}
                         {clients?.filter((c: any) => c.name.toLowerCase().includes(formData.client_name.toLowerCase())).length === 0 && (
                           <div className="px-4 py-3 text-sm text-gray-500 italic">{t("noClientFoundMsg")}</div>
                         )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><FileDigit size={16} className="text-gray-400" /> {t("personalIdLabel")}</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder={t("personalIdPlaceholder")} value={formData.client_personal_id} onChange={(e) => setFormData({...formData, client_personal_id: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t("genderLabel")}</label>
                      <select className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" value={formData.client_gender} onChange={(e) => setFormData({...formData, client_gender: e.target.value})}>
                        <option value="">{t("genderSelect")}</option>
                        <option value="M">{t("genderMale")}</option>
                        <option value="F">{t("genderFemale")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><MapPin size={16} className="text-gray-400" /> {t("cityLabel")}</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder={t("cityPlaceholder")} value={formData.client_city} onChange={(e) => setFormData({...formData, client_city: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Phone size={16} className="text-gray-400" /> {t("phoneLabel")}</label>
                      <div className="flex border border-gray-200 rounded-xl focus-within:border-gray-900 focus-within:ring-1 bg-white relative">
                        <div className="relative" ref={prefixRef}>
                         <button type="button" onClick={() => setIsPrefixOpen(!isPrefixOpen)} className="flex items-center gap-2 bg-gray-50 border-r border-gray-200 px-3 py-3.5 outline-none font-medium text-gray-700 h-full rounded-l-xl hover:bg-gray-100 transition-colors">
                           <img src={phonePrefixes.find(p => p.code === formData.client_phone_prefix)?.icon} alt="flag" className="w-5 h-auto rounded-sm shadow-sm" />
                           <span>{formData.client_phone_prefix}</span>
                           <ChevronDown size={14} className="text-gray-400" />
                         </button>
                         {isPrefixOpen && (
                           <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden py-1">
                             {phonePrefixes.map(p => (
                               <button key={p.code} type="button" onClick={() => { setFormData({...formData, client_phone_prefix: p.code}); setIsPrefixOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors">
                                 <img src={p.icon} alt={p.country} className="w-5 h-auto rounded-sm shadow-sm" />
                                 <span className="text-sm font-bold text-gray-700">{p.code}</span>
                               </button>
                             ))}
                           </div>
                         )}
                        </div>
                        <input type="text" className="w-full p-3.5 outline-none rounded-r-xl bg-transparent" placeholder="44 123 456" value={formData.client_phone} onChange={(e) => setFormData({...formData, client_phone: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Mail size={16} className="text-gray-400" /> {t("emailLabel")}</label>
                      <input type="email" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder={t("emailPlaceholder")} value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} />
                    </div>
                  </div>
                )}

                {formData.client_type === 'business' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    
                    <div className="md:col-span-2 relative" ref={clientInputRef}>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Building size={16} className="text-gray-400" /> {t("businessNameLabel")}</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" 
                        placeholder={t("businessSearchPlaceholder")} 
                        value={formData.client_business_name} 
                        onChange={(e) => {
                         setFormData({...formData, client_business_name: e.target.value});
                         setShowSuggestions(true);
                        }} 
                      />
                      
                      {showSuggestions && formData.client_business_name.length > 1 && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden py-2 max-h-60 overflow-y-auto">
                         {clients?.filter((c: any) => c.name.toLowerCase().includes(formData.client_business_name.toLowerCase())).map((c: any) => (
                           <button
                             key={c.id}
                             type="button"
                             onClick={() => handleSelectClient(c)}
                             className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                           >
                             <div className="bg-gray-100 p-2 rounded-full text-gray-500"><Building size={14}/></div>
                             <div>
                               <span className="block font-bold text-gray-900">{c.name}</span>
                               <span className="text-xs text-gray-500">{c.phone} • NUI: {c.business_num || 'N/A'}</span>
                             </div>
                           </button>
                         ))}
                         {clients?.filter((c: any) => c.name.toLowerCase().includes(formData.client_business_name.toLowerCase())).length === 0 && (
                           <div className="px-4 py-3 text-sm text-gray-500 italic">{t("noBusinessFoundMsg")}</div>
                         )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><FileDigit size={16} className="text-gray-400" /> {t("nuiLabel")}</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder={t("nuiPlaceholder")} value={formData.client_business_num} onChange={(e) => setFormData({...formData, client_business_num: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><UserCheck size={16} className="text-gray-400" /> {t("repLabel")}</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder={t("repPlaceholder")} value={formData.client_representative} onChange={(e) => setFormData({...formData, client_representative: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><MapPin size={16} className="text-gray-400" /> {t("businessAddressLabel")}</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder={t("businessAddressPlaceholder")} value={formData.client_address} onChange={(e) => setFormData({...formData, client_address: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><MapPin size={16} className="text-gray-400" /> {t("cityLabel")}</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder={t("cityPlaceholder")} value={formData.client_city} onChange={(e) => setFormData({...formData, client_city: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Phone size={16} className="text-gray-400" /> {t("phoneLabel")}</label>
                      <div className="flex border border-gray-200 rounded-xl focus-within:border-gray-900 focus-within:ring-1 bg-white relative">
                        <div className="relative" ref={prefixRef}>
                         <button type="button" onClick={() => setIsPrefixOpen(!isPrefixOpen)} className="flex items-center gap-2 bg-gray-50 border-r border-gray-200 px-3 py-3.5 outline-none font-medium text-gray-700 h-full rounded-l-xl hover:bg-gray-100 transition-colors">
                           <img src={phonePrefixes.find(p => p.code === formData.client_phone_prefix)?.icon} alt="flag" className="w-5 h-auto rounded-sm shadow-sm" />
                           <span>{formData.client_phone_prefix}</span>
                           <ChevronDown size={14} className="text-gray-400" />
                         </button>
                         {isPrefixOpen && (
                           <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden py-1">
                             {phonePrefixes.map(p => (
                               <button key={p.code} type="button" onClick={() => { setFormData({...formData, client_phone_prefix: p.code}); setIsPrefixOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors">
                                 <img src={p.icon} alt={p.country} className="w-5 h-auto rounded-sm shadow-sm" />
                                 <span className="text-sm font-bold text-gray-700">{p.code}</span>
                               </button>
                             ))}
                           </div>
                         )}
                        </div>
                        <input type="text" className="w-full p-3.5 outline-none rounded-r-xl bg-transparent" placeholder="44 123 456" value={formData.client_phone} onChange={(e) => setFormData({...formData, client_phone: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Mail size={16} className="text-gray-400" /> {t("businessEmailLabel")}</label>
                      <input type="email" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder={t("emailPlaceholder")} value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} />
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* HAPI 5: FINANCAT DHE SHËNIMET E REJA */}
        {currentStep === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("step5Title")}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              <div className="lg:col-span-3 space-y-6">
                
                {hallPrice > 0 && formData.billing_model === 'flat_rent' && (
                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-blue-900">Qiraja e Sallës ({selectedHall?.name})</p>
                      <p className="text-sm text-blue-700">Faturim fiks për hapësirën</p>
                    </div>
                    <p className="font-bold text-lg text-blue-900">{symbol} {hallPrice.toFixed(2)}</p>
                  </div>
                )}

                {totalMenuCost > 0 && formData.billing_model === 'per_person' && (
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{t("foodPriceLabel")} ({selectedMenu?.name})</p>
                      <p className="text-sm text-gray-500">{formData.participants} {t("invoicePersons")} x {symbol} {selectedMenu?.price_per_person}</p>
                    </div>
                    <p className="font-bold text-lg text-gray-900">{symbol} {totalMenuCost.toFixed(2)}</p>
                  </div>
                )}
                
                {formData.extras.length > 0 && (
                  <div className="bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-200 space-y-2">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("extrasPriceLabel")}</p>
                      <p className="text-sm font-black text-emerald-600">+{symbol} {extrasCost.toFixed(2)}</p>
                    </div>
                    {formData.extras.map((e: any) => (
                      <div key={e.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 italic">{e.name}</span>
                        <span className="font-bold">+{symbol} {Number(e.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* LOGJIKA E RIKTHYER E ZBRITJES NË PËRQINDJE (%) */}
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-200 text-amber-700 p-2 rounded-lg"><Percent size={20} /></div>
                    <p className="font-bold text-amber-900">Zbritje / Ulje (%)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" max="100" placeholder="0" className="w-24 text-right border border-amber-200 p-2.5 rounded-xl outline-none focus:border-amber-500 bg-white font-bold" value={formData.discount_percent} onChange={(e) => setFormData({...formData, discount_percent: e.target.value})} />
                    <span className="font-bold text-amber-700">%</span>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Wallet size={18}/> {t("paymentStatusLabel")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    <button onClick={() => setFormData({...formData, payment_status: 'pending'})} className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${formData.payment_status === 'pending' ? 'bg-white border-blue-500 text-blue-700 shadow-sm' : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{t("statusUnpaidBtn")}</button>
                    <button onClick={() => setFormData({...formData, payment_status: 'deposit'})} className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${formData.payment_status === 'deposit' ? 'bg-white border-amber-500 text-amber-600 shadow-sm' : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{t("statusDepositBtn")}</button>
                    <button onClick={() => setFormData({...formData, payment_status: 'paid'})} className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${formData.payment_status === 'paid' ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm' : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{t("statusPaidBtn")}</button>
                  </div>

                  {formData.payment_status === 'deposit' && (
                    <div className="mb-5 animate-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t("depositAmountLabel")} ({symbol})</label>
                      <input 
                        type="number" 
                        placeholder="p.sh. 500" 
                        className={`w-full border p-3.5 rounded-xl outline-none bg-white ${isDepositError ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-amber-500'}`} 
                        value={formData.deposit_amount} 
                        onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})} 
                      />
                      {isDepositError && (
                        <p className="text-red-500 text-xs font-bold mt-2">Vlera nuk mund të jetë më e madhe se totali!</p>
                      )}
                    </div>
                  )}

                  {(formData.payment_status === 'deposit' || formData.payment_status === 'paid') && (
                    <div className="animate-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t("paymentMethodLabel")}</label>
                      <select className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 bg-white font-medium text-gray-700" value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})}>
                        <option value="cash">{t("methodCash")}</option>
                        <option value="bank">{t("methodBank")}</option>
                        <option value="pos">{t("methodPos")}</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="bg-[#FFF8E6] p-6 rounded-3xl border border-[#FFE7B3]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#FFA000] text-white p-2 rounded-xl"><ShieldAlert size={20} /></div>
                    <h3 className="font-bold text-amber-900">{t("cancelPolicyTitle")}</h3>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {t("cancelPolicyMsg1")} <strong>{business?.cancel_penalty || 0}%</strong> {t("cancelPolicyMsg2")} <strong>{business?.cancel_days || 0} ditë</strong> {t("cancelPolicyMsg3")}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Shënimet e Stafit */}
                  <div className="border border-amber-200 bg-[#FFFDF5] rounded-2xl p-4 shadow-sm">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">
                      <FileText size={14} /> Shënime Operative (Stafi)
                    </label>
                    <textarea
                      className="w-full bg-white border border-amber-100 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-1 resize-none h-24"
                      placeholder="Psh: Klienti dëshiron tortë pa sheqer..."
                      value={formData.staff_notes}
                      onChange={(e) => setFormData({...formData, staff_notes: e.target.value})}
                    ></textarea>
                  </div>

                  {/* Shënimet e Adminit (Private) */}
                  <div className="border border-gray-200 bg-gray-50 rounded-2xl p-4 shadow-sm">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                      <Lock size={14} /> Shënime Sekrete (Admin)
                    </label>
                    <textarea
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-gray-400 focus:ring-1 resize-none h-24"
                      placeholder="Psh: Këtij i kemi bërë 20% ulje nga miqësia..."
                      value={formData.admin_notes}
                      onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
                    ></textarea>
                  </div>
                </div>

              </div>

              <div className="lg:col-span-2 bg-gray-900 text-white p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
                <div className="absolute -right-6 -top-6 text-white/5"><Banknote size={180} /></div>
                
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                  
                  {hallPrice > 0 && formData.billing_model === 'flat_rent' && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Qiraja</span>
                      <span className="text-gray-300 font-medium">{symbol} {hallPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {totalMenuCost > 0 && formData.billing_model === 'per_person' && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">{t("foodPriceLabel")}</span>
                      <span className="text-gray-300 font-medium">{symbol} {totalMenuCost.toFixed(2)}</span>
                    </div>
                  )}
                  {extrasCost > 0 && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">{t("invoiceExtraLabel")}</span>
                      <span className="text-gray-300 font-medium">+{symbol} {extrasCost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-4 mt-2 pt-2 border-t border-gray-700/50">
                    <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">{t("subtotalLabel")}</span>
                    <span className={`text-xl font-medium text-gray-300 ${discountAmount > 0 ? 'line-through opacity-50' : ''}`}>
                      {symbol} {subTotal.toFixed(2)}
                    </span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="animate-in fade-in slide-in-from-left-2 mb-4 flex justify-between items-center">
                      <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Zbritje ({formData.discount_percent}%)</span>
                      <span className="text-lg font-medium text-amber-400">- {symbol} {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 my-4"></div>
                  
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">{t("finalTotalLabel")}</p>
                  <p className="text-3xl sm:text-4xl font-black text-white mb-6 truncate" title={`${symbol} ${finalTotal.toFixed(2)}`}>
                    {symbol} {finalTotal.toFixed(2)}
                  </p>

                  {formData.payment_status === 'deposit' && depositValue > 0 && (
                    <div className="bg-black/30 p-4 rounded-xl animate-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">{t("paidDepositLabel")}</span>
                        <span className="font-bold text-amber-400">- {symbol} {depositValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                        <span className="text-sm font-bold text-gray-300">{t("leftToPayLabel")}</span>
                        <span className="font-black text-emerald-400 truncate max-w-[120px]" title={`${symbol} ${remainingBalance.toFixed(2)}`}>{symbol} {remainingBalance.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  {formData.payment_status === 'paid' && (
                    <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-xl text-center font-bold animate-in zoom-in-95">
                      {t("fullyPaidBadge")}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-100 flex items-center justify-between rounded-b-3xl">
        <button onClick={handlePrev} disabled={currentStep === 1 || loading} className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-0 cursor-default' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm'}`}>
          <ChevronLeft size={20} /> <span className="hidden sm:inline">{t("btnPrev")}</span>
        </button>

        {currentStep < 5 ? (
          <button onClick={handleNext} disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || loading} className={`flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-bold transition-all shadow-md ${(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
            {loading ? t("btnLoading") : t("btnNext")} <ChevronRight size={20} />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={async () => {
                setLoading(true);
                setToast({ show: false, message: "", type: "success", complete: false, bookingId: "", isQuotation: false });
                try {
                  const finalData = { 
                    ...formData, 
                    menu_id: formData.billing_model === 'flat_rent' ? null : formData.menu_id,
                    total_amount: finalTotal.toString(), 
                    discount_amount: discountPercent.toString(), 
                    is_quotation: true 
                  };
                  const res = await saveReservationAction(finalData);
                  if (res.error) {
                    setToast({ show: true, message: res.error, type: "error", complete: false, bookingId: "", isQuotation: false });
                  } else {
                    setToast({ show: true, message: "Oferta u ruajt me sukses! Data NUK është bllokuar.", type: "success", complete: true, bookingId: res.bookingId, isQuotation: true });
                  }
                } catch (error) {
                  setToast({ show: true, message: t("networkError"), type: "error", complete: false, bookingId: "", isQuotation: false });
                } finally {
                  setLoading(false);
                }
              }} 
              disabled={loading} 
              className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
            >
              <FileText size={18} className="hidden sm:block" /> Ruaj si Ofertë
            </button>

            <button 
              onClick={handleSubmit} 
              disabled={loading || isDepositError} 
              className={`flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-bold transition-all shadow-md ${isDepositError ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'}`}
            >
              {loading ? t("btnSaving") : "Konfirmo Rezervimin"} <Check size={20} className="hidden sm:block" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}