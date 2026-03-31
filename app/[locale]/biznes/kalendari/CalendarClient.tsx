"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X, 
  Phone, PartyPopper, MapPin, CheckCircle2, Clock4, Edit, Eye, Sparkles, UsersRound
} from "lucide-react";
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, addMonths, subMonths, 
  isSameMonth, isSameDay, isToday, parseISO 
} from "date-fns";
import { sq, enUS } from "date-fns/locale"; 
import { useTranslations } from "next-intl"; 

export default function CalendarClient({ bookings, business, locale, currentDateStr }: any) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // SHTUAM STATE-IN PËR MODALIN E DITËS "TË MENÇUR"
  const [dayModal, setDayModal] = useState<{isOpen: boolean, date: Date | null, bookings: any[]}>({isOpen: false, date: null, bookings: []});
  
  const t = useTranslations("CalendarClient"); 
  
  const currentLocaleObj = locale === 'sq' ? sq : enUS;

  const currentDate = currentDateStr ? parseISO(currentDateStr) : new Date();

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });

  const daysInGrid = eachDayOfInterval({ start: startDate, end: endDate });
  const prevMonthDate = format(subMonths(currentDate, 1), 'yyyy-MM-dd');
  const nextMonthDate = format(addMonths(currentDate, 1), 'yyyy-MM-dd');

  const renderStatus = (status: string) => {
    switch(status) {
      case 'confirmed':
      case 'paid':
        return <span className="inline-flex items-center gap-1 bg-[#E6F8F0] text-[#059669] px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100"><CheckCircle2 size={12}/> {t("statusConfirmed")}</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100"><Clock4 size={12}/> {t("statusPending")}</span>;
    }
  };

  const renderFinanceBadge = (paymentStatus: string) => {
    if (paymentStatus === 'paid') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 ml-2">{t("financePaid")}</span>;
    if (paymentStatus === 'deposit') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 ml-2">{t("financeDeposit")}</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 ml-2">{t("financeUnpaid")}</span>;
  };

  const weekDays = [t("monday"), t("tuesday"), t("wednesday"), t("thursday"), t("friday"), t("saturday"), t("sunday")];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 relative">
      
      {/* POPUP-I INTELIGJENT I DETAJEVE TË EVENTIT */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Eye className="text-blue-500" /> {t("modalTitle")}
              </h3>
              <button onClick={() => setSelectedBooking(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors">
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t("clientInfoTitle")}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">{t("clientName")}</p>
                    <p className="font-bold text-gray-900">{selectedBooking.clients?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={14}/> {t("clientPhone")}</p>
                    <p className="font-bold text-gray-900">{selectedBooking.clients?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">{t("eventDetailsTitle")}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><PartyPopper size={14}/> {t("eventType")}</p>
                    <p className="font-bold text-gray-900">{selectedBooking.event_type || t("eventTypeFallback")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14}/> {t("eventHall")}</p>
                    <p className="font-bold text-gray-900">{selectedBooking.halls?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><CalendarIcon size={14}/> {t("eventDate")}</p>
                    <p className="font-bold text-gray-900">{format(new Date(selectedBooking.event_date), 'dd MMM yyyy', { locale: currentLocaleObj })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Clock size={14}/> {t("eventTime")}</p>
                    <p className="font-bold text-gray-900">{format(new Date(selectedBooking.start_time), 'HH:mm')} - {format(new Date(selectedBooking.end_time), 'HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><UsersRound size={14}/> {t("eventGuests")}</p>
                    <p className="font-bold text-gray-900">{selectedBooking.participants} {t("guestsUnit")}</p>
                  </div>
                </div>
              </div>

              {selectedBooking.booking_extras && selectedBooking.booking_extras.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-3">{t("extrasTitle")}</p>
                  <div className="space-y-2">
                    {selectedBooking.booking_extras.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700 flex items-center gap-2"><Sparkles size={14} className="text-purple-400"/> {item.extras?.name}</span>
                        <span className="font-bold text-gray-900">+{Number(item.line_total || item.extras?.price).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">{t("contractTotal")}</p>
                  <p className="text-2xl font-black text-gray-900">{Number(selectedBooking.total_amount).toFixed(2)} €</p>
                </div>
                <div className="text-right">
                  {renderFinanceBadge(selectedBooking.payment_status)}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center gap-4">
              <Link href={`/${locale}/biznes/rezervimet`} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                {t("goToList")}
              </Link>
              <Link href={`/${locale}/biznes/rezervimet/ndrysho/${selectedBooking.id}`} className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md">
                <Edit size={16} /> {t("editBookingBtn")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODALI I DITËS (Kur klikon +X të tjera) */}
      {dayModal.isOpen && dayModal.date && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 relative z-[160]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <CalendarIcon className="text-blue-500" size={20}/>
                {format(dayModal.date, "dd MMM yyyy", { locale: currentLocaleObj })}
              </h3>
              <button onClick={() => setDayModal({isOpen: false, date: null, bookings: []})} className="text-gray-400 hover:text-gray-700 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 transition-colors">
                <X size={18}/>
              </button>
            </div>
            <div className="p-4 space-y-2.5 overflow-y-auto max-h-[60vh] custom-scrollbar bg-[#F8F9FA]">
              {dayModal.bookings.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    setDayModal({isOpen: false, date: null, bookings: []});
                    setSelectedBooking(b);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all shadow-sm ${b.status === 'confirmed' ? 'bg-white border-emerald-100 hover:border-emerald-300' : 'bg-amber-50 border-amber-200 hover:bg-amber-100'}`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                      <Clock size={12}/> {format(new Date(b.start_time), "HH:mm")}
                    </span>
                    {b.status === 'pending' && <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded uppercase font-bold animate-pulse">Kërkesë</span>}
                  </div>
                  <p className="font-bold text-gray-900 text-[15px]">{b.clients?.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{b.halls?.name || "E Pacaktuar"}</span>
                    <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{b.participants} pax</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KOKA E FAQES & KONTROLLET E MUAJIT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-gray-400" size={32} />
            {t("pageTitle")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {t("pageSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
          <Link href={`/${locale}/biznes/kalendari?date=${prevMonthDate}`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
            <ChevronLeft size={24} />
          </Link>
          <h2 className="text-lg font-bold text-gray-900 min-w-[140px] text-center capitalize">
            {format(currentDate, "MMMM yyyy", { locale: currentLocaleObj })}
          </h2>
          <Link href={`/${locale}/biznes/kalendari?date=${nextMonthDate}`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
            <ChevronRight size={24} />
          </Link>
        </div>
      </div>

      {/* KALENDARI VISUAL */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {weekDays.map((day) => (
            <div key={day} className="py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[140px]">
          {daysInGrid.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const daysBookings = bookings.filter((b: any) => isSameDay(new Date(b.event_date), day));
            
            // LOGJIKA E RE "E MENÇUR": MAX 3 EVENTE
            const MAX_VISIBLE = 3;
            const visibleBookings = daysBookings.slice(0, MAX_VISIBLE);
            const extraCount = daysBookings.length - MAX_VISIBLE;

            return (
              <div key={day.toString()} className={`border-r border-b border-gray-100 p-2 relative flex flex-col transition-colors ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50/50'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${isTodayDate ? 'bg-gray-900 text-white shadow-md' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 overflow-hidden flex-1">
                  {visibleBookings.map((booking: any) => (
                    <button 
                      key={booking.id} 
                      onClick={() => setSelectedBooking(booking)}
                      className={`text-left block px-2 py-1.5 rounded-lg text-[11px] font-bold truncate border transition-all hover:scale-[1.02] shadow-sm ${
                        booking.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-0.5 opacity-80">
                        <Clock size={10} /> {format(new Date(booking.start_time), "HH:mm")}
                      </div>
                      <span className="truncate block">{booking.clients?.name}</span>
                    </button>
                  ))}

                  {/* BUTONI +X TË TJERA NËSE KA MË SHUMË SE 3 EVENTE */}
                  {extraCount > 0 && (
                    <button 
                      onClick={() => setDayModal({isOpen: true, date: day, bookings: daysBookings})}
                      className="mt-0.5 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold transition-colors shadow-sm w-full"
                    >
                      +{extraCount} evente të tjera
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}