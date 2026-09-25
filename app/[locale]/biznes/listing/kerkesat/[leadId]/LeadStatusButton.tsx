"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { markLeadAsContacted } from "@/lib/actions/requestActions";
import { Loader2, Check } from "lucide-react";

export default function LeadStatusButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMarkAsDone = async () => {
    setLoading(true);
    const res = await markLeadAsContacted(leadId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleMarkAsDone}
      disabled={loading}
      className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
      {loading ? "Po përditësohet..." : "Shëno si të Kontaktuar"}
    </button>
  );
}