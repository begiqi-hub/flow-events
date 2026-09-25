// app/[locale]/biznes/listing/[hallId]/ListingClientForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateListing } from "@/lib/actions/listingActions"; // Kujdes rrugën e saktë të skedarit të actions
import { Loader2, Globe, EyeOff } from "lucide-react";

export default function ListingClientForm({ 
  hallId, 
  isReady, 
  currentStatus 
}: { 
  hallId: string; 
  isReady: boolean; 
  currentStatus: string; 
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePublishToggle = async () => {
    setLoading(true);
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    
    const res = await updateListing(hallId, newStatus);
    
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center h-full justify-center">
      <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
        {currentStatus === "PUBLISHED" ? (
          <Globe className="w-8 h-8 text-indigo-500" />
        ) : (
          <EyeOff className="w-8 h-8 text-slate-400" />
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {currentStatus === "PUBLISHED" ? "Salla është Publike" : "Salla është e fshehur"}
      </h3>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        {currentStatus === "PUBLISHED" 
          ? "Salla juaj tani është e dukshme në marketplace-in HALLEVO.COM për të gjithë klientët." 
          : "Kur të keni plotësuar të gjitha kushtet, publikoni sallën për të filluar pranimin e kërkesave nga klientët."}
      </p>

      <button 
        onClick={handlePublishToggle}
        disabled={!isReady || loading}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
          ${!isReady 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
            : currentStatus === "PUBLISHED" 
              ? 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'}
        `}
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {!loading && currentStatus === "PUBLISHED" ? "Hiq nga Publikimi" : "Publiko Sallën në HALLEVO.COM"}
      </button>
    </div>
  );
}