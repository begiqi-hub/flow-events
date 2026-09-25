"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateListing } from "@/lib/actions/listingActions";
import { Loader2, Save, AlertCircle, CheckCircle2, UploadCloud, X } from "lucide-react";
import { EVENT_TYPES } from "@/lib/constants";
import MultiSelectEvent from "@/components/ui/MultiSelectEvent";

export default function ListingEditForm({ listing }: { listing: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // SHTUAR: Ndarja e eventeve nga databaza në një listë (Array) për Multi-Select
  const initialEvents = listing.type 
    ? listing.type.split(',').map((s: string) => s.trim()) 
    : ["Dasma"];
  const [selectedEvents, setSelectedEvents] = useState<string[]>(initialEvents);

  // State për UI-në e fushave (Për të shfaqur tik-un e gjelbër)
  const [fields, setFields] = useState({
    marketing_name: listing.marketing_name || "",
    marketing_description: listing.marketing_description || "",
    address: listing.address || "",
    youtube_url: listing.youtube_url || "",
  });

  // State për fotot
  const [mainImage, setMainImage] = useState<string>(listing.mainImage || "");
  const [gallery, setGallery] = useState<string[]>(Array.isArray(listing.gallery) ? listing.gallery : []);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  // Funksioni për kompresimin e fotove në WebP
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/webp", 0.7)); // WebP me 70% kualitet (Optimale)
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const files = e.target.files;
    if (!files) return;

    if (!isMain && gallery.length + files.length > 5) {
      alert("Mund të ngarkoni maksimumi 5 fotografi në galeri.");
      return;
    }

    try {
      if (isMain) {
        const compressed = await compressImage(files[0]);
        setMainImage(compressed);
      } else {
        const newImages = [];
        for (let i = 0; i < files.length; i++) {
          if (gallery.length + newImages.length < 5) {
            const compressed = await compressImage(files[i]);
            newImages.push(compressed);
          }
        }
        setGallery((prev) => [...prev, ...newImages]);
      }
    } catch (err) {
      alert("Gabim gjatë kompresimit të fotografisë.");
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    const data = {
      marketing_name: fields.marketing_name,
      marketing_description: fields.marketing_description,
      address: fields.address,
      youtube_url: fields.youtube_url,
      mainImage: mainImage, // Sigurohuni që variablat mainImage dhe gallery janë të disponueshme në komponentin tuaj
      gallery: gallery,
      status: formData.get("status") as "DRAFT" | "PUBLISHED" | "INACTIVE",
      
      type: selectedEvents.join(', '), 
    };

    const res = await updateListing(listing.id, data);

    if (res.success) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || "Ndodhi një gabim gjatë ruajtjes.");
    }
    
    setLoading(false);
  };

  const FieldTick = ({ value }: { value: string }) => {
    if (!value || value.trim().length === 0) return null;
    return <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-in zoom-in" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Seksioni i Marketingut (AI Style) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20"></div>
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">1</span>
          Të Dhënat e Marketingut
        </h3>
        
        <div className="space-y-5">
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Emri Publik i Sallës</label>
            <input 
              type="text" 
              name="marketing_name" 
              value={fields.marketing_name}
              onChange={handleFieldChange}
              placeholder={`P.sh. ${listing.hall.name} - Versioni Premium`}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all pr-12
                ${fields.marketing_name ? 'border-emerald-200 bg-emerald-50/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}
              `} 
            />
            <FieldTick value={fields.marketing_name} />
          </div>

          <div className="relative z-40">
            <MultiSelectEvent 
              selectedEvents={selectedEvents} 
              onChange={setSelectedEvents} 
            />
          </div>

          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Përshkrimi Rreth Sallës</label>
            <textarea 
              name="marketing_description" 
              value={fields.marketing_description}
              onChange={handleFieldChange}
              rows={4}
              placeholder="Shkruani një përshkrim tërheqës për klientët..."
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all resize-none
                ${fields.marketing_description ? 'border-emerald-200 bg-emerald-50/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}
              `} 
            />
          </div>

          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Adresa e Saktë (Lokacioni)</label>
            <input 
              type="text" 
              name="address" 
              value={fields.address}
              onChange={handleFieldChange}
              placeholder="P.sh. Rruga Agim Ramadani, Prishtinë"
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all pr-12
                ${fields.address ? 'border-emerald-200 bg-emerald-50/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}
              `} 
            />
            <FieldTick value={fields.address} />
          </div>
        </div>
      </div>

      {/* Seksioni i Mediave dhe Fotove */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20"></div>
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">2</span>
          Media & Fotot
        </h3>
        
        <div className="space-y-6">
          
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Video Prezantimi (YouTube Link)</label>
            <input 
              type="url" 
              name="youtube_url" 
              value={fields.youtube_url}
              onChange={handleFieldChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all pr-12
                ${fields.youtube_url ? 'border-emerald-200 bg-emerald-50/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}
              `} 
            />
            <FieldTick value={fields.youtube_url} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fotoja Kryesore */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Fotografia Kryesore (Cover)</label>
              <div className="relative w-full h-48 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center overflow-hidden cursor-pointer group">
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {mainImage ? (
                  <img src={mainImage} alt="Main" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-500">Kliko për të ngarkuar</span>
                  </div>
                )}
              </div>
            </div>

            {/* Galeria (Max 5) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Galeria (Max 5 foto)</label>
              <div className="grid grid-cols-3 gap-2">
                {gallery.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(index)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {gallery.length < 5 && (
                  <div className="relative aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-center">
                    <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, false)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <UploadCloud className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Statusi dhe Ruajtja */}
      <div className="bg-slate-900 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-auto">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Statusi i Listimit</label>
          <select 
            name="status" 
            defaultValue={listing.status}
            className="w-full md:w-64 bg-slate-800 border-none text-white rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/50 outline-none transition cursor-pointer"
          >
            <option value="DRAFT">Draft (E fshehur)</option>
            <option value="PUBLISHED">Publikuar (E dukshme)</option>
            <option value="INACTIVE">Joaktive</option>
          </select>
        </div>

        <div className="w-full md:w-auto flex flex-col items-end gap-2">
          {error && <span className="text-sm font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {error}</span>}
          {success && <span className="text-sm font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Ndryshimet u ruajtën!</span>}
          
          <button disabled={loading} type="submit" className="w-full md:w-auto px-8 py-3.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? "Po ruhet..." : "Ruaj Ndryshimet"}
          </button>
        </div>
      </div>

    </form>
  );
}