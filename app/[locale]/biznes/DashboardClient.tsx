"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { sq, enUS, mk } from "date-fns/locale"; 
import { 
  Plus, Calendar as CalendarIcon, List, 
  Clock, MapPin, Users, CalendarCheck, CheckCircle2, Clock4, X, Phone, Banknote, PartyPopper, UsersRound, Eye, Edit, Sparkles, Wallet, Utensils, AlertCircle, Landmark
} from "lucide-react";

export default function DashboardClient({ business, locale, stats, monthBookings, notifications, uiTranslations = {}, userRole = "admin" }: any) {
  const [view, setView] = useState<'list' | 'calendar'>('calendar'); 
  const [dayModal, setDayModal] = useState<{isOpen: boolean, date: number | null, bookings: any[]}>({isOpen: false, date: null, bookings: []});
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    const savedView = localStorage.getItem('flowEvents_dashboardView') as 'list' | 'calendar';
    if (savedView) {
      setView(savedView);
    }
  }, []);

  const handleViewChange = (newView: 'list' | 'calendar') => {
    setView(newView);
    localStorage.setItem('flowEvents_dashboardView', newView);
  };

  const dateLocales: any = { sq: sq, en: enUS, mk: mk };
  const currentLocale = dateLocales[locale] || enUS; 
  
  const now = new Date();
  const rawMonthName = format(now, 'MMMM yyyy', { locale: currentLocale }); 
  const currentMonthName = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

  const currencySymbols: Record<string, string> = {
    "EUR": "€", "USD": "$", "GBP": "£", "CHF": "CHF", "ALL": "L", "MKD": "ден"
  };
  const symbol = business?.currency ? (currencySymbols[business.currency] || business.currency) : "€";

  const daysInMonth = getDaysInMonth(now);
  const firstDay = startOfMonth(now);
  const startDay = getDay(firstDay);
  const emptyCells = startDay === 0 ? 6 : startDay - 1;
  
  const blanks = Array.from({ length: emptyCells }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const renderStatus = (status: string) => {
    switch(status) {
      case 'confirmed':
      case 'paid':
        return <span className="inline-flex items-center gap-1 bg-[#E6F8F0] text-[#059669] px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100"><CheckCircle2 size={12}/> {uiTranslations.statusConfirmed || "E Konfirmuar"}</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-black border border-amber-300 animate-pulse"><AlertCircle size={12}/> Kërkesë e Re</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200"><Clock4 size={12}/> {uiTranslations.statusPending || "Në Pritje"}</span>;
    }
  };

  const renderFinanceBadge = (paymentStatus: string) => {
    if (paymentStatus === 'paid') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 ml-2">{uiTranslations.financePaid || "Paguar"}</span>;
    if (paymentStatus === 'deposit') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 ml-2">{uiTranslations.financeDeposit || "Kapari"}</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 ml-2">{uiTranslations.financeUnpaid || "E Papaguar"}</span>;
  };

  const safeRevenue = Number(stats?.revenue) || 0;
  const safePending = Number(stats?.pending) || 0;

  const modalTotal = selectedBooking ? Number(selectedBooking.total_amount) : 0;
  const modalPaid = selectedBooking?.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  const modalBalance = modalTotal - modalPaid;

  if (!isMounted) return null;

  return (
    <div className="w-full relative z-0">
      
      {/* POPUP I DETAJEVE - RREGULLUAR z-index */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedBooking.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                  {selectedBooking.status === 'pending' ? <AlertCircle size={20} /> : <Eye size={20} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">
                    {selectedBooking.status === 'pending' ? 'Kërkesë për Rezervim' : 'Detajet e Rezervimit'}
                  </h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                    {format(new Date(selectedBooking.event_date), 'dd.MM.yyyy')}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#F8F9FA]">
              {selectedBooking.status === 'pending' && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6 shadow-sm">
                  <p className="text-amber-800 text-sm font-semibold">
                    <strong className="block text-amber-900 mb-1">⚠️ Vëmendje:</strong>
                    Ky është një rezervim i pa-konfirmuar i shtuar nga recepsioni. Për ta konfirmuar dhe për t'i caktuar çmimin, klikoni butonin <strong>"Shqyrto Kërkesën"</strong> më poshtë.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Klienti */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Users size={14} /> Të dhënat e Klientit
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase">Emri i Plotë</p>
                        <p className="text-base font-bold text-gray-900">{selectedBooking.clients?.name}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase">Numri i Telefonit</p>
                        <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                          <Phone size={14} className="text-gray-400" /> {selectedBooking.clients?.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Eventi dhe Menuja */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <PartyPopper size={14} /> Detajet e Eventit
                    </h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div><p className="text-[11px] font-bold text-gray-400 uppercase">Tipi</p><p className="text-sm font-bold text-gray-900">{selectedBooking.event_type || "Aheng"}</p></div>
                      <div><p className="text-[11px] font-bold text-gray-400 uppercase">Salla</p><p className="text-sm font-bold text-gray-900 flex items-center gap-1"><MapPin size={12} className="text-gray-400"/> {selectedBooking.halls?.name || "E Pacaktuar"}</p></div>
                      <div><p className="text-[11px] font-bold text-gray-400 uppercase">Data</p><p className="text-sm font-bold text-gray-900">{format(new Date(selectedBooking.event_date), 'dd.MM.yyyy')}</p></div>
                      <div><p className="text-[11px] font-bold text-gray-400 uppercase">Ora</p><p className="text-sm font-bold text-gray-900 flex items-center gap-1"><Clock size={12} className="text-gray-400"/> {format(new Date(selectedBooking.start_time), 'HH:mm')} - {format(new Date(selectedBooking.end_time), 'HH:mm')}</p></div>
                      <div className="col-span-2"><p className="text-[11px] font-bold text-gray-400 uppercase">Pjesëmarrës</p><p className="text-sm font-bold text-gray-900 flex items-center gap-1"><UsersRound size={12} className="text-gray-400"/> {selectedBooking.participants} pax</p></div>
                      {selectedBooking.status !== 'pending' && (<div className="col-span-2"><p className="text-[11px] font-bold text-gray-400 uppercase">Menuja</p><p className="text-sm font-bold text-gray-900 flex items-center gap-1"><Utensils size={12} className="text-gray-400"/> {selectedBooking.menus?.name || "E pacaktuar"}</p></div>)}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedBooking.booking_extras && selectedBooking.booking_extras.length > 0 && (
                    <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 shadow-sm">
                      <h4 className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles size={14} /> Shërbime Ekstra</h4>
                      <div className="space-y-3">
                        {selectedBooking.booking_extras.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-purple-50 shadow-sm">
                            <span className="font-bold text-gray-700 text-sm">{item.extras?.name}</span>
                            <span className="font-black text-purple-700 text-sm">+{Number(item.line_total || item.extras?.price).toFixed(2)} {symbol}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedBooking.staff_notes && (
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm">
                      <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2"><AlertCircle size={14} /> Shënime (Nga Recepsioni)</h4>
                      <p className="text-sm font-medium text-amber-900 leading-relaxed bg-white p-4 rounded-xl border border-amber-100">{selectedBooking.staff_notes}</p>
                    </div>
                  )}

                  {selectedBooking.status !== 'pending' && userRole !== 'manager' && (
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 opacity-10 text-white pointer-events-none"><Banknote size={100} /></div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 relative z-10">Pasqyra Financiare</h4>
                      <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-xl"><span className="text-sm font-medium text-gray-300">Totali</span><span className="font-bold text-white">{modalTotal.toFixed(2)} {symbol}</span></div>
                        <div className="flex justify-between items-center bg-emerald-500/20 px-4 py-3 rounded-xl border border-emerald-500/30"><span className="text-sm font-medium text-emerald-200">E Paguar</span><span className="font-bold text-emerald-400">-{modalPaid.toFixed(2)} {symbol}</span></div>
                        <div className={`flex justify-between items-center px-4 py-3 rounded-xl border ${modalBalance > 0 ? 'bg-red-500/20 border-red-500/30' : 'bg-white/5 border-transparent'}`}><span className={`text-sm font-medium ${modalBalance > 0 ? 'text-red-200' : 'text-gray-300'}`}>Mbetja (Borxh)</span><span className={`font-black text-lg ${modalBalance > 0 ? 'text-red-400' : 'text-white'}`}>{modalBalance.toFixed(2)} {symbol}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
              <Link href={`/${locale}/biznes/rezervimet/ndrysho/${selectedBooking.id}`} className={`text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg text-sm ${selectedBooking.status === 'pending' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-black'}`}>
                {selectedBooking.status === 'pending' ? <><CheckCircle2 size={18} /> Shqyrto Kërkesën</> : <><Edit size={16} /> Modifiko Rezervimin</>}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODALI I DITËS - RREGULLUAR z-index */}
      {dayModal.isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 relative z-[160]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-black text-gray-900 text-lg flex items-center gap-2"><CalendarIcon className="text-blue-500" size={20}/>Data: {dayModal.date} {currentMonthName}</h3>
              <button onClick={() => setDayModal({isOpen: false, date: null, bookings: []})} className="text-gray-400 hover:text-gray-700 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 transition-colors"><X size={18}/></button>
            </div>
            <div className="p-4 space-y-2.5 overflow-y-auto max-h-[60vh] custom-scrollbar bg-[#F8F9FA]">
              {dayModal.bookings.map(b => (
                <button key={b.id} onClick={() => {setDayModal({isOpen: false, date: null, bookings: []}); setSelectedBooking(b);}} className={`w-full text-left p-4 rounded-xl border transition-all shadow-sm ${b.status === 'pending' ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : 'bg-white border-emerald-100 hover:border-emerald-300'}`}>
                  <div className="flex justify-between items-center mb-1.5"><span className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1"><Clock size={12}/> {format(new Date(b.start_time), "HH:mm")}</span>{b.status === 'pending' && <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded uppercase font-bold animate-pulse">Kërkesë</span>}</div>
                  <p className="font-bold text-gray-900 text-[15px]">{b.clients?.name}</p>
                  <div className="flex items-center gap-2 mt-2"><span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{b.halls?.name || "E Pacaktuar"}</span><span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{b.participants} pax</span></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
            
      {/* GRIDI I KARTAVE - DIZAJN MINIMALIST & PREMIUM */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${userRole !== 'manager' ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-6 mb-10 w-full`}>
        
        {/* Karta 1: Shto Rezervim (E zezë, elegante) */}
        <Link href={`/${locale}/biznes/rezervimet/shto`} className="group bg-[#0A0A0A] rounded-[2rem] p-7 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[160px] border border-gray-800">
          <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/5 backdrop-blur-sm group-hover:scale-110 transition-transform">
              <Plus size={24} className="text-white"/>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm border border-white/5">E Re</div>
          </div>
          <div className="relative z-10 mt-6">
            <h3 className="text-white font-bold text-xl">{uiTranslations.newBookingBtn || "Shto Rezervim"}</h3>
            <p className="text-gray-400 text-sm mt-1">Krijo një event të ri</p>
          </div>
        </Link>

        {/* Karta 2: Evente Këtë Muaj (E Bardhë, e Pastër) */}
        <Link href={`/${locale}/biznes/rezervimet?filter=this_month`} className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-12 bg-blue-50/80 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100/50 group-hover:bg-blue-100 transition-colors">
              <CalendarCheck size={24} className="text-blue-600"/>
            </div>
            <span className="text-4xl font-black text-gray-900 tracking-tighter">{stats.month}</span>
          </div>
          <div className="relative z-10 mt-6">
            <h3 className="text-lg font-bold text-gray-900">{uiTranslations.eventsThisMonthTitle || "Evente këtë Muaj"}</h3>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1 block group-hover:text-blue-700">Shko te lista →</span>
          </div>
        </Link>

        {userRole !== 'manager' && (
          <>
            {/* Karta 3: Të Hyrat (E Bardhë, Jeshile) */}
            <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 bg-emerald-50/80 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100/50 group-hover:bg-emerald-100 transition-colors">
                  <Landmark size={24} className="text-emerald-600"/>
                </div>
                <div className="bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Të Hyrat</div>
              </div>
              <div className="relative z-10 mt-6">
                <span className="text-3xl font-black text-gray-900 tracking-tight whitespace-nowrap block">
                  {safeRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-base text-gray-400 font-bold ml-1.5">{symbol}</span>
                </span>
                <p className="text-[12px] font-medium text-gray-500 mt-1">Për muajin aktual</p>
              </div>
            </div>

            {/* Karta 4: Borxhet (E Bardhë, e Kuqe) */}
            <Link href={`/${locale}/biznes/rezervimet?filter=debt`} className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 bg-rose-50/80 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100/50 group-hover:bg-rose-100 transition-colors">
                  <Wallet size={24} className="text-rose-600"/>
                </div>
                <div className="bg-rose-50 px-3 py-1 rounded-full text-[10px] font-bold text-rose-600 uppercase tracking-wider">Borxhet</div>
              </div>
              <div className="relative z-10 mt-6">
                <span className="text-3xl font-black text-gray-900 tracking-tight whitespace-nowrap block">
                  {safePending.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-base text-gray-400 font-bold ml-1.5">{symbol}</span>
                </span>
                <p className="text-[12px] font-medium text-gray-500 mt-1">Mbetje e paarkëtuar</p>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* SEKSIONI I LISTËS / KALENDARIT (I ZGJERUAR) */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 min-h-[500px] relative z-0 w-full">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 capitalize flex items-center gap-2">
              {currentMonthName} 
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">{uiTranslations.sectionSubtitle || "Përmbledhja e eventeve"}</p>
          </div>
          
          <div className="bg-gray-100 p-1.5 rounded-xl flex items-center w-full sm:w-auto shadow-inner">
            <button onClick={() => handleViewChange('list')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <List size={16} /> {uiTranslations.viewList || "Lista"}
            </button>
            <button onClick={() => handleViewChange('calendar')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <CalendarIcon size={16} /> {uiTranslations.viewCalendar || "Kalendari"}
            </button>
          </div>
        </div>

        {view === 'list' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {monthBookings.length > 0 ? monthBookings.map((booking: any) => {
              const isPending = booking.status === 'pending';

              return (
              <div key={booking.id} onClick={() => setSelectedBooking(booking)} className={`cursor-pointer flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 rounded-2xl border transition-all group gap-4 lg:gap-8 shadow-sm hover:shadow-md ${isPending ? 'border-amber-200 bg-amber-50/30 hover:bg-amber-50' : 'border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20'}`}>
                <div className="flex items-center gap-4 w-full lg:w-auto lg:min-w-[280px]">
                  <div className={`px-4 py-3 rounded-xl text-center border shrink-0 transition-colors ${isPending ? 'bg-amber-100 border-amber-200 group-hover:bg-amber-200' : 'bg-gray-50 border-gray-100 group-hover:bg-white group-hover:border-emerald-200'}`}>
                    <p className={`text-[11px] font-bold uppercase leading-none ${isPending ? 'text-amber-600' : 'text-gray-400'}`}>{format(new Date(booking.event_date), 'MMM', { locale: currentLocale })}</p>
                    <p className={`text-xl font-black mt-1.5 leading-none ${isPending ? 'text-amber-800' : 'text-gray-900'}`}>{format(new Date(booking.event_date), 'dd')}</p>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg">{booking.clients?.name || uiTranslations.unknownClient || "Klient i panjohur"}</h4>
                    <p className="text-xs text-gray-500 mt-1.5 font-semibold flex items-center gap-1.5">
                       {booking.event_type ? <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">{booking.event_type}</span> : <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">{uiTranslations.eventLabel || "Event"}</span>}
                       <span className="text-gray-300">•</span>
                       <Clock size={12}/> {format(new Date(booking.start_time), 'HH:mm')}
                    </p>
                  </div>
                </div>

                <div className={`flex-1 w-full flex gap-6 lg:justify-center border-y lg:border-y-0 lg:border-x py-4 lg:py-0 lg:px-8 ${isPending ? 'border-amber-100' : 'border-gray-100'}`}>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1 ${isPending ? 'text-amber-500' : 'text-gray-400'}`}><MapPin size={10}/> {uiTranslations.hallLabel || "Salla"}</span>
                    <span className="text-[15px] font-bold text-gray-700">{booking.halls?.name || uiTranslations.notAssigned || "E pacaktuar"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1 ${isPending ? 'text-amber-500' : 'text-gray-400'}`}><UsersRound size={10}/> {uiTranslations.capacityLabel || "Kapaciteti"}</span>
                    <span className="text-[15px] font-bold text-gray-700">{booking.participants} {uiTranslations.paxUnit || "pax"}</span>
                  </div>
                </div>

                <div className="w-full lg:w-auto text-left lg:text-right flex lg:flex-col items-center lg:items-end justify-between lg:min-w-[140px]">
                  {renderStatus(booking.status)}
                  <div className="lg:mt-2">
                    {booking.status !== 'pending' && renderFinanceBadge(booking.payment_status)}
                  </div>
                </div>
              </div>
            )}) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50">
                <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><List size={36}/></div>
                <p className="text-gray-900 text-lg font-black">{uiTranslations.noEventsMsg || "Nuk u gjetën të dhëna"}</p>
                <p className="text-gray-500 text-sm mt-1 font-medium">Nuk ka asnjë event për këtë muaj.</p>
              </div>
            )}
          </div>
        )}

        {view === 'calendar' && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {[uiTranslations.mon || "Hën", uiTranslations.tue || "Mar", uiTranslations.wed || "Mër", uiTranslations.thu || "Enj", uiTranslations.fri || "Pre", uiTranslations.sat || "Sht", uiTranslations.sun || "Die"].map(d => <div key={d} className="text-center text-[11px] sm:text-xs font-black text-gray-400 uppercase py-3">{d}</div>)}
              {blanks.map(i => <div key={`b-${i}`} className="h-24 sm:h-32 rounded-2xl bg-transparent border border-dashed border-gray-100/70"></div>)}
              
              {days.map(day => {
                const dayBookings = monthBookings.filter((b: any) => new Date(b.event_date).getDate() === day);
                const hasEvent = dayBookings.length > 0;
                const hasPending = dayBookings.some((b: any) => b.status === 'pending');

                const MAX_VISIBLE = 2;
                const visibleBookings = dayBookings.slice(0, MAX_VISIBLE);
                const extraCount = dayBookings.length - MAX_VISIBLE;

                return (
                  <div key={day} className={`h-24 sm:h-32 rounded-2xl p-2 border transition-all flex flex-col overflow-hidden ${hasPending ? 'bg-amber-50/30 border-amber-200 shadow-sm' : hasEvent ? 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-300 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'}`}>
                    <span className={`text-xs sm:text-sm font-black w-7 h-7 flex items-center justify-center rounded-full mb-1 ${hasPending ? 'bg-amber-500 text-white shadow-sm' : hasEvent ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500'}`}>{day}</span>
                    
                    <div className="flex flex-col gap-1.5 overflow-hidden mt-1 flex-1">
                      {visibleBookings.map((b: any) => {
                        const isPending = b.status === 'pending';
                        return (
                        <button 
                          key={b.id} 
                          onClick={() => setSelectedBooking(b)}
                          className={`text-left w-full text-[9px] sm:text-[10px] font-bold px-2 py-1.5 rounded-lg transition-colors truncate border ${isPending ? 'bg-amber-500 text-white border-amber-600 animate-pulse shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border-emerald-100 hover:border-emerald-500'}`}
                          title={b.clients?.name}
                        >
                          {b.clients?.name || uiTranslations.eventLabel || "Event"}
                        </button>
                      )})}
                      
                      {extraCount > 0 && (
                        <button 
                          onClick={() => setDayModal({isOpen: true, date: day, bookings: dayBookings})}
                          className="w-full mt-0.5 py-1 bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-600 rounded-lg text-[9px] sm:text-[10px] font-bold transition-colors shadow-sm"
                        >
                          +{extraCount} të tjera
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}