"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarDays, Users, Banknote, 
  ArrowLeft, Save, User, CheckCircle2, AlertTriangle, Sparkles, Building2, XCircle, ArrowRightLeft, Clock4, Info, Utensils, Receipt
} from "lucide-react";
import Link from "next/link";
import { getBookingAction, updateBookingAction } from "./actions";
import { format } from "date-fns";

export default function EditBookingPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Sensori që mbron çmimin origjinal derisa përdoruesi të bëjë një ndryshim
  const [isModified, setIsModified] = useState(false);

  const [hallsList, setHallsList] = useState<any[]>([]);
  const [menusList, setMenusList] = useState<any[]>([]);
  const [availableExtras, setAvailableExtras] = useState<any[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
  
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [auditLog, setAuditLog] = useState<any>({ created_at: null, updated_at: null });
  const [historicallyPaid, setHistoricallyPaid] = useState<number>(0);

  const [formData, setFormData] = useState({
    client_name: "",
    hall_id: "",
    menu_id: "",
    event_date: "",
    start_time: "",
    end_time: "",
    participants: "",
    total_amount: "0",
    status: "confirmed",
    cancel_reason: "",
    new_payment_amount: "",
    payment_method: "cash"
  });

  const formatTimeForInput = (dateObj: any) => {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  useEffect(() => {
    async function loadData() {
      const data = await getBookingAction(id);
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

        const totalPaid = data.booking.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
        setHistoricallyPaid(totalPaid);

        setFormData({
          client_name: data.booking.clients?.name || "Klient i panjohur",
          hall_id: data.booking.hall_id || "",
          menu_id: (data.booking as any).menu_id || "", 
          event_date: data.booking.event_date ? new Date(data.booking.event_date).toISOString().split('T')[0] : "",
          start_time: formatTimeForInput(data.booking.start_time),
          end_time: formatTimeForInput(data.booking.end_time),
          participants: data.booking.participants?.toString() || "",
          total_amount: data.booking.total_amount?.toString() || "0",
          status: data.booking.status || "confirmed",
          cancel_reason: data.booking.cancel_reason || "",
          new_payment_amount: "",
          payment_method: "cash"
        });
      } else {
        setToast({ show: true, message: "Rezervimi nuk u gjet!", type: "error" });
      }
      setFetching(false);
    }
    loadData();
  }, [id]);

  // LLOGARITJA LIVE (Automatike sapo ndryshon një vlerë)
  useEffect(() => {
    if (fetching || !isModified) return;

    const selectedMenu = menusList.find((m: any) => m.id === formData.menu_id);
    const menuPrice = selectedMenu ? Number(selectedMenu.price_per_person) : 0;
    
    const selectedHall = hallsList.find((h: any) => h.id === formData.hall_id);
    const hallPrice = selectedHall?.price ? Number(selectedHall.price) : 0;

    const pax = Number(formData.participants) || 0;
    const extrasTotal = selectedExtras.reduce((sum: number, ext: any) => sum + Number(ext.price), 0);

    const calculatedTotal = (pax * menuPrice) + extrasTotal + hallPrice;
    setFormData(prev => ({ ...prev, total_amount: calculatedTotal.toFixed(2) }));
  }, [formData.participants, formData.menu_id, formData.hall_id, selectedExtras, isModified]);

  // Funksionet që njoftojnë sistemin se po bëjmë ndryshime manuale
  const handleParticipantChange = (e: any) => {
    setFormData({...formData, participants: e.target.value});
    setIsModified(true);
  };
  const handleMenuChange = (e: any) => {
    setFormData({...formData, menu_id: e.target.value});
    setIsModified(true);
  };
  const handleHallChange = (e: any) => {
    setFormData({...formData, hall_id: e.target.value});
    setIsModified(true);
  };
  
  const toggleExtra = (extra: any) => {
    setIsModified(true);
    const exists = selectedExtras.find((e: any) => e.id === extra.id);
    if (exists) {
      setSelectedExtras(selectedExtras.filter((e: any) => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
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
    const penaltyValue = (totalAmount * penalty) / 100;
    const refundValue = Math.max(0, historicallyPaid - penaltyValue);
    const clientOwes = Math.max(0, penaltyValue - historicallyPaid);

    if (penalty === 0) return null;

    if (diffDays <= limitDays) {
      return (
        <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl text-red-800 text-sm">
          <div className="flex gap-3 mb-4">
            <AlertTriangle size={20} className="text-red-500 shrink-0" />
            <div>
              <strong className="text-red-600 block text-base font-semibold">Penalizimi Aplikohet!</strong>
              <p className="text-red-500/90 font-medium">Anulimi {diffDays} ditë para kalon afatin prej {limitDays} ditësh. Biznesi ndal <strong>{penalty}%</strong> ({penaltyValue.toFixed(2)} €).</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-red-100 grid grid-cols-2 gap-4 text-center shadow-sm">
             <div>
               <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-medium">Klienti ka paguar</p>
               <strong className="text-lg text-gray-900 font-semibold">{historicallyPaid.toFixed(2)} €</strong>
             </div>
             <div>
               <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-medium">{refundValue > 0 ? "Për t'i kthyer" : "Klienti detyrohet"}</p>
               <strong className={`text-lg font-semibold ${refundValue > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{refundValue > 0 ? refundValue.toFixed(2) : clientOwes.toFixed(2)} €</strong>
             </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl text-emerald-800 text-sm flex gap-3">
          <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
          <div>
            <strong className="text-emerald-600 block text-base font-semibold">Jashtë Rrezikut</strong>
            <p className="font-medium text-emerald-600/80">U anulua brenda afatit. Asnjë penalizim nuk aplikohet. <br/> {historicallyPaid > 0 && <span className="text-emerald-600 font-semibold">Duhet t'i kthehen: {historicallyPaid.toFixed(2)} € (E plotë)</span>}</p>
          </div>
        </div>
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    const dataToSubmit = { ...formData, selectedExtras, historically_paid: historicallyPaid };
    if (dataToSubmit.status !== 'cancelled') dataToSubmit.cancel_reason = "";

    try {
      const res = await updateBookingAction(id, dataToSubmit);
      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: "Rezervimi u përditësua me sukses!", type: "success" });
        setTimeout(() => { router.push(`/${locale}/biznes/rezervimet`); }, 1500);
      }
    } catch (error) {
      setToast({ show: true, message: "Mungon interneti.", type: "error" });
      setLoading(false);
    }
  };

  const currentTotal = Number(formData.total_amount) || 0;
  const remainingToPay = Math.max(0, currentTotal - historicallyPaid);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 relative min-h-[80vh]">
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 z-50">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95">
             <h3 className="text-xl font-semibold text-gray-900 mb-2">{toast.type === "success" ? "Sukses!" : "Kujdes!"}</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium">{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className={`w-full text-white font-semibold py-4 px-6 rounded-2xl ${toast.type === "success" ? "bg-emerald-500" : "bg-[#FF5C39]"}`}>Mbyll</button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <Link href={`/${locale}/biznes/rezervimet`} className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-gray-700 mb-2 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Kthehu te Rezervimet
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">Ndrysho Rezervimin</h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">Përditëso të dhënat, ekstrat apo menaxho pagesat e këtij klienti.</p>
      </div>

      <form onSubmit={handleSubmit} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* RRESHTI 1: VETËM KLIENTI (E plotë) */}
        <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100">
           <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"><User size={14} /> Klienti / Rezervuesi</label>
           <div className="p-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 w-full">{formData.client_name}</div>
        </div>

        {/* RRESHTI 2: SALLA, MENU, PJESËMARRËS (Grid 3 për Tablet/Desktop) */}
        <div className="p-6 md:p-8 border-b border-gray-100">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Salla e Eventit</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select className="w-full border border-gray-200 p-3.5 pl-10 rounded-xl outline-none focus:border-gray-400 font-medium bg-white text-gray-700" value={formData.hall_id} onChange={handleHallChange}>
                    <option value="">Zgjidh Sallën</option>
                    {hallsList.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Menuja e Zgjedhur</label>
                <div className="relative">
                  <Utensils size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select className="w-full border border-gray-200 p-3.5 pl-10 rounded-xl outline-none focus:border-gray-400 font-medium bg-white text-gray-700" value={formData.menu_id} onChange={handleMenuChange}>
                    <option value="">Nuk ka Menu</option>
                    {menusList.map((m: any) => <option key={m.id} value={m.id}>{m.name} - {m.price_per_person}€</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Pjesëmarrës</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" required placeholder="p.sh. 150" className="w-full border border-gray-200 p-3.5 pl-10 rounded-xl outline-none focus:border-gray-400 text-gray-700 font-medium" value={formData.participants} onChange={handleParticipantChange} />
                </div>
              </div>
           </div>
        </div>

        {/* RRESHTI 3: DATA DHE ORA */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Data e Eventit</label>
              <input type="date" required className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-400 text-gray-700 font-medium" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Ora (Fillon - Mbaron)</label>
              <div className="flex items-center gap-2">
                <input type="time" required className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-400 text-gray-700 font-medium" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                <span className="text-gray-300">-</span>
                <input type="time" required className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-400 text-gray-700 font-medium" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* EKSTRAT */}
        <div className="p-6 md:p-8 border-b border-gray-100 space-y-4 bg-purple-50/20">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Sparkles size={16} className="text-purple-400"/> Shërbimet Ekstra</h3>
          <div className="flex flex-wrap gap-3">
            {availableExtras.map((extra: any) => {
              const isSelected = selectedExtras.some((e: any) => e.id === extra.id);
              return (
                <button key={extra.id} type="button" onClick={() => toggleExtra(extra)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${isSelected ? 'border-purple-300 bg-purple-50 shadow-sm' : 'border-gray-200 bg-white hover:border-purple-200'}`}>
                   <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300'}`}>
                     {isSelected && <CheckCircle2 size={10} strokeWidth={4} />}
                   </div>
                   <span className={`text-sm font-medium ${isSelected ? 'text-purple-800' : 'text-gray-600'}`}>{extra.name} <span className="text-purple-400/80">+{Number(extra.price)}€</span></span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FINANCAT */}
        <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6"><Receipt size={20} className="text-emerald-500"/> Paneli Financiar</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Totali i Faturës (€)</label>
                <input type="number" step="0.01" className="w-full border border-gray-300 p-4 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-800 bg-white shadow-sm text-lg" value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: e.target.value})} />
                <p className="text-xs text-gray-400 mt-2 font-medium">*Llogaritet automatikisht, por mund të editohet manualisht për t'i bërë zbritje.</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-gray-500">Ka paguar deri tani:</span>
                   <span className="text-base font-semibold text-emerald-600">{historicallyPaid.toFixed(2)} €</span>
                 </div>
                 <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                   <span className="text-sm font-medium text-gray-500">Mbetja për t'u paguar:</span>
                   <span className="text-lg font-semibold text-red-500">{remainingToPay > 0 ? remainingToPay.toFixed(2) : "0.00"} €</span>
                 </div>
              </div>
            </div>

            <div>
              {remainingToPay > 0 ? (
                 <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm h-full">
                    <label className="flex items-center gap-2 text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4"><Banknote size={16}/> Shto Pagesë Sot (Opsionale)</label>
                    <p className="text-sm text-gray-500 mb-4 font-medium">Shënoni shumën nëse klienti po bën një pagesë në këtë moment.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">€</span>
                        <input type="number" step="0.01" placeholder="Shuma..." className="w-full border border-gray-300 p-3.5 pl-8 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-800 bg-gray-50" value={formData.new_payment_amount} onChange={(e) => setFormData({...formData, new_payment_amount: e.target.value})} />
                      </div>
                      <select className="border border-gray-300 p-3.5 rounded-xl outline-none bg-gray-50 text-sm font-semibold text-gray-600" value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})}>
                        <option value="cash">Në dorë (Cash)</option>
                        <option value="bank">Banka</option>
                        <option value="pos">Karta (POS)</option>
                      </select>
                    </div>
                 </div>
               ) : (
                 <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 h-full flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="font-semibold text-emerald-700 mb-1">E Paguar Plotësisht</h4>
                    <p className="text-sm text-emerald-600/80 font-medium">Nuk ka mbetje për këtë faturë.</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* STATUSI I EVENTIT */}
        <div className="p-6 md:p-8 bg-gray-50 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Gjendja Përfundimtare e Eventit</label>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setFormData({...formData, status: 'confirmed'})} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'confirmed' ? 'border-emerald-500 bg-emerald-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <CheckCircle2 size={18}/> Konfirmuar
              </button>
              <button type="button" onClick={() => setFormData({...formData, status: 'pending'})} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'pending' ? 'border-amber-500 bg-amber-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <Clock4 size={18}/> Në Pritje
              </button>
              <button type="button" onClick={() => setFormData({...formData, status: 'postponed'})} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'postponed' ? 'border-blue-500 bg-blue-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <ArrowRightLeft size={18}/> E Shtyer
              </button>
              <button type="button" onClick={() => setFormData({...formData, status: 'cancelled'})} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all border ${formData.status === 'cancelled' ? 'border-red-500 bg-red-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <XCircle size={18}/> E Anuluar
              </button>
            </div>
          </div>

          {formData.status === 'cancelled' && (
            <div className="w-full animate-in slide-in-from-top-2 fade-in space-y-4 pt-4 border-t border-gray-200">
              {renderCancellationPolicy()}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Arsyeja e Anulimit (E detyrueshme)</label>
                <input type="text" required placeholder="p.sh. Ndryshim planesh nga klienti..." className="w-full bg-white border border-gray-300 p-4 rounded-xl outline-none focus:border-red-400 text-gray-700 font-medium transition-colors" value={formData.cancel_reason} onChange={(e) => setFormData({...formData, cancel_reason: e.target.value})} />
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-gray-400 text-xs font-medium space-y-1">
               <p>Regjistruar: <span className="text-gray-600 font-semibold">{auditLog.created_at ? format(new Date(auditLog.created_at), 'dd.MM.yyyy HH:mm') : '...'}</span> nga {businessInfo?.name}</p>
               {auditLog.updated_at && new Date(auditLog.updated_at).getTime() - new Date(auditLog.created_at).getTime() > 60000 && (
                 <p>Ndryshuar: <span className="text-blue-500 font-semibold">{format(new Date(auditLog.updated_at), 'dd.MM.yyyy HH:mm')}</span> nga {businessInfo?.name}</p>
               )}
            </div>

            <button type="submit" disabled={loading || fetching} className="w-full md:w-auto bg-gray-900 text-white font-semibold py-4 px-12 rounded-xl hover:bg-black disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-md">
              <Save size={20} /> {loading ? "Po Ruhet..." : "Ruaj Ndryshimet"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}