"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarDays, Clock, Users, Banknote, CreditCard, 
  ArrowLeft, Save, User, MapPin, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { getBookingAction, updateBookingAction } from "./actions";

export default function EditBookingPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    client_name: "",
    hall_name: "",
    hall_id: "",
    event_date: "",
    start_time: "",
    end_time: "",
    participants: "",
    total_amount: "",
    payment_status: "pending",
    deposit_amount: "",
    status: "confirmed"
  });

  // Funksion ndihmës për të marrë orën në formatin HH:mm nga Databaza
  const formatTimeForInput = (dateObj: any) => {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  useEffect(() => {
    async function loadData() {
      const data = await getBookingAction(id);
      if (data) {
        setFormData({
          client_name: data.clients?.name || "Klient i panjohur",
          hall_name: data.halls?.name || "Sallë e panjohur",
          hall_id: data.hall_id || "",
          event_date: data.event_date ? new Date(data.event_date).toISOString().split('T')[0] : "",
          start_time: formatTimeForInput(data.start_time),
          end_time: formatTimeForInput(data.end_time),
          participants: data.participants?.toString() || "",
          total_amount: data.total_amount?.toString() || "0",
          payment_status: data.payment_status || "pending",
          deposit_amount: data.deposit_amount?.toString() || "", // Nëse e ke në DB
          status: data.status || "confirmed"
        });
      } else {
        setToast({ show: true, message: "Rezervimi nuk u gjet!", type: "error" });
      }
      setFetching(false);
    }
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    try {
      const res = await updateBookingAction(id, formData);
      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: "Rezervimi u përditësua me sukses!", type: "success" });
        // E dërgojmë përdoruesin tek Raportet ose Rezervimet pas suksesit
        setTimeout(() => { router.push(`/${locale}/biznes/rezervimet`); }, 1500);
      }
    } catch (error) {
      setToast({ show: true, message: "Mungon interneti ose serveri nuk përgjigjet.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 relative min-h-[80vh]">
      
      {/* POPUP I GABIMIT/SUKSESIT */}
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
             <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? "Sukses!" : "Kujdes!"}
            </h3>
            <p className="text-gray-500 text-sm mb-8">{toast.message}</p>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl ${toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-[#FF5C39] hover:bg-[#e84e2d]"}`}
            >
              Mbyll
            </button>
          </div>
        </div>
      )}

      {/* KOKA E FAQES */}
      <div className="mb-8">
        <Link href={`/${locale}/biznes/rezervimet`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Kthehu te Rezervimet
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ndrysho Rezervimin</h1>
        <p className="text-gray-500 mt-2 text-sm">Përditëso datën, orarin apo statusin e pagesës për këtë event.</p>
      </div>

      <form onSubmit={handleSubmit} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* SEKSIONI 1: TË DHËNAT BAZË (READ-ONLY) */}
        <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <User size={14} /> Klienti
            </label>
            <div className="p-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 cursor-not-allowed">
              {formData.client_name}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <MapPin size={14} /> Salla e Zgjedhur
            </label>
            <div className="p-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 cursor-not-allowed">
              {formData.hall_name}
            </div>
          </div>
        </div>

        {/* SEKSIONI 2: ORARI DHE DETAJET */}
        <div className="p-6 md:p-8 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CalendarDays size={20} className="text-blue-500"/> Detajet e Eventit
            </h3>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Data e Eventit</label>
            <input type="date" required className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fillon</label>
              <input type="time" required className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mbaron</label>
              <input type="time" required className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pjesëmarrës (Pax)</label>
            <div className="relative">
              <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" required className="w-full border border-gray-200 p-4 pl-12 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.participants} onChange={(e) => setFormData({...formData, participants: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SEKSIONI 3: FINANCAT DHE PAGESA */}
        <div className="p-6 md:p-8 bg-emerald-50/30 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Banknote size={20} className="text-emerald-500"/> Financat dhe Statusi
            </h3>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Totali për t'u paguar (€)</label>
            <div className="relative">
              <Banknote size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" step="0.01" required className="w-full border border-gray-200 p-4 pl-12 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 bg-white font-black text-emerald-700 text-lg" value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Statusi i Pagesës</label>
            <div className="relative">
              <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select className="w-full border border-gray-200 p-4 pl-12 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-bold text-gray-900 appearance-none" value={formData.payment_status} onChange={(e) => setFormData({...formData, payment_status: e.target.value})}>
                <option value="pending">Në Pritje (E Papaguar)</option>
                <option value="deposit">Ka lënë Paradhënie</option>
                <option value="paid">E Paguar Plotësisht</option>
              </select>
            </div>
          </div>

          {/* Shfaqet vetëm nëse pagesa është "deposit" */}
          <div className={`transition-opacity duration-300 ${formData.payment_status === 'deposit' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Shuma e Paradhënies (€)</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="p.sh. 500"
              className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 bg-white font-bold text-gray-900" 
              value={formData.deposit_amount} 
              onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})} 
              disabled={formData.payment_status !== 'deposit'}
            />
          </div>
        </div>

        {/* SEKSIONI 4: STATUSI I EVENTIT DHE RUAJTJA */}
        <div className="p-6 md:p-8 bg-gray-900 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gjendja e Eventit</label>
            <select className="bg-gray-800 border border-gray-700 text-white p-3 rounded-xl outline-none focus:border-white font-bold min-w-[200px]" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="confirmed">🟢 E Konfirmuar</option>
              <option value="pending">🟡 Në Pritje</option>
              <option value="cancelled">🔴 E Anuluar</option>
            </select>
          </div>

          <button type="submit" disabled={loading || fetching} className="w-full sm:w-auto bg-emerald-500 text-white font-bold py-4 px-10 rounded-xl hover:bg-emerald-400 disabled:bg-gray-600 transition-all flex items-center justify-center gap-2 shadow-lg">
            <Save size={20} />
            {loading ? "Po Ruhet..." : "Ruaj Ndryshimet"}
          </button>
        </div>

      </form>
    </div>
  );
}