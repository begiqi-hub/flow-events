"use client";

import { useState, useEffect } from "react";
import { X, Megaphone, AlertTriangle, AlertCircle, Info, ChevronRight, BellRing } from "lucide-react";

interface AlertProps {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "danger" | string;
}

export default function GlobalAlert({ id, title, message, type }: AlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const dismissedAlerts = JSON.parse(localStorage.getItem("dismissed_alerts") || "[]");
    if (!dismissedAlerts.includes(id)) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ndalon hapjen e modalit kur klikon X
    const dismissedAlerts = JSON.parse(localStorage.getItem("dismissed_alerts") || "[]");
    localStorage.setItem("dismissed_alerts", JSON.stringify([...dismissedAlerts, id]));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const config: any = {
    info: {
      bg: "bg-white/90",
      accent: "bg-indigo-600",
      border: "border-indigo-100",
      lightAccent: "bg-indigo-50",
      text: "text-indigo-600",
      icon: <Info size={16} className="text-white" />,
      label: "Njoftim"
    },
    warning: {
      bg: "bg-white/90",
      accent: "bg-amber-500",
      border: "border-amber-100",
      lightAccent: "bg-amber-50",
      text: "text-amber-600",
      icon: <AlertTriangle size={16} className="text-white" />,
      label: "Kujdes"
    },
    danger: {
      bg: "bg-white/90",
      accent: "bg-red-600",
      border: "border-red-100",
      lightAccent: "bg-red-50",
      text: "text-red-600",
      icon: <AlertCircle size={16} className="text-white" />,
      label: "Urgjente"
    }
  };

  const current = config[type] || config.info;

  return (
    <>
      {/* 1. SHIRITI (THE TEASER) */}
      <div className="fixed top-6 left-0 right-0 z-[1000] flex justify-center px-4 pointer-events-none">
        <div 
          onClick={() => setIsModalOpen(true)}
          className={`
            pointer-events-auto cursor-pointer
            flex items-center gap-4 
            ${current.bg} backdrop-blur-md
            border ${current.border}
            p-1.5 pr-4 rounded-full 
            shadow-[0_15px_40px_rgba(0,0,0,0.08)]
            hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]
            hover:-translate-y-0.5 transition-all duration-300
            animate-in fade-in slide-in-from-top-8
            max-w-[90%] md:max-w-2xl
          `}
        >
          <div className={`${current.accent} p-2 rounded-full shadow-md shrink-0`}>
            {current.icon}
          </div>

          <div className="flex items-center gap-3 overflow-hidden">
            <span className={`hidden sm:inline-block text-[9px] font-black uppercase tracking-widest ${current.text} ${current.lightAccent} px-2 py-1 rounded-full`}>
              {current.label}
            </span>
            <div className="flex items-center gap-2 overflow-hidden">
              <p className="text-sm font-black text-slate-800 whitespace-nowrap">{title}</p>
              <p className="text-sm font-medium text-slate-500 truncate hidden md:block">— {message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
             <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
             <ChevronRight size={14} className="text-slate-300" />
             <button 
                onClick={handleDismiss}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
          </div>
        </div>
      </div>

      {/* 2. MODALI (THE FULL VIEW) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          {/* Overlay i zi me blur */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Kartela e Modalit */}
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            <div className={`h-2 w-full ${current.accent}`}></div>
            
            <div className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`${current.lightAccent} ${current.text} p-3 rounded-2xl`}>
                  <BellRing size={24} />
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                {title}
              </h3>

              <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 mb-8">
                <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {message}
                </p>
              </div>

              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  // Opsionale: mund ta bëjmë që kur e lexon në modal, të mos shfaqet më shiriti
                  // handleDismiss(new MouseEvent('click') as any); 
                }}
                className={`w-full ${current.accent} text-white py-4 rounded-2xl font-black shadow-lg hover:brightness-110 transition-all active:scale-[0.98]`}
              >
                U kuptua
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}