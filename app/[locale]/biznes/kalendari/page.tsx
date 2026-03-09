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
import { sq } from "date-fns/locale";

export default function CalendarClient({ bookings, business, locale, currentDateStr }: any) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const currentDate = parseISO(currentDateStr);

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
        return <span className="inline-flex items-center gap-1 bg-[#E6F8F0] text-[#059669] px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100"><CheckCircle2 size={12}/> Konfirmuar</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100"><Clock4 size={12}/> Në Pritje</span>;
    }
  };

  const renderFinanceBadge = (paymentStatus: string) => {
    if (paymentStatus === 'paid') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 ml-2">E Paguar</span>;
    if (paymentStatus === 'deposit') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 ml-2">Paradhënie</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 ml-2">Pa paguar</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 relative">
      
      {/* ========================================= */}
      {/* POPUP-I INTELIGJENT (I njëjtë si kudo) */}
      {/* ========================================= */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Eye className="text-blue-500" /> Detajet e Rezervimit
              </h3>
              <button onClick={() => setSelectedBooking(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors">
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Të dhënat e Klientit */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Të dhënat e Klientit</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">Emri:</p>
                    <p className="font-bold text-gray-900">{selectedBooking.clients?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={14}/> Telefoni:</p>
                    <p className="font-bold text-gray-900">{selectedBooking.clients?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Detajet e Eventit */}
              <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Detajet e Eventit</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><PartyPopper size={14}/> Lloji:</p>
                    <p className="font-bold text-gray-900">{selectedBooking.event_type || "Nuk është specifikuar"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14}/> Salla:</p>
                    <p className="font-bold text-gray-900">{selectedBooking.halls?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><CalendarIcon size={14}/> Data:</p>
                    <p className="font-bold text-gray-900">{format(new Date(selectedBooking.event_date), 'dd MMM yyyy', { locale: sq })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Clock size={14}/> Orari:</p>
                    <p className="font-bold text-gray-900">{format(new Date(selectedBooking.start_time), 'HH:mm')} - {format(new Date(selectedBooking.end_time), 'HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><UsersRound size={14}/> Pjesëmarrës:</p>
                    <p className="font-bold text-gray-900">{selectedBooking.participants} persona</p>
                  </div>
                </div>
              </div>

              {/* Ekstrat */}
              {selectedBooking.booking_extras && selectedBooking.booking_extras.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-3">Shërbime Ekstra të Zgjedhura</p>
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

              {/* Financat */}
              <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Totali i Kontratës</p>
                  <p className="text-2xl font-black text-gray-900">{Number(selectedBooking.total_amount).toFixed(2)} €</p>
                </div>
                <div className="text-right">
                  {renderFinanceBadge(selectedBooking.payment_status)}
                </div>
              </div>
            </div>
            
            {/* Butonat e Veprimit */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center gap-4">
              <Link href={`/${locale}/biznes/rezervimet`} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                Shko te lista e plotë
              </Link>
              <Link href={`/${locale}/biznes/rezervimet/ndrysho/${selectedBooking.id}`} className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md">
                <Edit size={16} /> Ndrysho Rezervimin
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* ========================================= */}


      {/* KOKA E FAQES & KONTROLLET E MUAJIT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-gray-400" size={32} />
            Kalendari i Eventeve
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Planifiko dhe shiko të gjitha rezervimet e tua të organizuara sipas datave.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
          <Link href={`/${locale}/biznes/kalendari?date=${prevMonthDate}`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
            <ChevronLeft size={24} />
          </Link>
          <h2 className="text-lg font-bold text-gray-900 min-w-[140px] text-center capitalize">
            {format(currentDate, "MMMM yyyy", { locale: sq })}
          </h2>
          <Link href={`/${locale}/biznes/kalendari?date=${nextMonthDate}`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
            <ChevronRight size={24} />
          </Link>
        </div>
      </div>

      {/* KALENDARI VISUAL */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'].map((day) => (
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

            return (
              <div key={day.toString()} className={`border-r border-b border-gray-100 p-2 relative transition-colors ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50/50'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${isTodayDate ? 'bg-blue-600 text-white shadow-md' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Shfaqja e Rezervimeve në këtë ditë (TANI HAPIN POPUP-IN) */}
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[85px] no-scrollbar">
                  {daysBookings.map((booking: any) => (
                    <button 
                      key={booking.id} 
                      onClick={() => setSelectedBooking(booking)} // HAP MODALIN KËTU
                      className={`text-left block px-2 py-1.5 rounded-lg text-xs font-bold truncate border transition-all hover:scale-[1.02] ${
                        booking.status === 'confirmed' || booking.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <Clock size={10} /> {format(new Date(booking.start_time), "HH:mm")}
                      </div>
                      <span className="truncate block">{booking.clients?.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}