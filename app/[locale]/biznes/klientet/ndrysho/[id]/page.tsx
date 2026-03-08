"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Users, Phone, Mail, ArrowLeft, Save, FileDigit, MapPin } from "lucide-react";
import Link from "next/link";
import { updateClientAction, getClientAction } from "./actions";

export default function EditClientPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", personal_id: "", gender: "", city: ""
  });

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
      } else {
        setToast({ show: true, message: "Ky Klient nuk u gjet!", type: "error" });
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
      const res = await updateClientAction(id, formData);
      if (res?.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: "Të dhënat e klientit u përditësuan!", type: "success" });
        setTimeout(() => { router.push(`/${locale}/biznes/klientet`); }, 1500);
      }
    } catch (error) {
      setToast({ show: true, message: "Mungon interneti ose serveri nuk përgjigjet.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 relative min-h-[80vh]">
      
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
        <Link href={`/${locale}/biznes/klientet`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Kthehu te Klientët
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ndrysho Klientin</h1>
        <p className="text-gray-500 mt-2 text-sm">Përditëso të dhënat e kontaktit për këtë klient.</p>
      </div>

      <form onSubmit={handleSubmit} className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 flex flex-col gap-6 transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EMRI */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Users size={16} className="text-gray-400" /> Emri dhe Mbiemri
            </label>
            <input type="text" required placeholder="p.sh. Agim Ramadani" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          {/* NUMRI PERSONAL (TANI ËSHTË I SAKTË) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <FileDigit size={16} className="text-gray-400" /> Numri Personal (ID)
            </label>
            <input type="text" placeholder="p.sh. 1234567890" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.personal_id} onChange={(e) => setFormData({...formData, personal_id: e.target.value})} />
          </div>

          {/* GJINIA */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Users size={16} className="text-gray-400" /> Gjinia
            </label>
            <select className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
              <option value="">Zgjidh Gjininë</option>
              <option value="M">Mashkull</option>
              <option value="F">Femër</option>
            </select>
          </div>

          {/* TELEFONI */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Phone size={16} className="text-gray-400" /> Numri i Telefonit
            </label>
            <input type="text" required placeholder="p.sh. +383 44 123 456" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>

          {/* QYTETI */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <MapPin size={16} className="text-gray-400" /> Qyteti
            </label>
            <input type="text" placeholder="p.sh. Prishtinë" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
          </div>

          {/* EMAIL */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Mail size={16} className="text-gray-400" /> Adresa Email
            </label>
            <input type="email" placeholder="p.sh. email@shembull.com" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
        </div>

        <hr className="border-gray-100 mt-4 mb-2" />

        {/* BUTONI RUAJ */}
        <button type="submit" disabled={loading || fetching} className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-black disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-sm">
          <Save size={20} />
          {loading ? "Po Ruhet..." : "Ruaj Ndryshimet"}
        </button>

      </form>
    </div>
  );
}