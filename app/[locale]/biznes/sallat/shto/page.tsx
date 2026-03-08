"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Users, ArrowLeft, Save, Image as ImageIcon, Car, Wind, AlignLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { saveHallAction } from "./actions";

export default function AddHallPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State për Popup-in e ri (Toast)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [compressedImage, setCompressedImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  
  // Hoqëm 'price'
  const [formData, setFormData] = useState({
    name: "", capacity: "", description: "", parking: true, ac: true
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; 
        const scaleSize = MAX_WIDTH / img.width;
        
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setCompressedImage(dataUrl);
      };
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: "", type: "success" }); // Fsheh popup-in e vjetër

    try {
      const res = await saveHallAction({
        name: formData.name,
        capacity: Number(formData.capacity),
        description: formData.description,
        parking: formData.parking,
        ac: formData.ac,
        image: compressedImage
      });

      // Kontrollojmë përgjigjen e re të sigurt nga serveri
      if (res.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false); // Zhbllokon butonin
      } else {
        setToast({ show: true, message: "Salla u ruajt me sukses!", type: "success" });
        // Presim 1.5 sekonda që klienti të shohë mesazhin e suksesit, pastaj e kthejmë mbrapa
        setTimeout(() => {
          router.push("/biznes/sallat");
        }, 1500);
      }
    } catch (error) {
      setToast({ show: true, message: "Mungon interneti ose serveri nuk përgjigjet.", type: "error" });
      setLoading(false); // Zhbllokon butonin
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 relative">
      
      {/* POPUP-i MODERN (TOAST) */}
      {toast.show && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 text-white font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/biznes/sallat" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Kthehu te Sallat
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Shto Hapësirë / Sallë</h1>
            <p className="text-gray-500 mt-1 text-sm">Plotëso specifikat për ta bërë sallën tënde më tërheqëse.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <ImageIcon size={18} className="text-blue-500" /> Ngarko Foton e Sallës
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative overflow-hidden group">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-sm" />
              ) : (
                <>
                  <div className="bg-blue-50 p-3 rounded-full text-blue-500 mb-3"><ImageIcon size={24} /></div>
                  <p className="text-sm font-medium text-gray-700">Kliko për të ngarkuar foton</p>
                  <p className="text-xs text-gray-400 mt-1">Sistemi e kompreson automatikisht për shpejtësi</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 size={16} className="text-gray-400" /> Emri i Sallës
              </label>
              <input type="text" required placeholder="p.sh. Salla Diamant" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users size={16} className="text-gray-400" /> Kapaciteti (Maksimal)
              </label>
              <input type="number" required placeholder="p.sh. 300" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
            </div>
          </div>

          {/* Opsionet e Sallës (Parkim & Klimë) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                <Car size={18} className="text-gray-400 group-hover:text-blue-500" /> Ka Parkim të dedikuar?
              </div>
              <input type="checkbox" className="w-5 h-5 accent-gray-900 cursor-pointer" checked={formData.parking} onChange={(e) => setFormData({...formData, parking: e.target.checked})} />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                <Wind size={18} className="text-gray-400 group-hover:text-blue-500" /> Klimatizim qendror?
              </div>
              <input type="checkbox" className="w-5 h-5 accent-gray-900 cursor-pointer" checked={formData.ac} onChange={(e) => setFormData({...formData, ac: e.target.checked})} />
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <AlignLeft size={16} className="text-gray-400" /> Përshkrimi i Sallës
            </label>
            <textarea rows={3} placeholder="Përshkruani detajet që e bëjnë këtë sallë të veçantë..." className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 focus:ring-1 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <hr className="border-gray-100 my-2" />

          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-medium py-3.5 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 transition-colors shadow-sm flex items-center justify-center gap-2">
            <Save size={20} />
            {loading ? "Po Ruhet..." : "Ruaj Sallën"}
          </button>
        </form>
      </div>
    </div>
  );
}