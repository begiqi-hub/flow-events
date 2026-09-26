"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateListing } from "@/lib/actions/listingActions";
import { Loader2, Globe, EyeOff, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";

export default function ListingClientForm({ 
  listingId, 
  isReady, 
  currentStatus 
}: { 
  listingId: string; 
  isReady: boolean; 
  currentStatus: string; 
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isPublished = currentStatus === "PUBLISHED";

  const handlePublishToggle = async () => {
    setLoading(true);
    const newStatus = isPublished ? "DRAFT" : "PUBLISHED";
    
    const res = await updateListing(listingId, { status: newStatus });
    
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Ndodhi një gabim gjatë përditësimit të statusit.");
    }
    setLoading(false);
  };

  return (
    <div className={`relative overflow-hidden p-6 lg:p-8 rounded-[2rem] transition-all duration-500 h-full flex flex-col justify-between
      ${isPublished 
        ? 'bg-white border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/10' 
        : 'bg-white border border-slate-200 shadow-sm'}
    `}>
      
      {/* Sfondi Dekorativ (Glow Blob) */}
      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-40 pointer-events-none transition-all duration-1000
        ${isPublished ? 'bg-emerald-400' : 'bg-slate-200'}
      `}></div>

      <div className="relative z-10">
        {/* Header i Kartës (Ikona dhe Statusi) */}
        <div className="flex items-start justify-between mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition-colors
            ${isPublished ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}
          `}>
            {isPublished ? <Globe className="w-7 h-7" /> : <EyeOff className="w-7 h-7" />}
          </div>

          <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border
            ${isPublished ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}
          `}>
            {isPublished ? (
              <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> LIVE</>
            ) : (
              <>DRAFT</>
            )}
          </div>
        </div>

        {/* Përmbajtja e Tekstit */}
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
            {isPublished ? "Salla është Publike" : "Salla është e fshehur"}
          </h3>
          <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
            {isPublished 
              ? "Kjo sallë është e dukshme në marketplace-in e HALLEVO.COM dhe klientët e rinj mund t'ju dërgojnë kërkesa." 
              : "Plotësoni të dhënat dhe publikojeni sallën tuaj për të filluar pranimin e kërkesave nga klientët në HALLEVO."}
          </p>
        </div>
      </div>

      {/* Veprimi (Butoni ose Paralajmërimi) */}
      <div className="relative z-10 mt-auto">
        {!isReady && !isPublished ? (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-700 leading-snug">
              Mungon fotografia kryesore. Ju lutem ngarkoni të paktën një foto te seksioni "Media & Fotot" për të lejuar publikimin.
            </p>
          </div>
        ) : (
          <button 
            onClick={handlePublishToggle}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all duration-300
              ${isPublished 
                ? 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'}
            `}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPublished ? (
              <>Fshih nga Publiku <EyeOff className="w-4 h-4" /></>
            ) : (
              <><Sparkles className="w-4 h-4 text-yellow-300" /> Publiko Sallën Tani</>
            )}
          </button>
        )}
        
        {/* Trust Badge që shfaqet vetëm kur është Live */}
        {isPublished && (
          <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest text-center mt-4 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> E verifikuar dhe Publike
          </p>
        )}
      </div>

    </div>
  );
}