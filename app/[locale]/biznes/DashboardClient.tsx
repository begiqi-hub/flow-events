"use client";

import { useState } from "react";
import Link from "next/link";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { sq, enUS, de } from "date-fns/locale";
import { 
  Plus, Calendar as CalendarIcon, CalendarDays, List, 
  Clock, ArrowRight, MapPin, Users, CalendarCheck, CheckCircle2, Clock4, X, Phone, Banknote, PartyPopper, UsersRound, Eye, Edit, Sparkles
} from "lucide-react";

export default function DashboardClient({ business, locale, stats, monthBookings }: any) {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  const dateLocales: any = { sq: sq, en: enUS, de: de };
  const currentLocale = dateLocales[locale] || sq; 
  
  const now = new Date();
  const currentMonthName = format(now, 'MMMM yyyy', { locale: currentLocale }); 

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
        return <span className="inline-flex items-center gap-1 bg-[#E6F8F0] text-[#059669] px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100"><CheckCircle2 size={12}/> Konfirmuar</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100"><Clock4 size={12}/> Në Pritje</span>;
    }
  };

  const renderFinanceBadge = (paymentStatus: string) => {
    if (paymentStatus === 'paid') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 ml-2">E Paguar</span>;
    if (paymentStatus === 'deposit') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 ml-2">Ka lënë kapar</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 ml-2">Pa paguar</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 relative">
      
      {/* ========================================= */}
      {/* POPUP I DETAJEVE (I njëjtë me Kalendarin) */}
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
                    <p className="font-bold text-gray-900">{format(new Date(selectedBooking.event_date), 'dd MMM yyyy', { locale: currentLocale })}</p>
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

      {/* HEADER DHE BANERI I PROVËS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900">{business.name}</h1>
            <span className="bg-amber-100 text-amber-800 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border border-amber-200 shadow-sm">
              Provë
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Mirësevini në pultin tuaj të menaxhimit të eventeve.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white border border-amber-200 shadow-sm p-2 pr-4 rounded-2xl w-full lg:w-auto">
          <div className="bg-amber-50 p-2.5 rounded-xl text-amber-500"><Clock size={20}/></div>
          <div className="flex-1 lg:flex-none">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Koha e Provës</p>
            <p className="text-sm font-black text-gray-900">13 ditë të mbetura</p>
          </div>
          <button className="ml-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm">
            Abonohu
          </button>
        </div>
      </div>

      {/* 4 KARTAT MODERNE TË STATISTIKAVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        <Link 
          href={`/${locale}/biznes/rezervimet/shto`}
          className="bg-[#0F172A] rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-transform shadow-xl shadow-slate-900/10 relative overflow-hidden h-[150px]"
        >
          <div className="absolute -right-4 -top-4 opacity-10 text-white transform group-hover:scale-110 transition-transform duration-500">
            <CalendarIcon size={120} />
          </div>
          <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white mb-2 backdrop-blur-sm">
            <Plus size={24} />
          </div>
          <div className="relative z-10">
            <h3 className="text-white font-bold text-lg">Rezervo Eventin</h3>
            <p className="text-slate-400 text-xs mt-1 font-medium">Krijo një regjistrim të ri</p>
          </div>
        </Link>

        <Link href={`/${locale}/biznes/rezervimet`} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 border border-orange-100 shadow-sm flex flex-col justify-between h-[150px] group hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-orange-100/50 text-orange-600 flex items-center justify-center shrink-0">
              <CalendarDays size={24} />
            </div>
            <p className="text-4xl font-black text-orange-900">{stats.week}</p>
          </div>
          <div>
            <h3 className="font-bold text-orange-950 text-base">Agjenda e Javës</h3>
            <p className="text-orange-600/80 text-xs mt-1 font-semibold uppercase tracking-wider">Evente Këtë Javë</p>
          </div>
        </Link>

        <Link href={`/${locale}/biznes/rezervimet`} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100 shadow-sm flex flex-col justify-between h-[150px] group hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-100/50 text-blue-600 flex items-center justify-center shrink-0">
              <CalendarCheck size={24} />
            </div>
            <p className="text-4xl font-black text-blue-900">{stats.month}</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-950 text-base">Aktiviteti i Muajit</h3>
            <p className="text-blue-600/80 text-xs mt-1 font-semibold uppercase tracking-wider">Evente Këtë Muaj</p>
          </div>
        </Link>

        <Link href={`/${locale}/biznes/rezervimet`} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col justify-between h-[150px] group hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center shrink-0">
              <List size={24} />
            </div>
            <p className="text-4xl font-black text-emerald-900">{stats.total}</p>
          </div>
          <div>
            <h3 className="font-bold text-emerald-950 text-base">Historiku i Eventeve</h3>
            <p className="text-emerald-600/80 text-xs mt-1 font-semibold uppercase tracking-wider">Gjithsej në Sistem</p>
          </div>
        </Link>

      </div>

      {/* SEKSIONI I TABS (KALENDARI DHE LISTA) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 min-h-[500px]">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 capitalize">{currentMonthName}</h2>
            <p className="text-sm text-gray-500 mt-1">Pasqyra e eventeve për këtë muaj</p>
          </div>
          
          <div className="bg-gray-100 p-1.5 rounded-xl flex items-center w-full sm:w-auto">
            <button 
              onClick={() => setView('list')} 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={16} /> Lista
            </button>
            <button 
              onClick={() => setView('calendar')} 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <CalendarIcon size={16} /> Kalendari
            </button>
          </div>
        </div>

        {/* PAMJA E LISTËS */}
        {view === 'list' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {monthBookings.length > 0 ? monthBookings.map((booking: any) => (
              <div 
                key={booking.id} 
                onClick={() => setSelectedBooking(booking)}
                className="cursor-pointer flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all group gap-4 lg:gap-8"
              >
                <div className="flex items-center gap-4 w-full lg:w-auto lg:min-w-[280px]">
                  <div className="bg-gray-50 px-3 py-2 rounded-xl text-center border border-gray-100 shrink-0 group-hover:bg-white group-hover:border-emerald-200 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">{format(new Date(booking.event_date), 'MMM', { locale: currentLocale })}</p>
                    <p className="text-lg font-black text-gray-900 mt-1 leading-none">{format(new Date(booking.event_date), 'dd')}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{booking.clients?.name || "Klient i panjohur"}</h4>
                    <p className="text-xs text-gray-500 mt-1 font-semibold flex items-center gap-1.5">
                       {booking.event_type ? (
                         <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px]">{booking.event_type}</span>
                       ) : (
                         <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px]">Event</span>
                       )}
                       <span className="text-gray-300">•</span>
                       <Clock size={12}/> {format(new Date(booking.start_time), 'HH:mm')}
                    </p>
                  </div>
                </div>

                <div className="flex-1 w-full flex gap-6 lg:justify-center border-y lg:border-y-0 lg:border-x border-gray-100 py-3 lg:py-0 lg:px-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={10}/> Salla</span>
                    <span className="text-sm font-bold text-gray-700">{booking.halls?.name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><UsersRound size={10}/> Kapaciteti</span>
                    <span className="text-sm font-bold text-gray-700">{booking.participants} Pax</span>
                  </div>
                </div>

                <div className="w-full lg:w-auto text-left lg:text-right flex lg:flex-col items-center lg:items-end justify-between lg:min-w-[140px]">
                  {renderStatus(booking.status)}
                  <div className="lg:mt-2">
                    {renderFinanceBadge(booking.payment_status)}
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><List size={32}/></div>
                <p className="text-gray-900 font-bold">Nuk keni evente këtë muaj.</p>
                <p className="text-gray-500 text-sm mt-1">Lista do të shfaqet këtu sapo të shtohen rezervime.</p>
              </div>
            )}
          </div>
        )}

        {/* PAMJA E KALENDARIT */}
        {view === 'calendar' && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {['Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh', 'Di'].map(d => <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-gray-400 uppercase py-2">{d}</div>)}
              {blanks.map(i => <div key={`b-${i}`} className="h-20 sm:h-28 rounded-xl bg-transparent border border-dashed border-gray-100/50"></div>)}
              
              {days.map(day => {
                const dayBookings = monthBookings.filter((b: any) => new Date(b.event_date).getDate() === day);
                const hasEvent = dayBookings.length > 0;
                return (
                  <div key={day} className={`h-20 sm:h-28 rounded-xl p-1 sm:p-2 border transition-all flex flex-col overflow-hidden ${hasEvent ? 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-300 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
                    <span className={`text-xs sm:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${hasEvent ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500'}`}>{day}</span>
                    
                    <div className="flex flex-col gap-1 overflow-y-auto mt-1 no-scrollbar">
                      {dayBookings.map((b: any) => (
                        <button 
                          key={b.id} 
                          onClick={() => setSelectedBooking(b)}
                          className="text-left w-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500 hover:text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-1 rounded transition-colors truncate border border-emerald-500/20"
                          title={b.clients?.name}
                        >
                          {b.clients?.name || "Event"}
                        </button>
                      ))}
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