"use client";

import { checkAvailabilityAction, saveReservationAction } from "./actions";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, ChevronRight, ChevronLeft, CalendarDays, Utensils, Users, 
  Banknote, Building2, Clock, UsersRound, AlertTriangle, Sparkles, Percent,
  FileDigit, MapPin, Mail, Phone, ChevronDown, Wallet, FileText, User, Building, ShieldAlert, UserCheck
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReservationWizard({ business, halls, menus, extras, clients, locale }: any) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPrefixOpen, setIsPrefixOpen] = useState(false);
  const prefixRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success", complete: false });

  const [formData, setFormData] = useState({
    event_date: "", start_time: "", end_time: "", hall_id: "", participants: "",
    menu_id: "", 
    extras: [] as any[], 
    
    // Të dhënat e Klientit
    client_type: "individual",
    client_name: "", 
    client_personal_id: "", 
    client_gender: "", 
    client_business_name: "",
    client_business_num: "",
    client_representative: "", // <--- FUSHA E RE SHTUAR!
    client_address: "",
    client_city: "", 
    client_phone_prefix: "+383", 
    client_phone: "", 
    client_email: "",
    
    discount_percent: 0, 
    payment_status: "pending",
    payment_method: "cash",
    deposit_amount: ""
  });

  const steps = [
    { id: 1, name: "Koha & Salla", icon: CalendarDays },
    { id: 2, name: "Menuja", icon: Utensils },
    { id: 3, name: "Ekstra", icon: Sparkles },
    { id: 4, name: "Klienti", icon: Users },
    { id: 5, name: "Financat", icon: Banknote },
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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (formData.client_phone.length > 5) {
      const fullPhone = `${formData.client_phone_prefix} ${formData.client_phone.trim()}`;
      const existingClient = clients?.find((c: any) => c.phone.replace(/\s+/g, '') === fullPhone.replace(/\s+/g, ''));
      
      if (existingClient) {
        setFormData(prev => ({
          ...prev,
          client_type: existingClient.client_type || "individual",
          client_name: prev.client_name || existingClient.name,
          client_business_name: prev.client_business_name || (existingClient.client_type === 'business' ? existingClient.name : ""),
          client_email: prev.client_email || (existingClient.email || ""),
          client_city: prev.client_city || (existingClient.city || ""),
          client_address: prev.client_address || (existingClient.address || ""),
          client_business_num: prev.client_business_num || (existingClient.business_num || ""),
        }));
      }
    }
  }, [formData.client_phone, formData.client_phone_prefix, clients]);

  const toggleExtra = (extra: any) => {
    const isSelected = formData.extras.find((e: any) => e.id === extra.id);
    if (isSelected) {
      setFormData({ ...formData, extras: formData.extras.filter((e: any) => e.id !== extra.id) });
    } else {
      setFormData({ ...formData, extras: [...formData.extras, extra] });
    }
  };

  const isStep1Valid = formData.event_date && formData.start_time && formData.end_time && formData.participants && formData.hall_id;
  const isStep2Valid = formData.menu_id !== ""; 

  const selectedHall = halls?.find((h: any) => h.id === formData.hall_id);
  const isOverCapacity = selectedHall && Number(formData.participants) > selectedHall.capacity;
  
  const selectedMenu = menus?.find((m: any) => m.id === formData.menu_id);
  const totalMenuCost = selectedMenu ? (Number(formData.participants) * Number(selectedMenu.price_per_person)) : 0;
  
  const extrasCost = formData.extras.reduce((sum: number, item: any) => sum + Number(item.price), 0);
  
  const subTotal = totalMenuCost + extrasCost;
  const discountAmount = (subTotal * Number(formData.discount_percent || 0)) / 100;
  const finalTotal = subTotal - discountAmount;
  
  const depositValue = Number(formData.deposit_amount) || 0;
  const remainingBalance = formData.payment_status === 'paid' ? 0 : (finalTotal - depositValue);

  const handleNext = async () => {
    if (currentStep === 1 && !isStep1Valid) return;
    if (currentStep === 2 && !isStep2Valid) return;

    if (currentStep === 1) {
      setLoading(true);
      const check = await checkAvailabilityAction(
        formData.hall_id, formData.event_date, formData.start_time, formData.end_time
      );
      setLoading(false);

      if (!check.available) {
        setToast({ show: true, message: check.message || "Ky orar është i zënë.", type: "error", complete: false });
        return;
      }
    }
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleDownloadWizardPDF = () => {
    const doc = new jsPDF();
    // Tani fatura shfaq saktë emrin e biznesit dhe atij që e ka rezervuar!
    const billingName = formData.client_type === 'business' 
        ? `${formData.client_business_name} (${formData.client_representative})` 
        : formData.client_name;
    
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("FATURË / KONTRATË", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("Faturuar për:", 14, 34);
    
    doc.setFontSize(10);
    doc.text(`Klienti: ${billingName}`, 14, 40);
    doc.text(`Telefoni: ${formData.client_phone_prefix} ${formData.client_phone}`, 14, 46);
    doc.text(`Data e Eventit: ${formData.event_date}`, 14, 52);
    doc.text(`Salla: ${selectedHall?.name || "N/A"}`, 14, 58);
    doc.text(`Pjesëmarrës: ${formData.participants} persona`, 14, 64);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 72, 196, 72);

    const tableData = [];
    if (selectedMenu) {
      tableData.push([
        `Menu: ${selectedMenu.name}`,
        `${formData.participants} pax`,
        `${Number(selectedMenu.price_per_person).toFixed(2)} €`,
        `${totalMenuCost.toFixed(2)} €`
      ]);
    }
    formData.extras.forEach((ext: any) => {
       tableData.push([
         `Ekstra: ${ext.name}`, `1`, `${Number(ext.price).toFixed(2)} €`, `${Number(ext.price).toFixed(2)} €`
       ]);
    });

    autoTable(doc, {
      startY: 82,
      head: [['Përshkrimi', 'Sasia', 'Çmimi Njësi', 'Totali']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } }
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 100;
    
    if(formData.discount_percent > 0) {
      doc.setFontSize(11);
      doc.setTextColor(220, 38, 38);
      doc.text(`Zbritja (${formData.discount_percent}%):`, 120, finalY + 10);
      doc.text(`-${discountAmount.toFixed(2)} €`, 175, finalY + 10, { align: 'left' });
    }

    const totalY = formData.discount_percent > 0 ? finalY + 20 : finalY + 15;

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("TOTALI PËR PAGESË:", 120, totalY);
    
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(`${finalTotal.toFixed(2)} €`, 175, totalY, { align: 'left' });

    doc.save(`Fatura_${billingName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setToast({ show: false, message: "", type: "success", complete: false });

    try {
      const res = await saveReservationAction(formData);

      if (res.error) {
        setToast({ show: true, message: res.error, type: "error", complete: false });
        setLoading(false);
      } else {
        setToast({ show: true, message: "Rezervimi u ruajt me sukses! Çfarë dëshironi të bëni tani?", type: "success", complete: true });
        setLoading(false);
      }
    } catch (error) {
      setToast({ show: true, message: "Mungon interneti ose serveri nuk përgjigjet.", type: "error", complete: false });
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-[700px] relative">
      
       {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
            <div className={`relative mx-auto -mt-16 mb-6 w-24 h-24 rounded-full flex items-center justify-center border-8 border-white shadow-lg ${toast.type === "success" ? "bg-[#F0FDF4] text-emerald-500" : "bg-[#FFF9F2] text-[#E6931E]"}`}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M12 22a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2zm6-6v2H6v-2l2-2V9a4 4 0 0 1 4-4 4 4 0 0 1 4 4v5l2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? "Sukses!" : "Kujdes!"}
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">{toast.message}</p>
            
            {toast.complete ? (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDownloadWizardPDF} 
                  className="w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:bg-gray-800 hover:scale-[1.02]"
                >
                  <FileText size={20} /> Shkarko Faturën PDF
                </button>
                <button 
                  onClick={() => router.push(`/${locale}/biznes/rezervimet`)} 
                  className="w-full bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:bg-emerald-600 hover:scale-[1.02] shadow-emerald-200"
                >
                  Kthehu te Rezervimet <span className="text-xl">→</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setToast({ ...toast, show: false })} className={`w-full text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : "bg-[#FF5C39] hover:bg-[#e84e2d] shadow-orange-200"}`}>
                Mbyll <span className="text-xl">→</span>
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
        
        {/* HAPI 1 & 2 & 3 (Të paprekura, njësoj si më parë) */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detajet e Eventit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><CalendarDays size={16} className="text-gray-400" /> Data e Eventit</label>
                <input type="date" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><UsersRound size={16} className="text-gray-400" /> Numri i Pjesëmarrësve</label>
                <input type="number" placeholder="p.sh. 150" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.participants} onChange={(e) => setFormData({...formData, participants: e.target.value})} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Clock size={16} className="text-gray-400" /> Ora e Fillimit</label>
                <input type="time" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Clock size={16} className="text-gray-400" /> Ora e Përfundimit</label>
                <input type="time" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
              </div>
            </div>

            <hr className="border-gray-100 mb-8" />

            <h3 className="text-lg font-bold text-gray-900 mb-4">Zgjidhni Sallën</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {halls?.length > 0 ? halls.map((hall: any) => (
                <div key={hall.id} onClick={() => setFormData({...formData, hall_id: hall.id})} className={`cursor-pointer rounded-2xl border-2 p-4 transition-all relative overflow-hidden group ${formData.hall_id === hall.id ? 'border-gray-900 bg-gray-50/50 shadow-md' : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'}`}>
                  {hall.image && <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: `url(${hall.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
                  <div className="relative z-10 flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${formData.hall_id === hall.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}><Building2 size={24} /></div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{hall.name}</h4>
                      <p className="text-sm text-gray-500 font-medium">Kapaciteti: <span className="text-gray-900">{hall.capacity}</span></p>
                    </div>
                  </div>
                  {formData.hall_id === hall.id && <div className="absolute top-4 right-4 text-gray-900"><Check size={20} strokeWidth={3} /></div>}
                </div>
              )) : (<p className="text-gray-500 text-sm">Nuk keni shtuar asnjë sallë.</p>)}
            </div>

            {isOverCapacity && (
              <div className="mt-6 bg-[#FFF9F2] border border-[#E6931E]/30 text-[#E6931E] p-4 rounded-xl flex items-start gap-4">
                <AlertTriangle size={24} className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Kujdes me Kapacitetin!</h4>
                  <p className="text-sm opacity-90 mt-1">
                    Keni shënuar <strong>{formData.participants}</strong> pjesëmarrës, por salla mban vetëm <strong>{selectedHall.capacity}</strong>. <br/>
                    <em>*Mund të vazhdoni, por sigurohuni për hapësirën.</em>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Përzgjedhja e Menusë</h2>
            <p className="text-gray-500 mb-8 font-medium">Zgjidhni pakon për <span className="text-gray-900 font-bold bg-gray-100 px-2 py-0.5 rounded">{formData.participants} pjesëmarrës</span>.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menus?.length > 0 ? menus.map((menu: any) => (
                <div key={menu.id} onClick={() => setFormData({...formData, menu_id: menu.id})} className={`cursor-pointer rounded-2xl border-2 transition-all relative overflow-hidden group flex flex-col ${formData.menu_id === menu.id ? 'border-gray-900 bg-gray-50/50 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-gray-300'}`}>
                  <div className="h-40 bg-gray-100 relative border-b border-gray-100 shrink-0">
                    {menu.image ? <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Utensils size={32} /></div>}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                      <span className="text-sm font-black text-gray-900">{Number(menu.price_per_person).toFixed(2)} €</span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold ml-1">/ person</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col relative bg-white">
                    <h4 className="font-bold text-gray-900 text-lg mb-3 pr-8">{menu.name}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line pb-6">{menu.description || "Nuk ka përshkrim."}</p>
                    {formData.menu_id === menu.id && <div className="absolute bottom-5 right-5 text-gray-900 bg-white rounded-full shadow-sm"><Check size={22} strokeWidth={3} /></div>}
                  </div>
                </div>
              )) : (<p className="text-gray-500 text-sm">Nuk keni shtuar menu.</p>)}
            </div>

            {formData.menu_id && selectedMenu && (
              <div className="mt-8 bg-gray-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between shadow-xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
                  <div className="bg-white/20 p-4 rounded-full shrink-0"><Banknote size={28} className="text-emerald-400" /></div>
                  <div>
                    <p className="text-gray-300 text-sm font-medium mb-1">Përllogaritja e Ushqimit</p>
                    <p className="text-white font-bold text-lg">{formData.participants} persona <span className="text-gray-400 mx-2">x</span> {Number(selectedMenu.price_per_person).toFixed(2)} €</p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto border-t border-gray-700 sm:border-0 pt-4 sm:pt-0 overflow-hidden">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Totali i Menusë</p>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400 truncate">{totalMenuCost.toFixed(2)} €</p>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shërbime Ekstra (Opsionale)</h2>
            <p className="text-gray-500 mb-8 font-medium">Shtoni shërbime shtesë për këtë event.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {extras && extras.length > 0 ? (
                extras.map((extra: any) => {
                  const isSelected = formData.extras.some((e: any) => e.id === extra.id);
                  return (
                    <div 
                      key={extra.id} 
                      onClick={() => toggleExtra(extra)}
                      className={`cursor-pointer rounded-2xl border-2 p-5 transition-all flex items-center justify-between group ${
                        isSelected ? 'border-gray-900 bg-gray-50 shadow-md' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'}`}>
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{extra.name}</h4>
                          <p className="text-emerald-600 font-bold text-sm">+{Number(extra.price).toFixed(2)} €</p>
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
                  <p className="text-gray-500 font-medium">Nuk keni asnjë shërbim ekstra të regjistruar.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HAPI 4: KLIENTI (Ndarja fizike e plotë) */}
        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Të dhënat e Klientit</h2>
            
            <div className="flex p-1 bg-gray-100 rounded-2xl w-full sm:w-72 mb-8">
              <button 
                type="button" 
                onClick={() => setFormData({
                  ...formData, client_type: 'individual',
                  client_name: '', client_personal_id: '', client_phone: '', client_email: '', client_city: ''
                })}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.client_type === 'individual' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <User size={16} /> Individ
              </button>
              <button 
                type="button" 
                onClick={() => setFormData({
                  ...formData, client_type: 'business',
                  client_business_name: '', client_business_num: '', client_representative: '', client_address: '', client_phone: '', client_email: '', client_city: ''
                })}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.client_type === 'business' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Building size={16} /> Biznes
              </button>
            </div>

            <div className="bg-gray-50/50 p-6 md:p-8 rounded-3xl border border-gray-100">
                
                {/* BLOKU I INDIVIDIT */}
                {formData.client_type === 'individual' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Users size={16} className="text-gray-400" /> Emri dhe Mbiemri</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder="p.sh. Agim Ramadani" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><FileDigit size={16} className="text-gray-400" /> Numri Personal (ID)</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder="p.sh. 1234567890" value={formData.client_personal_id} onChange={(e) => setFormData({...formData, client_personal_id: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Gjinia</label>
                      <select className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" value={formData.client_gender} onChange={(e) => setFormData({...formData, client_gender: e.target.value})}>
                        <option value="">Zgjidh Gjininë</option>
                        <option value="M">Mashkull</option>
                        <option value="F">Femër</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><MapPin size={16} className="text-gray-400" /> Qyteti</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder="p.sh. Prishtinë" value={formData.client_city} onChange={(e) => setFormData({...formData, client_city: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Phone size={16} className="text-gray-400" /> Telefoni</label>
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
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Mail size={16} className="text-gray-400" /> Email</label>
                      <input type="email" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder="p.sh. email@shembull.com" value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} />
                    </div>
                  </div>
                )}

                {/* BLOKU I BIZNESIT */}
                {formData.client_type === 'business' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Building size={16} className="text-gray-400" /> Emri i Biznesit</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder="p.sh. Flow Events L.L.C." value={formData.client_business_name} onChange={(e) => setFormData({...formData, client_business_name: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><FileDigit size={16} className="text-gray-400" /> NUI (Numri Unik)</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder="812345678" value={formData.client_business_num} onChange={(e) => setFormData({...formData, client_business_num: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><UserCheck size={16} className="text-gray-400" /> Përfaqësuesi (Kush e bën rezervimin)</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder="p.sh. Agim Ramadani" value={formData.client_representative} onChange={(e) => setFormData({...formData, client_representative: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><MapPin size={16} className="text-gray-400" /> Adresa e Biznesit</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder="Rruga Nëna Terezë, Nr. 15" value={formData.client_address} onChange={(e) => setFormData({...formData, client_address: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><MapPin size={16} className="text-gray-400" /> Qyteti</label>
                      <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder="p.sh. Prishtinë" value={formData.client_city} onChange={(e) => setFormData({...formData, client_city: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Phone size={16} className="text-gray-400" /> Telefoni i Kontaktit</label>
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
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Mail size={16} className="text-gray-400" /> Email i Biznesit</label>
                      <input type="email" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white" placeholder="p.sh. email@shembull.com" value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} />
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* HAPI 5: FINANCAT (E paprekur, saktë siç ishte) */}
        {currentStep === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financat dhe Pagesa</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Ushqimi ({selectedMenu?.name})</p>
                    <p className="text-sm text-gray-500">{formData.participants} persona x {selectedMenu?.price_per_person} €</p>
                  </div>
                  <p className="font-bold text-lg text-gray-900">{totalMenuCost.toFixed(2)} €</p>
                </div>
                
                {formData.extras.length > 0 && (
                  <div className="bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-200 space-y-2">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shërbimet Ekstra</p>
                      <p className="text-sm font-black text-emerald-600">+{extrasCost.toFixed(2)} €</p>
                    </div>
                    {formData.extras.map((e: any) => (
                      <div key={e.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 italic">{e.name}</span>
                        <span className="font-bold">+{Number(e.price).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-200 text-amber-700 p-2 rounded-lg"><Percent size={20} /></div>
                    <p className="font-bold text-amber-900">Aplikoni Zbritje (%)</p>
                  </div>
                  <input type="number" min="0" max="100" placeholder="0" className="w-24 text-right border border-amber-200 p-2.5 rounded-xl outline-none focus:border-amber-500 bg-white font-bold" value={formData.discount_percent} onChange={(e) => setFormData({...formData, discount_percent: Number(e.target.value)})} />
                </div>

                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Wallet size={18}/> Statusi i Pagesës</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    <button onClick={() => setFormData({...formData, payment_status: 'pending'})} className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${formData.payment_status === 'pending' ? 'bg-white border-blue-500 text-blue-700 shadow-sm' : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>E Papaguar</button>
                    <button onClick={() => setFormData({...formData, payment_status: 'deposit'})} className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${formData.payment_status === 'deposit' ? 'bg-white border-amber-500 text-amber-600 shadow-sm' : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Paradhënie</button>
                    <button onClick={() => setFormData({...formData, payment_status: 'paid'})} className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${formData.payment_status === 'paid' ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm' : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>E Paguar</button>
                  </div>

                  {formData.payment_status === 'deposit' && (
                    <div className="mb-5 animate-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Shuma e Paradhënies (€)</label>
                      <input type="number" placeholder="p.sh. 500" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-amber-500 bg-white" value={formData.deposit_amount} onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})} />
                    </div>
                  )}

                  {(formData.payment_status === 'deposit' || formData.payment_status === 'paid') && (
                    <div className="animate-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mënyra e Pagesës</label>
                      <select className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 bg-white font-medium text-gray-700" value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})}>
                        <option value="cash">Para në dorë (Cash)</option>
                        <option value="bank">Transfertë Bankare</option>
                        <option value="pos">KARTË (POS)</option>
                      </select>
                    </div>
                  )}
                </div>
                
                {/* POLITIKA E ANULIMIT */}
                <div className="bg-[#FFF8E6] p-6 rounded-3xl border border-[#FFE7B3]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#FFA000] text-white p-2 rounded-xl"><ShieldAlert size={20} /></div>
                    <h3 className="font-bold text-amber-900">Politika e Anulimit</h3>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Në rast anulimi të këtij rezervimi, sipas rregullave të biznesit tuaj ndalet <strong>{business?.cancel_penalty || 0}%</strong> e shumës totale. 
                    Afati i fundit për anulim pa penalizim është <strong>{business?.cancel_days || 0} ditë</strong> para datës së eventit.
                  </p>
                </div>

              </div>

              {/* Totali Final Card */}
              <div className="lg:col-span-2 bg-gray-900 text-white p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
                <div className="absolute -right-6 -top-6 text-white/5"><Banknote size={180} /></div>
                
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                  
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Ushqimi</span>
                    <span className="text-gray-300 font-medium">{totalMenuCost.toFixed(2)} €</span>
                  </div>
                  {extrasCost > 0 && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Ekstra</span>
                      <span className="text-gray-300 font-medium">+{extrasCost.toFixed(2)} €</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-4 mt-2 pt-2 border-t border-gray-700/50">
                    <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Nëntotali</span>
                    <span className={`text-xl font-medium text-gray-300 ${formData.discount_percent > 0 ? 'line-through' : ''}`}>
                      {subTotal.toFixed(2)} €
                    </span>
                  </div>
                  
                  {formData.discount_percent > 0 && (
                    <div className="animate-in fade-in slide-in-from-left-2 mb-4 flex justify-between items-center">
                      <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Zbritja ({formData.discount_percent}%)</span>
                      <span className="text-lg font-medium text-amber-400">- {discountAmount.toFixed(2)} €</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 my-4"></div>
                  
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Totali Final</p>
                  <p className="text-3xl sm:text-4xl font-black text-white mb-6 truncate" title={`${finalTotal.toFixed(2)} €`}>
                    {finalTotal.toFixed(2)} €
                  </p>

                  {formData.payment_status === 'deposit' && depositValue > 0 && (
                    <div className="bg-black/30 p-4 rounded-xl animate-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Paradhënie e paguar:</span>
                        <span className="font-bold text-amber-400">- {depositValue.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                        <span className="text-sm font-bold text-gray-300">Mbetja për t'u paguar:</span>
                        <span className="font-black text-emerald-400 truncate max-w-[120px]" title={`${remainingBalance.toFixed(2)} €`}>{remainingBalance.toFixed(2)} €</span>
                      </div>
                    </div>
                  )}
                  
                  {formData.payment_status === 'paid' && (
                    <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-xl text-center font-bold animate-in zoom-in-95">
                      E Paguar Plotësisht ✓
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
          <ChevronLeft size={20} /> <span className="hidden sm:inline">Kthehu</span>
        </button>

        {currentStep < 5 ? (
          <button onClick={handleNext} disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || loading} className={`flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-bold transition-all shadow-md ${(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
            {loading ? "Prisni..." : "Vazhdo"} <ChevronRight size={20} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 sm:px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-emerald-200">
            {loading ? "Po Ruhet..." : "Ruaj Rezervimin"} <Check size={20} className="hidden sm:block" />
          </button>
        )}
      </div>

    </div>
  );
}