"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  PlusCircle, Search, Calendar, MapPin, CheckCircle2, Wallet, 
  AlertCircle, Edit, Eye, XCircle, Clock4, User, ArrowRightLeft, UserCircle, Phone, Sparkles
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isPast } from "date-fns";
import DownloadInvoiceBtn from "./DownloadInvoiceBtn";

export default function BookingsClient({ initialBookings, business, locale }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [financeFilter, setFinanceFilter] = useState("all");
  const [viewBooking, setViewBooking] = useState<any>(null);

  const filteredBookings = useMemo(() => {
    return initialBookings.filter((booking: any) => {
      const eventDate = new Date(booking.event_date);
      const isWithinDate = eventDate >= new Date(dateRange.from) && eventDate <= new Date(dateRange.to);

      const searchMatch = 
        booking.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.clients?.phone?.includes(searchTerm) ||
        booking.halls?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      let currentStatus = booking.status;
      if (currentStatus === "confirmed" && isPast(eventDate)) {
        currentStatus = "completed";
      }
      const statusMatch = statusFilter === "all" || currentStatus === statusFilter;
      const financeMatch = financeFilter === "all" || booking.payment_status === financeFilter;

      return isWithinDate && searchMatch && statusMatch && financeMatch;
    });
  }, [initialBookings, dateRange, searchTerm, statusFilter, financeFilter]);

  const stats = useMemo(() => {
    let upcoming = 0, completed = 0, postponed = 0, cancelled = 0;
    filteredBookings.forEach((b: any) => {
      if (b.status === "cancelled") cancelled++;
      else if (b.status === "postponed") postponed++;
      else if (isPast(new Date(b.event_date))) completed++;
      else upcoming++;
    });
    return { upcoming, completed, postponed, cancelled };
  }, [filteredBookings]);

  const EventBadge = ({ status, eventDate }: { status: string, eventDate: Date }) => {
    if (status === 'cancelled') return <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-[11px] font-bold flex items-center gap-1 w-fit"><XCircle size={12}/> E Anuluar</span>;
    if (status === 'postponed') return <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1 w-fit"><ArrowRightLeft size={12}/> E Shtyer</span>;
    if (isPast(eventDate)) return <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> E Realizuar</span>;
    return <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1 w-fit"><Clock4 size={12}/> Në Ardhje</span>;
  };

  const PaymentBadge = ({ status }: { status: string }) => {
    if (status === 'paid') return <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">E Paguar</span>;
    if (status === 'deposit') return <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">Paradhënie</span>;
    return <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">E Papaguar</span>;
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 relative">
      
      {/* POPUP (MODAL) PËR BUTONIN "SHIKO" */}
      {viewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Eye className="text-blue-500" /> Detajet e Rezervimit
              </h3>
              <button onClick={() => setViewBooking(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors">
                <XCircle size={24}/>
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Të dhënat e Klientit</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><User size={14}/> Emri:</p>
                    <p className="font-bold text-gray-900">{viewBooking.clients?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={14}/> Telefoni:</p>
                    <p className="font-bold text-gray-900">{viewBooking.clients?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Detajet e Eventit</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14}/> Data:</p>
                    <p className="font-bold text-gray-900">{format(new Date(viewBooking.event_date), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Clock4 size={14}/> Orari:</p>
                    <p className="font-bold text-gray-900">{format(new Date(viewBooking.start_time), 'HH:mm')} - {format(new Date(viewBooking.end_time), 'HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14}/> Salla:</p>
                    <p className="font-bold text-gray-900">{viewBooking.halls?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><User size={14}/> Të ftuar (Pax):</p>
                    <p className="font-bold text-gray-900">{viewBooking.participants} persona</p>
                  </div>
                </div>
              </div>

              {viewBooking.booking_extras && viewBooking.booking_extras.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-3">Shërbime Ekstra të Zgjedhura</p>
                  <div className="space-y-2">
                    {viewBooking.booking_extras.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700 flex items-center gap-2"><Sparkles size={14} className="text-purple-400"/> {item.extras?.name}</span>
                        <span className="font-bold text-gray-900">+{Number(item.line_total).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Totali i Kontratës</p>
                  <p className="text-2xl font-black text-gray-900">{Number(viewBooking.total_amount).toFixed(2)} €</p>
                </div>
                <div className="text-right">
                  <PaymentBadge status={viewBooking.payment_status} />
                </div>
              </div>

              {viewBooking.status === 'cancelled' && viewBooking.cancel_reason && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Arsyeja e Anulimit</p>
                  <p className="text-sm font-bold text-red-900">{viewBooking.cancel_reason}</p>
                </div>
              )}

              {/* HISTORIKU NË POPUP */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Historiku i Eventit</p>
                 <p className="text-sm font-medium text-gray-700">Regjistruar: <strong>{format(new Date(viewBooking.created_at), 'dd.MM.yyyy HH:mm')}</strong> nga {business?.name || 'Administratori'}</p>
                 {viewBooking.updated_at && new Date(viewBooking.updated_at).getTime() - new Date(viewBooking.created_at).getTime() > 2000 && (
                   <p className="text-sm font-medium text-blue-600 mt-1">Ndryshuar: <strong>{format(new Date(viewBooking.updated_at), 'dd.MM.yyyy HH:mm')}</strong> nga {business?.name || 'Administratori'}</p>
                 )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <DownloadInvoiceBtn booking={viewBooking} business={business} />
              
              <Link href={`/${locale}/biznes/rezervimet/ndrysho/${viewBooking.id}`} className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md">
                <Edit size={16} /> Ndrysho
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pjesa tjetër e faqes (List/Tabela) Mbetet 100% njësoj */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Menaxhimi i Rezervimeve</h1>
          <p className="text-gray-500 font-medium mt-1">Ndiqni eventet, pagesat dhe kontratat në kohë reale.</p>
        </div>
        <Link href={`/${locale}/biznes/rezervimet/shto`} className="bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
          <PlusCircle size={20} /> Rezervim i Ri
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><Clock4 size={16}/> Në Ardhje</p>
          <p className="text-3xl font-black text-gray-900">{stats.upcoming}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><CheckCircle2 size={16}/> Të Realizuara</p>
          <p className="text-3xl font-black text-gray-900">{stats.completed}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><ArrowRightLeft size={16}/> Të Shtyera</p>
          <p className="text-3xl font-black text-gray-900">{stats.postponed}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-red-600 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><XCircle size={16}/> Të Anuluara</p>
          <p className="text-3xl font-black text-gray-900">{stats.cancelled}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Kërko Klient / Sallë</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Kërko..." className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-gray-900 text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Nga Data</label>
          <input type="date" className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-gray-900 text-sm font-medium" value={dateRange.from} onChange={(e) => setDateRange({...dateRange, from: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Deri Data</label>
          <input type="date" className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-gray-900 text-sm font-medium" value={dateRange.to} onChange={(e) => setDateRange({...dateRange, to: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Statusi i Eventit</label>
          <select className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-gray-900 text-sm font-medium" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Të Gjitha</option>
            <option value="confirmed">Në Ardhje</option>
            <option value="completed">Të Realizuara</option>
            <option value="postponed">Të Shtyera</option>
            <option value="cancelled">Të Anuluara</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Financat</label>
          <select className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-gray-900 text-sm font-medium" value={financeFilter} onChange={(e) => setFinanceFilter(e.target.value)}>
            <option value="all">Të Gjitha</option>
            <option value="pending">E Papaguar</option>
            <option value="deposit">Me Paradhënie</option>
            <option value="paid">E Paguar Plotësisht</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="py-4 px-5 text-xs font-extrabold text-gray-500 uppercase">Klienti & Eventi</th>
                <th className="py-4 px-5 text-xs font-extrabold text-gray-500 uppercase">Detajet (Salla / Pax)</th>
                <th className="py-4 px-5 text-xs font-extrabold text-gray-500 uppercase">Statuset</th>
                <th className="py-4 px-5 text-xs font-extrabold text-gray-500 uppercase">Financat</th>
                <th className="py-4 px-5 text-xs font-extrabold text-gray-500 uppercase">Regjistroi</th>
                <th className="py-4 px-5 text-xs font-extrabold text-gray-500 uppercase text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.length > 0 ? filteredBookings.map((booking: any) => {
                const total = Number(booking.total_amount) || 0;
                const depositPaid = booking.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
                const remaining = total - depositPaid;
                const eventDateObj = new Date(booking.event_date);

                return (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <Link href={`/${locale}/biznes/klientet/${booking.client_id}`} className="text-sm font-bold text-gray-900 hover:text-emerald-600 transition-colors block mb-0.5">
                        {booking.clients?.name || "Klient i panjohur"}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-1">
                        <Calendar size={12}/> {format(eventDateObj, 'dd MMM yyyy')}
                        <span className="text-gray-300">|</span>
                        <Clock4 size={12}/> {format(new Date(booking.start_time), 'HH:mm')}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-sm font-bold text-gray-700 mb-0.5 flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> {booking.halls?.name || "N/A"}</p>
                      <p className="text-xs text-gray-500 font-medium ml-5">{booking.participants} persona (Pax)</p>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1.5">
                        <EventBadge status={booking.status} eventDate={eventDateObj} />
                        <PaymentBadge status={booking.payment_status} />
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center gap-4 text-sm">
                          <span className="text-gray-500 font-medium">Totali:</span>
                          <span className="font-black text-gray-900">{total.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 text-xs">
                          <span className="text-gray-500">Paradhënie:</span>
                          <span className="font-bold text-amber-600">{depositPaid.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 text-xs pt-1 border-t border-gray-100">
                          <span className="text-gray-500 font-bold">Mbetja:</span>
                          <span className="font-black text-red-500">{remaining > 0 ? remaining.toFixed(2) : "0.00"} €</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 mb-1">
                        <UserCircle size={14} className="text-gray-400"/>
                        <span className="text-xs font-bold text-gray-700">{business.name} (Admin)</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium ml-5 flex flex-col">
                        <span>Krijuar: {format(new Date(booking.created_at), 'dd.MM.yy')}</span>
                      </p>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button onClick={() => setViewBooking(booking)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors tooltip" title="Shiko Detajet">
                          <Eye size={16} />
                        </button>
                        <Link href={`/${locale}/biznes/rezervimet/ndrysho/${booking.id}`} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors tooltip" title="Ndrysho Marreveshjen">
                          <Edit size={16} />
                        </Link>
                        <DownloadInvoiceBtn booking={booking} business={business} />
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Nuk u gjet asnjë rezervim</h3>
                    <p className="text-gray-500 text-sm">Provoni të ndryshoni datat ose filtrat e kërkimit.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}