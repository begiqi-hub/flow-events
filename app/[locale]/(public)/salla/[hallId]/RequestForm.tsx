"use client";

import React, { useState } from "react";
import { submitQuoteRequest } from "@/lib/actions/requestActions";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export default function RequestForm({ businessId, hallId }: { businessId: string, hallId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      businessId,
      hallId,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      date: formData.get("date") as string,
      participants: parseInt(formData.get("participants") as string) || 0,
      eventType: formData.get("eventType") as string, 
      notes: formData.get("notes") as string,
    };

    const res = await submitQuoteRequest(data);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "Gabim i panjohur");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[24px] text-center flex flex-col items-center relative z-10">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h4 className="font-serif text-2xl text-emerald-300 mb-3">Kërkesa u dërgua!</h4>
        <p className="text-sm text-emerald-200/70 font-light leading-relaxed">
          Biznesi e ka pranuar kërkesën tuaj dhe do t'ju kontaktojë së shpejti me një ofertë.
        </p>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full">
      <h3 className="text-2xl font-serif text-white mb-2">Kërko Ofertë</h3>
      <p className="text-slate-400 text-sm mb-8 font-light">
        Plotësoni të dhënat dhe merrni ofertën më të mirë nga salla.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl font-medium">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Emri i plotë</label>
          <input 
            required 
            type="text" 
            name="name" 
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Ju lutem plotësoni këtë fushë.')}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
            className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all placeholder:text-slate-600" 
            placeholder="P.sh. Ijas Begiqi" 
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Numri i Telefonit</label>
          <input 
            required 
            type="tel" 
            name="phone" 
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Ju lutem plotësoni këtë fushë.')}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
            className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all placeholder:text-slate-600" 
            placeholder="+383 4x xxx xxx" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data</label>
            <input 
              required 
              type="date" 
              name="date" 
              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Ju lutem plotësoni këtë fushë.')}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
              className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all [color-scheme:dark]" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Të Ftuar</label>
            <input 
              required 
              type="number" 
              name="participants" 
              min="1" 
              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Ju lutem plotësoni këtë fushë.')}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
              className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all placeholder:text-slate-600" 
              placeholder="P.sh. 200" 
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Lloji i Eventit</label>
          <select 
            required 
            name="eventType" 
            defaultValue="" 
            onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity('Ju lutem zgjidhni një opsion.')}
            onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity('')}
            className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all cursor-pointer appearance-none"
          >
            <option value="" disabled className="text-slate-500">Zgjidhni llojin e eventit...</option>
            <option value="Dasmë" className="bg-[#0A0D14] text-white">Dasmë</option>
            <option value="Fejesë" className="bg-[#0A0D14] text-white">Fejesë</option>
            <option value="Kanagjeq" className="bg-[#0A0D14] text-white">Kanagjeq</option>
            <option value="Ditëlindje" className="bg-[#0A0D14] text-white">Ditëlindje</option>
            <option value="Event Biznesi / Konferencë" className="bg-[#0A0D14] text-white">Event Biznesi / Konferencë</option>
            <option value="Tjetër" className="bg-[#0A0D14] text-white">Tjetër</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Kërkesa (Opsionale)</label>
          <textarea 
            name="notes" 
            rows={3} 
            className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-5 py-4 text-sm font-medium text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all resize-none placeholder:text-slate-600" 
            placeholder="Çfarë ju nevojitet tjetër?"
          ></textarea>
        </div>

        <button 
          disabled={loading} 
          type="submit" 
          className="w-full py-4 mt-2 rounded-xl font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {loading ? "Po dërgohet..." : "Dërgo Kërkesën"}
        </button>
      </form>
    </div>
  );
}