"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, ChevronRight, Clock, X, 
  Maximize, Minimize, MapPin, UsersRound, Utensils, Info, ArrowLeft, PartyPopper, Calendar as CalendarIcon, Plus, Save, AlertCircle
} from "lucide-react";
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, addMonths, subMonths, 
  isSameMonth, isSameDay, isToday, parseISO 
} from "date-fns";
import { sq, enUS } from "date-fns/locale"; 
import Link from "next/link";
import { createInquiryAction } from "./actions"; 

export default function RecepsioniClient({ bookings, halls, business, locale, currentDateStr }: any) {
  const router = useRouter();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "", client_phone: "", event_type: "", event_date: "",
    start_time: "18:00", end_time: "23:59", participants: "", hall_id: "", notes: ""
  });
  
  const currentLocaleObj = locale === 'sq' ? sq : enUS;
  const currentDate = currentDateStr ? parseISO(currentDateStr) : new Date();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 60000);
    return () => clearInterval(interval);
  }, [router]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleAddInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const res = await createInquiryAction(formData);
    
    if (res.error) {
      alert(res.error);
    } else {
      setFormData({ client_name: "", client_phone: "", event_type: "", event_date: "", start_time: "18:00", end_time: "23:59", participants: "", hall_id: "", notes: "" });
      setIsAddModalOpen(false);
      router.refresh();
    }
    setIsSubmitting(false);
  };

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
  const daysInGrid = eachDayOfInterval({ start: startDate, end: endDate });
  const prevMonthDate = format(subMonths(currentDate, 1), 'yyyy-MM-dd');
  const nextMonthDate = format(addMonths(currentDate, 1), 'yyyy-MM-dd');

  const colorPalette = [
    'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
    'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200',
  ];

  const hallColors: Record<string, string> = {};
  (halls || []).forEach((hall: any, index: number) => {
    hallColors[hall.id] = colorPalette[index % colorPalette.length];
  });

  const weekDays = locale === 'sq' 
    ? ["E Hënë", "E Martë", "E Mërkurë", "E Enjte", "E Premte", "E Shtunë", "E Diel"]
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="fixed inset-0 z-[100] bg-[#F4F6F8] overflow-y-auto flex flex-col font-sans">
      
      {/* HEADER */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/biznes`} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Kthehu te Dashboard">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">{business?.name} - RECEPSIONI</h1>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Auto-Refresh Aktiv
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Legjenda:</span>
          
          {/* SHTUAM LEGJENDËN E KËRKESAVE */}
          <div className="px-2.5 py-1 rounded-md text-[11px] font-bold border bg-amber-50 text-amber-800 border-amber-300 border-dashed border-2">
            Kërkesë (Në Pritje)
          </div>

          {(halls || []).map((h: any) => (
            <div key={h.id} className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${hallColors[h.id] || 'bg-gray-100 text-gray-800'}`}>
              {h.name}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm"
          >
            <Plus size={18} /> Shto Kërkesë
          </button>

          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            <Link href={`/${locale}/recepsioni?date=${prevMonthDate}`} className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-600">
              <ChevronLeft size={20} />
            </Link>
            <h2 className="text-sm font-bold text-gray-900 min-w-[120px] text-center capitalize">
              {format(currentDate, "MMMM yyyy", { locale: currentLocaleObj })}
            </h2>
            <Link href={`/${locale}/recepsioni?date=${nextMonthDate}`} className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-600">
              <ChevronRight size={20} />
            </Link>
          </div>
          <button onClick={toggleFullScreen} className="p-2.5 bg-gray-900 hover:bg-black text-white rounded-xl transition-colors shadow-md" title="Full Screen">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 shrink-0">
            {weekDays.map((day) => (
              <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {daysInGrid.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);
              const daysBookings = (bookings || []).filter((b: any) => isSameDay(new Date(b.event_date), day));

              return (
                <div key={day.toString()} className={`border-r border-b border-gray-100 p-2 flex flex-col transition-colors ${!isCurrentMonth ? 'bg-gray-50/40' : 'bg-white'} ${idx % 7 === 6 ? 'border-r-0' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${isTodayDate ? 'bg-blue-600 text-white shadow-md' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar flex-1">
                    {daysBookings.map((booking: any) => {
                      
                      // LOGJIKA KRYESORE PËR DALLIMIN E KËRKESAVE (PENDING)
                      const isPending = booking.status === 'pending';
                      
                      const colorClass = isPending 
                        ? 'bg-amber-50 text-amber-800 border-amber-300 border-dashed border-[2px] hover:bg-amber-100' // E verdhë me vija
                        : (hallColors[booking.hall_id] || 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'); // E Konfirmuar (Ngjyra e sallës)
                      
                      return (
                        <button 
                          key={booking.id} 
                          onClick={() => setSelectedBooking(booking)}
                          className={`text-left w-full px-2.5 py-2 rounded-lg text-xs font-bold truncate transition-all shadow-sm ${colorClass}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 opacity-80">
                              <Clock size={10} /> {format(new Date(booking.start_time), "HH:mm")}
                            </div>
                            
                            {/* BADGE "KËRKESË" NËSE ËSHTË PENDING */}
                            {isPending ? (
                              <span className="text-[9px] uppercase tracking-widest bg-amber-500 text-white px-1.5 py-0.5 rounded font-black animate-pulse flex items-center gap-1">
                                <AlertCircle size={8}/> Kërkesë
                              </span>
                            ) : (
                              <span className="text-[9px] uppercase tracking-widest opacity-70">
                                {booking.halls?.name?.substring(0, 10)}
                              </span>
                            )}
                          </div>
                          
                          <span className="truncate block text-[13px]">{booking.clients?.name}</span>
                          
                          <div className="flex items-center gap-2 mt-1 opacity-80 text-[10px] font-medium">
                             <span className="flex items-center gap-1"><UsersRound size={10}/> {booking.participants}</span>
                             <span className="flex items-center gap-1"><PartyPopper size={10}/> {booking.event_type || 'Event'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <form onSubmit={handleAddInquiry} className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-black text-blue-900 flex items-center gap-2">
                  <Plus className="text-blue-500" /> Regjistro një Kërkesë të Re
                </h3>
                <p className="text-xs font-semibold text-blue-600 mt-1">Kjo do të ruhet si "Në Pritje" që ta shqyrtojë menaxheri.</p>
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Emri i Klientit</label>
                  <input type="text" required placeholder="Psh. Agim Rama" className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-400 text-gray-800 font-medium" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefoni</label>
                  <input type="text" required placeholder="+383 4X XXX XXX" className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-400 text-gray-800 font-medium" value={formData.client_phone} onChange={(e) => setFormData({...formData, client_phone: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data e Eventit</label>
                  <input type="date" required className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-400 text-gray-800 font-medium" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ora (Nga - Deri)</label>
                  <div className="flex items-center gap-2">
                    <input type="time" required className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-400 text-gray-800 font-medium" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                    <span className="text-gray-300">-</span>
                    <input type="time" required className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-400 text-gray-800 font-medium" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Të Ftuar (pax)</label>
                  <input type="number" required placeholder="Psh: 250" className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-400 text-gray-800 font-medium" value={formData.participants} onChange={(e) => setFormData({...formData, participants: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipi (Opsionale)</label>
                  <input type="text" placeholder="Dasëm, Fejesë..." className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-400 text-gray-800 font-medium" value={formData.event_type} onChange={(e) => setFormData({...formData, event_type: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Salla (Preferenca)</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-400 text-gray-800 font-medium" value={formData.hall_id} onChange={(e) => setFormData({...formData, hall_id: e.target.value})}>
                    <option value="">E pacaktuar</option>
                    {(halls || []).map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shënime nga Recepsioni (Kërkesat e klientit)</label>
                <textarea 
                  required
                  placeholder="Shëno detajet e bisedës me klientin..."
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-400 text-gray-800 font-medium h-24 resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors text-sm">
                Anulo
              </button>
              <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md text-sm">
                {isSubmitting ? "Po ruhet..." : <><Save size={18} /> Ruaj Kërkesën</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Info className="text-blue-500" /> Detajet Operative
              </h3>
              <button onClick={() => setSelectedBooking(null)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                   <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Klienti</p>
                   <p className="text-2xl font-black text-gray-900">{selectedBooking.clients?.name}</p>
                   <p className="text-sm font-bold text-blue-600">{selectedBooking.clients?.phone}</p>
                 </div>
                 
                 {/* SHFAQ STATUSIN NË VEND TË SALLËS NËSE ËSHTË NË PRITJE */}
                 {selectedBooking.status === 'pending' ? (
                   <div className="px-4 py-2 rounded-xl text-center border bg-amber-100 border-amber-300">
                      <p className="text-[10px] text-amber-800 uppercase tracking-widest opacity-80">Statusi</p>
                      <p className="font-black text-amber-900 text-sm">NË PRITJE (KËRKESË)</p>
                   </div>
                 ) : (
                   <div className={`px-4 py-2 rounded-xl text-center border ${hallColors[selectedBooking.hall_id] || 'bg-gray-100'}`}>
                      <p className="text-[10px] uppercase tracking-widest opacity-80">Salla</p>
                      <p className="font-black text-sm">{selectedBooking.halls?.name || "E Pacaktuar"}</p>
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-gray-100 py-6">
                 <div>
                   <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1"><CalendarIcon size={12}/> Data</p>
                   <p className="font-bold text-gray-900">{format(new Date(selectedBooking.event_date), 'dd.MM.yyyy')}</p>
                 </div>
                 <div>
                   <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1"><Clock size={12}/> Ora</p>
                   <p className="font-bold text-gray-900">{format(new Date(selectedBooking.start_time), 'HH:mm')} - {format(new Date(selectedBooking.end_time), 'HH:mm')}</p>
                 </div>
                 <div>
                   <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1"><UsersRound size={12}/> Të ftuar</p>
                   <p className="font-bold text-gray-900">{selectedBooking.participants} pax</p>
                 </div>
              </div>

              <div>
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2"><Utensils size={12}/> Përgatitja / Ushqimi</p>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="font-bold text-gray-800 text-sm mb-1">{selectedBooking.menus?.name || "Pa menu ushqimi (Vetëm Qira)"}</p>
                    <p className="text-xs text-gray-500 font-medium">Lloji i eventit: {selectedBooking.event_type || 'N/A'}</p>
                 </div>
              </div>

              {selectedBooking.staff_notes && (
                <div>
                   <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-2">Shënime për Stafin</p>
                   <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-900 text-sm font-medium">
                      {selectedBooking.staff_notes}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}