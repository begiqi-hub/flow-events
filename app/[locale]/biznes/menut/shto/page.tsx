"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Utensils, AlignLeft, Banknote, ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { saveMenuAction } from "./actions";

export default function AddMenuPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale; // Kapim gjuhën automatikisht
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [compressedImage, setCompressedImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  
  const [formData, setFormData] = useState({
    name: "", description: "", price_per_person: ""
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
    setToast({ show: false, message: "", type: "success" });

    try {
      const res = await saveMenuAction({
        name: formData.name,
        description: formData.description,
        price_per_person: Number(formData.price_per_person),
        image: compressedImage
      });

      if (res.error) {
        setToast({ show: true, message: res.error, type: "error" });
        setLoading(false);
      } else {
        setToast({ show: true, message: "Menuja u ruajt me sukses!", type: "success" });
        setTimeout(() => {
          // Kthehemi te lista duke përdorur gjuhën e saktë
          router.push(`/${locale}/biznes/menut`);
        }, 1500);
      }
    } catch (error) {
      setToast({ show: true, message: "Mungon interneti ose serveri nuk përgjigjet.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 relative">
      
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
            <div className={`relative mx-auto -mt-16 mb-6 w-24 h-24 rounded-full flex items-center justify-center border-8 border-white shadow-lg ${toast.type === "success" ? "bg-[#F0FDF4] text-emerald-500" : "bg-[#FFF9F2] text-[#E6931E]"}`}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M12 22a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2zm6-6v2H6v-2l2-2V9a4 4 0 0 1 4-4 4 4 0 0 1 4 4v5l2 2z" />
              </svg>
              <div className={`absolute top-1 right-1 w-6 h-6 border-2 border-white rounded-full flex items-center justify-center ${toast.type === "success" ? "bg-emerald-500" : "bg-[#FF5C39]"}`}>
                <span className="text-white text-[10px] font-bold">1</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? "Sukses!" : "Kujdes!"}
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {toast.message}
            </p>

            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${toast.type === "success" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : "bg-[#FF5C39] hover:bg-[#e84e2d] shadow-orange-200"}`}
            >
              Mbyll <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href={`/${locale}/biznes/menut`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Kthehu te Menutë
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Krijo Menu të Re</h1>
            <p className="text-gray-500 mt-1 text-sm">Përcakto ushqimet dhe çmimin për person.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col gap-6">
          
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <ImageIcon size={18} className="text-blue-500" />
              Ngarko Foton e Menusë (Pjatës)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative overflow-hidden group">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-sm" />
              ) : (
                <>
                  <div className="bg-blue-50 p-3 rounded-full text-blue-500 mb-3"><ImageIcon size={24} /></div>
                  <p className="text-sm font-medium text-gray-700">Kliko për të ngarkuar foton</p>
                  <p className="text-xs text-gray-400 mt-1">Rekomandohet një foto e ushqimit ose pjatës kryesore</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Utensils size={16} className="text-gray-400" /> Emri i Menusë
              </label>
              <input type="text" required placeholder="p.sh. Menuja Tradicionale" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Banknote size={16} className="text-gray-400" /> Çmimi për person (€)
              </label>
              <input type="number" step="0.01" required placeholder="p.sh. 25.50" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 focus:ring-1" value={formData.price_per_person} onChange={(e) => setFormData({...formData, price_per_person: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <AlignLeft size={16} className="text-gray-400" /> Përmbajtja e Menusë
            </label>
            <textarea rows={4} required placeholder="Përshkruani se çfarë përfshin kjo menu (p.sh. Pjata e parë, Pjata e dytë, Pijet...)" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-gray-900 focus:ring-1 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <hr className="border-gray-100 my-2" />

          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-medium py-3.5 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 transition-colors shadow-sm flex items-center justify-center gap-2">
            <Save size={20} />
            {loading ? "Po Ruhet..." : "Ruaj Menunë"}
          </button>
        </form>
      </div>
    </div>
  );
}