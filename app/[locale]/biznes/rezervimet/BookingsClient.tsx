"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // <-- Shtuam useSearchParams
import Link from "next/link";
import { 
  Plus, Search, Calendar as CalendarIcon, Clock, MapPin, 
  Eye, Edit, User, CheckCircle2, ArrowRightLeft, XCircle, FileText, X, 
  Utensils, Sparkles, CreditCard, Phone, Users, PartyPopper, Wallet, CreditCard as CardIcon, Banknote, Building, Save, Lock, Undo2
} from "lucide-react";
import { useTranslations } from "next-intl"; 
import { addPaymentAction, updateNotesAction } from "./actions";

export default function BookingsClient({ business, locale }: { business: any, locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams(); // <-- Inicializuam lexuesin e linkut
  const rawBookings = business?.bookings || [];
  
  const t = useTranslations("BookingsClient"); 

  const [isMounted, setIsMounted] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [financeFilter, setFinanceFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [dayModal, setDayModal] = useState<{isOpen: boolean, date: number | null, bookings: any[]}>({isOpen: false, date: null, bookings: []});

  // STATET PËR SHËNIMET
  const [staffNotes, setStaffNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // STATET PËR MODALIN E PAGESËS SË MBETUR
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; booking: any | null }>({ isOpen: false, booking: null });
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // ========================================================
    // LOGJIKA E LEXIMIT TË FILTRAVE NGA URL (DASHBOARD-I)
    // ========================================================
    const filterParam = searchParams.get('filter');
    
    if (filterParam === 'pending') {
      setStatusFilter('pending');
    } else if (filterParam === 'debt') {
      setFinanceFilter('debt'); 
    } else if (filterParam === 'this_month') {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      setFromDate(firstDay);
      setToDate(lastDay);
    }
    // ========================================================

  }, [searchParams]);

  const currencySymbols: Record<string, string> = {
    "EUR": "€", "USD": "$", "GBP": "£", "CHF": "CHF", "ALL": "L", "MKD": "ден"
  };
  const symbol = business?.currency ? (currencySymbols[business.currency] || business.currency) : "€";

  // LLOGARITJA E ZBRITJES PËR MODALIN "SHIKO"
  let modalSubTotal = 0;
  let modalDiscount = 0;
  let modalDiscountPercent = 0;
  let modalRefunded = 0;

  if (selectedBooking) {
    const dbMenuPrice = selectedBooking.menus?.price_per_person ? Number(selectedBooking.menus.price_per_person) : 0;
    const dbPax = Number(selectedBooking.participants) || 0;
    const dbHallPrice = selectedBooking.halls?.price ? Number(selectedBooking.halls.price) : 0;
    const dbExtrasPrice = selectedBooking.booking_extras?.reduce((sum: number, be: any) => sum + Number(be.line_total), 0) || 0;
    
    modalSubTotal = (dbPax * dbMenuPrice) + dbHallPrice + dbExtrasPrice;
    const finalTotal = selectedBooking.calc_total || 0;
    
    if (modalSubTotal > finalTotal + 0.01) { 
      modalDiscount = modalSubTotal - finalTotal;
      modalDiscountPercent = Math.round((modalDiscount / modalSubTotal) * 100);
    }

    modalRefunded = selectedBooking.payments?.filter((p: any) => p.type === 'refund').reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  }

  if (!isMounted) return null; 

  const inComing = rawBookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed').length;
  const completed = rawBookings.filter((b: any) => b.status === 'completed').length;
  const postponed = rawBookings.filter((b: any) => b.status === 'postponed').length;
  const cancelled = rawBookings.filter((b: any) => b.status === 'cancelled').length;

  let filteredBookings = [...rawBookings];

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredBookings = filteredBookings.filter(b => 
      b.clients?.name?.toLowerCase().includes(term) ||
      b.halls?.name?.toLowerCase().includes(term) ||
      b.event_type?.toLowerCase().includes(term)
    );
  }

  if (fromDate) {
    filteredBookings = filteredBookings.filter(b => new Date(b.event_date) >= new Date(fromDate));
  }
  if (toDate) {
    filteredBookings = filteredBookings.filter(b => new Date(b.event_date) <= new Date(toDate));
  }

  if (statusFilter !== "all") {
    filteredBookings = filteredBookings.filter(b => b.status === statusFilter);
  }

  // RREGULLIMI MATEMATIK PËR PAGESA
  filteredBookings = filteredBookings.map(b => {
    const total = Number(b.total_amount) || 0;
    let paid = 0;
    let refunded = 0;

    b.payments?.forEach((p: any) => {
      if (p.type === 'refund') {
        paid -= Number(p.amount); 
        refunded += Number(p.amount); 
      } else {
        paid += Number(p.amount); 
      }
    });

    const left = Math.max(0, total - paid);
    return { ...b, calc_total: total, calc_paid: paid, calc_left: left, calc_refunded: refunded };
  });

  if (financeFilter !== "all") {
    filteredBookings = filteredBookings.filter(b => {
      if (financeFilter === "paid") return b.calc_paid >= b.calc_total && b.calc_total > 0;
      if (financeFilter === "unpaid") return b.calc_paid === 0;
      if (financeFilter === "partial") return b.calc_paid > 0 && b.calc_paid < b.calc_total;
      // Shtuar filtri i ri për Borxhet (Nga Dashboardi)
      if (financeFilter === "debt") return b.calc_left > 0 && b.status !== 'cancelled';
      return true;
    });
  }

  filteredBookings.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const handleSavePayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    setIsSubmitting(true);
    
    try {
      const res = await addPaymentAction({
        booking_id: paymentModal.booking.id,
        amount: Number(paymentAmount),
        method: paymentMethod,
        type: 'payment' 
      });

      if (!res.error) {
        setPaymentModal({ isOpen: false, booking: null });
        router.refresh(); 
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert("Pati një problem me lidhjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await updateNotesAction({
        booking_id: selectedBooking.id,
        staff_notes: staffNotes,
        admin_notes: adminNotes
      });
      if (res.error) {
        alert(res.error);
      } else {
        const updatedBooking = { ...selectedBooking, staff_notes: staffNotes, admin_notes: adminNotes };
        setSelectedBooking(updatedBooking);
      }
    } finally {
      setIsSavingNotes(false);
    }
  };

  const formatDateSafe = (dateStr: string) => {
    if (!dateStr) return '...';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB').replace(/\//g, '.');
    } catch (e) {
      return '...';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 bg-white min-h-screen">
      
      {/* MODALI I PAGESËS SË MBETUR */}
      {paymentModal.isOpen && paymentModal.booking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 relative z-[160]">
            <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-emerald-500" /> Shto Pagesë
              </h2>
              <button onClick={() => setPaymentModal({ isOpen: false, booking: null })} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 flex justify-between items-center">
                <span className="font-medium text-sm">Borxhi aktual:</span>
                <span className="text-2xl font-black">{symbol} {paymentModal.booking.calc_left.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Shuma për t'u paguar ({symbol})</label>
                <input 
                  type="number" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full border border-gray-200 p-3.5 rounded-xl font-bold text-lg focus:outline-none focus:border-emerald-500"
                  placeholder="0.00"
                  max={paymentModal.booking.calc_left}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Metoda e Pagesës</label>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setPaymentMethod('cash')} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-500'}`}>
                    <Banknote size={20}/> Cash
                  </button>
                  <button onClick={() => setPaymentMethod('bank')} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === 'bank' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-500'}`}>
                    <Building size={20}/> Bankë
                  </button>
                  <button onClick={() => setPaymentMethod('pos')} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === 'pos' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-100 bg-white text-gray-500'}`}>
                    <CardIcon size={20}/> POS
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={handleSavePayment}
                disabled={isSubmitting || !paymentAmount || Number(paymentAmount) <= 0 || Number(paymentAmount) > paymentModal.booking.calc_left}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
              >
                {isSubmitting ? t("savingBtn") : "Konfirmo Pagesën"} <CheckCircle2 size={18}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALI I BUTONIT SHIKO */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 relative z-[160]">

            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="flex items-center gap-2.5 text-xl font-bold text-gray-900 tracking-tight">
                <Eye className="text-blue-500" size={22}/> {t("modalTitle")}
              </h2>
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto no-scrollbar space-y-6">

              {/* Të Dhënat e Klientit */}
              <div className="border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">{t("clientDataSection")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">{t("clientName")}</p>
                    <p className="text-[15px] font-bold text-gray-900">{selectedBooking.clients?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5"><Phone size={13}/> {t("clientPhone")}</p>
                    <p className="text-[15px] font-bold text-gray-900">{selectedBooking.clients?.phone || t("notAvailable")}</p>
                  </div>
                </div>
              </div>

              {/* Detajet e Eventit (Blu) */}
              <div className="border border-blue-100 bg-[#F4F9FF] rounded-2xl p-5">
                <h3 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-4">{t("eventDetailsSection")}</h3>
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5"><PartyPopper size={13}/> {t("eventType")}</p>
                    <p className="text-[15px] font-bold text-gray-900">{selectedBooking.event_type || t("eventFallback")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5"><MapPin size={13}/> {t("eventHall")}</p>
                    <p className="text-[15px] font-bold text-gray-900">{selectedBooking.halls?.name || t("unassignedHall")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5"><CalendarIcon size={13}/> {t("eventDate")}</p>
                    <p className="text-[15px] font-bold text-gray-900">{formatDateSafe(selectedBooking.event_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5"><Clock size={13}/> {t("eventTime")}</p>
                    <p className="text-[15px] font-bold text-gray-900">
                      {new Date(selectedBooking.start_time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})} - 
                      {new Date(selectedBooking.end_time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5"><Users size={13}/> {t("eventGuests")}</p>
                    <p className="text-[15px] font-bold text-gray-900">{selectedBooking.participants} {t("persons")}</p>
                  </div>
                </div>
              </div>

              {/* Shërbimet Ekstra & Menuja (Vjollcë) */}
              <div className="border border-purple-100 bg-[#FAF5FF] rounded-2xl p-5">
                <h3 className="text-[11px] font-bold text-purple-500 uppercase tracking-widest mb-4">{t("extrasSection")}</h3>
                <div className="space-y-3.5">
                  {selectedBooking.menus && (
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-purple-100/50 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <Utensils size={16} className="text-purple-400"/>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{selectedBooking.menus.name}</p>
                          <p className="text-[11px] text-gray-500">{t("foodMenuLabel")} ({selectedBooking.participants} pax)</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{symbol} {Number(selectedBooking.menus.price_per_person).toFixed(2)}/pax</span>
                    </div>
                  )}
                  
                  {selectedBooking.booking_extras?.map((be: any) => (
                    <div key={be.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-purple-100/50 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <Sparkles size={16} className="text-purple-400"/>
                        <span className="text-sm font-semibold text-gray-800">{be.extras?.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{symbol} {Number(be.line_total).toFixed(2)}</span>
                    </div>
                  ))}

                  {!selectedBooking.menus && (!selectedBooking.booking_extras || selectedBooking.booking_extras.length === 0) && (
                    <p className="text-xs text-purple-400 font-medium italic py-2">{t("noExtrasMsg")}</p>
                  )}
                </div>
              </div>

              {/* Totali i Kontratës, Financat dhe Historiku i Pagesave (Jeshile) */}
              <div className="border border-emerald-100 bg-[#F0FDF4] rounded-2xl p-5 relative overflow-hidden">
                <h3 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-4">{t("financeSection")}</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div>
                    {modalDiscount > 0 && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-500 font-medium line-through">{t("subtotalLabel")}: {symbol} {modalSubTotal.toFixed(2)}</p>
                        <p className="text-sm text-amber-600 font-bold mb-1">{t("discountLabel")} ({modalDiscountPercent}%): -{symbol} {modalDiscount.toFixed(2)}</p>
                      </div>
                    )}
                    <p className="text-[32px] leading-none font-black text-gray-900 tracking-tight">
                      <span className="text-xl">{symbol}</span> {selectedBooking.calc_total.toFixed(2)} 
                    </p>
                    
                    {selectedBooking.status === 'cancelled' ? (
                      <span className="inline-block mt-2 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        MBYLLUR
                      </span>
                    ) : selectedBooking.calc_paid >= selectedBooking.calc_total && selectedBooking.calc_total > 0 ? (
                      <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{t("financePaid")}</span>
                    ) : selectedBooking.calc_paid > 0 ? (
                      <span className="inline-block mt-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{t("financePartial")}</span>
                    ) : (
                      <span className="inline-block mt-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{t("financeUnpaid")}</span>
                    )}

                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="flex items-center gap-5 bg-white px-5 py-4 rounded-xl border border-emerald-100 shadow-sm">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">{t("modalPaid")}</p>
                        <p className="text-[15px] font-bold text-emerald-600">{symbol} {selectedBooking.calc_paid.toFixed(2)}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-200"></div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">{t("modalLeft")}</p>
                        <p className="text-[15px] font-bold text-red-500">{symbol} {selectedBooking.calc_left.toFixed(2)}</p>
                      </div>
                    </div>
                    {modalRefunded > 0 && (
                      <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100 text-right">
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider mr-2">Rimbursoi:</span>
                        <span className="text-sm font-black text-red-600">-{symbol} {modalRefunded.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-emerald-200/50">
                    <h4 className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-3">Historiku i Pagesave</h4>
                    <div className="space-y-2.5">
                      {selectedBooking.payments.map((p: any, index: number) => {
                        const isRefund = p.type === 'refund';
                        return (
                          <div key={p.id || index} className={`flex justify-between items-center bg-white/60 p-3 rounded-xl text-sm border shadow-sm ${isRefund ? 'border-red-100' : 'border-emerald-50'}`}>
                             <div className="flex items-center gap-3.5">
                               <div className={`p-2 rounded-lg ${isRefund ? 'bg-red-100/50 text-red-600' : 'bg-emerald-100/50 text-emerald-600'}`}>
                                 {isRefund ? <Undo2 size={16}/> : p.method === 'cash' ? <Banknote size={16}/> : p.method === 'bank' ? <Building size={16}/> : <CardIcon size={16}/>}
                               </div>
                               <div>
                                 <p className={`font-bold ${isRefund ? 'text-red-600' : 'text-gray-900'}`}>
                                   {isRefund ? '-' : ''}{symbol} {Number(p.amount).toFixed(2)}
                                 </p>
                                 <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                   {formatDateSafe(p.paid_at || new Date())} • {new Date(p.paid_at || new Date()).toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12: false})}
                                 </p>
                               </div>
                             </div>
                             <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${isRefund ? 'text-red-700 bg-red-100/50' : 'text-emerald-700 bg-emerald-100/50'}`}>
                               {isRefund ? 'RIMBURSIM' : p.method === 'cash' ? 'CASH' : p.method === 'bank' ? 'BANKË' : 'POS'}
                             </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SHËNIMET E BRENDSHME (STAFI DHE ADMINI) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                
                {/* Shënimet e Stafit */}
                <div className="border border-amber-200 bg-[#FFFDF5] rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[11px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <FileText size={14} /> {t("staffNotesTitle")}
                  </h3>
                  <textarea 
                    className="w-full bg-white border border-amber-100 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-1 resize-none h-24 mb-3"
                    placeholder={t("staffNotesPlaceholder")}
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                  ></textarea>
                </div>

                {/* Shënimet e Adminit (Private) */}
                <div className="border border-gray-200 bg-gray-50 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Lock size={14} /> {t("adminNotesTitle")}
                  </h3>
                  <textarea 
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-gray-400 focus:ring-1 resize-none h-24 mb-3"
                    placeholder={t("adminNotesPlaceholder")}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  ></textarea>
                </div>

                {/* BUTONI PËR RUAJTJEN E SHËNIMEVE */}
                <div className="md:col-span-2 flex justify-end">
                  <button 
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:bg-gray-400"
                  >
                    <Save size={16}/> {isSavingNotes ? t("savingBtn") : t("saveNotesBtn")}
                  </button>
                </div>
              </div>

            </div>

            {/* Footer i Modalit */}
            <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 rounded-b-[24px]">
              <span className="text-sm text-gray-500 font-medium cursor-pointer hover:text-gray-800 transition-colors" onClick={() => setSelectedBooking(null)}>
                {t("goToList")}
              </span>
              
              <div className="flex w-full sm:w-auto gap-3">
                <Link 
                  href={`/${locale}/biznes/rezervimet/${selectedBooking.id}/fatura`}
                  className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <FileText size={16}/> {t("btnPrint")}
                </Link>
                <Link 
                  href={`/${locale}/biznes/rezervimet/ndrysho/${selectedBooking.id}`}
                  className="flex-1 sm:flex-none bg-[#0F172A] hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Edit size={16}/> {t("tooltipEdit")}
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* HEADER KRYESOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("pageTitle")}</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">{t("pageSubtitle")}</p>
        </div>
        <button 
          onClick={() => router.push(`/${locale}/biznes/rezervimet/shto`)}
          className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-md w-full md:w-auto"
        >
          <Plus size={18} /> {t("newBookingBtn")}
        </button>
      </div>

      {/* KARTAT E STATISTIKAVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <Clock size={14} /> {t("statIncoming")}
          </p>
          <p className="text-3xl font-bold text-gray-900">{inComing}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 size={14} /> {t("statCompleted")}
          </p>
          <p className="text-3xl font-bold text-gray-900">{completed}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <ArrowRightLeft size={14} /> {t("statPostponed")}
          </p>
          <p className="text-3xl font-bold text-gray-900">{postponed}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <XCircle size={14} /> {t("statCancelled")}
          </p>
          <p className="text-3xl font-bold text-gray-900">{cancelled}</p>
        </div>
      </div>

      {/* FILTRAT FUNKSIONALË */}
      <div className="flex flex-wrap gap-4 items-end mb-8 pb-6 border-b border-gray-100">
        <div className="flex-1 min-w-[200px] w-full md:w-auto">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t("filterSearchLabel")}</label>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={t("filterSearchPlaceholder")} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-gray-700 focus:outline-none focus:border-gray-400 focus:ring-1" 
            />
          </div>
        </div>
        <div className="w-full sm:w-auto flex-1 sm:flex-none">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t("filterFromDate")}</label>
          <input 
            type="date" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-gray-400 focus:ring-1 text-gray-600" 
          />
        </div>
        <div className="w-full sm:w-auto flex-1 sm:flex-none">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t("filterToDate")}</label>
          <input 
            type="date" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-gray-400 focus:ring-1 text-gray-600" 
          />
        </div>
        <div className="w-full sm:w-auto flex-1 sm:flex-none">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t("filterStatus")}</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-gray-400 focus:ring-1 text-gray-600 min-w-[140px]"
          >
            <option value="all">{t("all")}</option>
            <option value="pending">{t("statusPending")}</option>
            <option value="confirmed">{t("statusConfirmed")}</option>
            <option value="postponed">{t("statusPostponed")}</option>
            <option value="cancelled">{t("statusCancelled")}</option>
          </select>
        </div>
        <div className="w-full sm:w-auto flex-1 sm:flex-none">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t("filterFinance")}</label>
          <select 
            value={financeFilter}
            onChange={(e) => setFinanceFilter(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-gray-400 focus:ring-1 text-gray-600 min-w-[140px]"
          >
            <option value="all">{t("all")}</option>
            <option value="paid">{t("financePaid")}</option>
            <option value="partial">{t("financePartial")}</option>
            <option value="unpaid">{t("financeUnpaid")}</option>
            {/* OPsion i ri për Mbetjet / Borxhet */}
            <option value="debt">Me Borxh (Mbetje)</option>
          </select>
        </div>
      </div>

      {/* TABELA */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse min-w-[1050px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("tableColClient")}</th>
              <th className="pb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("tableColDetails")}</th>
              <th className="pb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("tableColStatus")}</th>
              <th className="pb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("tableColFinance")}</th>
              <th className="pb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("tableColAuthor")}</th>
              <th className="pb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t("tableColActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBookings.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-500 font-medium text-base">{t("noResults")}</td></tr>
            ) : (
              filteredBookings.map((booking: any) => {
                
                const total = booking.calc_total;
                const paradhenie = booking.calc_paid;
                const mbetja = booking.calc_left;
                const refunded = booking.calc_refunded;

                return (
                  <tr key={booking.id} className="hover:bg-gray-50/70 transition-colors">
                    
                    {/* KOLONA 1: KLIENTI, EVENTI, DATA DHE ORA */}
                    <td className="py-5 px-4 align-top">
                      <p className="font-bold text-gray-900 text-base mb-2">{booking.clients?.name}</p>
                      <div className="flex flex-col gap-2.5">
                        <div>
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded border border-gray-200 text-[11px] font-bold uppercase tracking-wide">
                            {booking.event_type || t("eventFallback")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-[12px] font-bold text-blue-700 bg-blue-50/80 px-2 py-1 rounded-md border border-blue-100/50">
                            <CalendarIcon size={13}/> 
                            {formatDateSafe(booking.event_date)}
                          </span>
                          <span className="flex items-center gap-1.5 text-[12px] font-bold text-amber-700 bg-amber-50/80 px-2 py-1 rounded-md border border-amber-100/50">
                            <Clock size={13}/> 
                            {new Date(booking.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* KOLONA 2: SALLA DHE TË FTUARIT */}
                    <td className="py-5 px-4 align-top">
                      <p className="font-semibold text-gray-800 text-sm flex items-center gap-2 mb-1.5">
                        <MapPin size={16} className="text-gray-400"/> {booking.halls?.name || t("unassignedHall")}
                      </p>
                      <p className="text-[13px] font-medium text-gray-500 ml-6">{booking.participants} {t("persons")}</p>
                    </td>

                    {/* KOLONA 3: STATUSI */}
                    <td className="py-5 px-4 align-top space-y-2">
                      {booking.status === 'confirmed' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                          {t("statusConfirmed")}
                        </div>
                      ) : booking.status === 'pending' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider animate-pulse">
                          {t("statusPending")}
                        </div>
                      ) : booking.status === 'postponed' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                          {t("statusPostponed")}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider">
                          {t("statusCancelled")}
                        </div>
                      )}
                      
                      <br/>
                      
                      {booking.status === 'cancelled' ? (
                        <div className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wider">
                          MBYLLUR
                        </div>
                      ) : paradhenie >= total && total > 0 ? (
                        <div className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                          {t("financePaid")}
                        </div>
                      ) : paradhenie > 0 ? (
                        <div className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FFFBF0] text-amber-600 border border-amber-200 uppercase tracking-wider">
                          {t("financePartial")}
                        </div>
                      ) : (
                        <div className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider">
                          {t("financeUnpaid")}
                        </div>
                      )}
                    </td>

                    {/* KOLONA 4: FINANCAT DHE METODA E PAGESËS */}
                    <td className="py-5 px-4 align-top text-[13px]">
                      <div className="grid grid-cols-[80px_1fr] gap-x-2 mb-1.5 items-center">
                        <span className="text-gray-500 font-medium">{t("totalLabel")}</span>
                        <span className="font-bold text-gray-900">{symbol} {total.toFixed(2)}</span>
                      </div>
                      
                      <div className="grid grid-cols-[80px_1fr] gap-x-2 mb-1.5 items-center">
                        <span className="text-gray-500 font-medium">{t("paidLabel")}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${paradhenie > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                            {symbol} {paradhenie.toFixed(2)}
                          </span>
                          {paradhenie > 0 && booking.payments?.length > 0 && (
                            <span className="text-[9px] font-black text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {booking.payments[booking.payments.length - 1].method === 'cash' ? 'CASH' : 
                               booking.payments[booking.payments.length - 1].method === 'bank' ? 'BANKË' : 'POS'}
                            </span>
                          )}
                        </div>
                      </div>

                      {refunded > 0 && (
                        <div className="grid grid-cols-[80px_1fr] gap-x-2 mb-1.5 items-center">
                          <span className="text-red-500 font-bold">Kthyer:</span>
                          <span className="font-black text-red-600">-{symbol} {refunded.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center">
                        <span className="text-gray-600 font-bold">{t("leftLabel")}</span>
                        <span className="font-bold text-red-600">{symbol} {mbetja.toFixed(2)}</span>
                      </div>
                      
                      {mbetja > 0 && booking.status !== 'cancelled' && (
                        <button 
                          onClick={() => {
                            setPaymentModal({ isOpen: true, booking: booking });
                            setPaymentAmount(mbetja.toFixed(2));
                          }}
                          className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors border border-emerald-100"
                        >
                          <Plus size={14} strokeWidth={3}/> Paguaj Mbetjen
                        </button>
                      )}
                    </td>

                    {/* KOLONA 5: AUTORI / STAFI */}
                    <td className="py-5 px-4 align-top">
                      <div className="flex items-center gap-2 mb-1.5">
                        <User size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-800 text-[13px]">{business.name}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium ml-5.5">
                        {t("createdAt")} {formatDateSafe(booking.created_at)}
                      </p>
                    </td>

                    {/* KOLONA 6: VEPRIMET (Actions) */}
                    <td className="py-5 px-4 align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setSelectedBooking(booking);
                              setStaffNotes(booking.staff_notes || "");
                              setAdminNotes(booking.admin_notes || "");
                            }}
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors bg-white border border-gray-200 rounded-md shadow-sm"
                            title={t("tooltipView")}
                          >
                            <Eye size={16} />
                          </button>
                          
                          <Link 
                            href={`/${locale}/biznes/rezervimet/ndrysho/${booking.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors bg-white border border-gray-200 rounded-md shadow-sm"
                            title={t("tooltipEdit")}
                          >
                            <Edit size={16} />
                          </Link>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/${locale}/biznes/rezervimet/${booking.id}/fatura`}
                            className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-md text-[11px] font-bold transition-all shadow-sm w-24"
                          >
                            <FileText size={14} /> {t("btnInvoice")}
                          </Link>

                          <Link 
                            href={`/${locale}/biznes/rezervimet/${booking.id}/kontrata`}
                            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-[11px] font-bold transition-all shadow-sm w-24"
                          >
                            <FileText size={14} /> {t("btnContract")}
                          </Link>
                        </div>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}