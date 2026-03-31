"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Phone, Mail, ArrowLeft, Save, FileDigit, MapPin, 
  CalendarCheck, Clock, CheckCircle2, AlertTriangle, PartyPopper, ChevronRight 
} from "lucide-react";
import Link from "next/link";
import { updateClientAction, getClientAction } from "../../actions"; // Vëmendje te PATH!
import { format } from "date-fns";
import { sq, enUS } from "date-fns/locale";
import { useTranslations } from "next-intl"; 

export default function EditClientPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  
  const t = useTranslations("EditClient");
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", personal_id: "", gender: "", city: ""
  });
  
  const [clientBookings, setClientBookings] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const data: any = await getClientAction(id);
      if (data) {
        setFormData({
          name: data.name || "", 
          phone: data.phone || "",
          email: data.email || "", 
          personal_id: data.personal_id || "", 
          gender: data.gender || "",
          city: data.city || ""
        });
        
        if(data.bookings) {
          setClientBookings(data.bookings);
        }
      } else {
        setToast({ show: true, message: t("notFound"), type: "error" });
      }
      setFetching(false);
    }
    loadData();
  }, [id, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" });

    try {
      const res = await updateClientAction(id, formData);
      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: t("successUpdate"), type: "success" });
        setTimeout(() => { router.push(`/${locale}/biznes/klientet`); }, 1500);
      }
    } catch (error) {
      setToast({ show: true, message: t("networkError"), type: "error" });
      setLoading(false);
    }
  };

  const renderStatus = (status: string) => {
    switch(status) {
      case 'confirmed':
      case 'completed':
        return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100"><CheckCircle2 size={10}/> {t("statusConfirmed")}</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100"><AlertTriangle size={10}/> {t("statusCancelled")}</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100"><Clock size={10}/> {t("statusPending")}</span>;
    }
  };

  const currentLocaleObj = locale === 'sq' ? sq : enUS;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 relative min-h-[80vh]">
      
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
             <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? t("successTitle") : t("warningTitle")}
            </h3>
            <p className="text-gray-500 text-sm mb-8">{toast.message}</p>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl ${toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-[#FF5C39] hover:bg-[#e84e2d]"}`}
            >
              {t("closeBtn")}
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <Link href={`/${locale}/biznes/klientet`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> {t("backBtn")}
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
           {t("pageTitle")}
        </h1>
        <p className="text-gray-500 mt-2 text-sm">{t("pageSubtitle")}</p>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">{t("personalDataTitle")}</h3>
            
            <div className="flex flex-col gap-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <Users size={14} /> {t("nameLabel")}
                </label>
                <input type="text" required className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-gray-50 font-bold text-gray-900" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <FileDigit size={14} /> {t("idLabel")}
                </label>
                <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-gray-50 font-medium text-gray-900" value={formData.personal_id} onChange={(e) => setFormData({...formData, personal_id: e.target.value})} />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <Phone size={14} /> {t("phoneLabel")}
                </label>
                <input type="text" required className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-gray-50 font-medium text-gray-900" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <MapPin size={14} /> {t("cityLabel")}
                </label>
                <input type="text" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-gray-50 font-medium text-gray-900" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <Mail size={14} /> {t("emailLabel")}
                </label>
                <input type="email" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-gray-50 font-medium text-gray-900" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <button type="submit" disabled={loading || fetching} className="w-full mt-4 bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-black disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-sm">
              <Save size={18} /> {loading ? t("savingBtn") : t("saveBtn")}
            </button>
          </form>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 min-h-full">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-8">
              <CalendarCheck className="text-gray-900"/> {t("historyTitle")}
            </h3>

            {clientBookings.length > 0 ? (
              <div className="space-y-4">
                {clientBookings.map((booking: any) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group gap-4">
                    
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center text-gray-700 shrink-0">
                        <PartyPopper size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                           {booking.event_type || t("eventFallback")} 
                           {renderStatus(booking.status)}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 font-semibold flex items-center gap-1.5">
                           <CalendarCheck size={12}/> {format(new Date(booking.event_date), 'dd MMM yyyy', { locale: currentLocaleObj })} 
                           <span className="text-gray-300">•</span> 
                           <MapPin size={12}/> {booking.halls?.name || t("hallFallback")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("totalInvoice")}</p>
                        <p className="font-black text-gray-900 text-lg">{Number(booking.total_amount).toFixed(2)} €</p>
                      </div>
                      <Link 
                        href={`/${locale}/biznes/rezervimet/ndrysho/${booking.id}`}
                        className="p-2.5 bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-400 rounded-xl transition-colors shrink-0"
                        title={t("viewBooking")}
                      >
                        <ChevronRight size={20} />
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <CalendarCheck size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("noEventTitle")}</h3>
                <p className="text-gray-500 text-sm max-w-sm">{t("noEventDesc")}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}