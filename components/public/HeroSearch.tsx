"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Users, Calendar, ChevronDown, Check } from "lucide-react";
import { CITIES } from "@/lib/constants/cities";
import { useRouter } from "next/navigation";
import { EVENT_TYPES } from "@/lib/constants";

// Gjenerimi dinamik i eventeve nga constants
const EVENTET = [
  { value: "all", label: "Të gjitha" },
  ...EVENT_TYPES.map((type) => ({ value: type, label: type }))
];

// Shtuar për të parandaluar gabimet pasi mungonte në kodin e dërguar
const KAPACITETET = [
  { value: "all", label: "Të gjithë" },
  { value: "100", label: "Deri në 100" },
  { value: "200", label: "100 - 200" },
  { value: "300", label: "200 - 300" },
  { value: "500", label: "300 - 500" },
  { value: "500+", label: "Mbi 500" },
];

interface HeroSearchProps {
  locale: string;
  variant: "horizontal" | "vertical";
  defaultValues?: {
    city?: string;
    capacity?: string;
    event?: string;
  };
}

export default function HeroSearch({ locale, variant, defaultValues }: HeroSearchProps) {
  const router = useRouter();
  
  const [openDropdown, setOpenDropdown] = useState<'city' | 'capacity' | 'event' | null>(null);
  
  const [city, setCity] = useState(defaultValues?.city || "all");
  const [capacity, setCapacity] = useState(defaultValues?.capacity || "all");
  const [event, setEvent] = useState(defaultValues?.event || "all");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city !== "all") params.set("city", city);
    if (capacity !== "all") params.set("capacity", capacity);
    if (event !== "all") params.set("event", event);
    
    router.push(`/${locale}/sallat?${params.toString()}`);
  };

  const getCityName = (id: string) => CITIES.find(c => c.id === id)?.name || "Të gjitha qytetet";
  const getCapacityLabel = (val: string) => KAPACITETET.find(k => k.value === val)?.label || "Të gjithë";
  const getEventLabel = (val: string) => EVENTET.find(e => e.value === val)?.label || "Të gjitha";
  
  // Klasat për scrollbar të personalizuar
  const scrollbarClasses = "max-h-64 overflow-y-auto p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20";

  // ==========================================
  // VARIANTI 1: HORIZONTAL (PËR FAQEN KRYESORE)
  // ==========================================
  if (variant === "horizontal") {
    return (
      <form onSubmit={handleSearch} ref={dropdownRef} className="bg-[#101724] border border-white/5 rounded-3xl md:rounded-full p-2.5 flex flex-col md:flex-row items-center justify-between shadow-2xl relative z-40">
        
        {/* Qyteti */}
        <div className="flex-1 w-full relative">
          <button 
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')}
            className="w-full flex items-center gap-4 px-6 py-2 hover:bg-white/5 rounded-t-3xl md:rounded-l-full md:rounded-tr-none transition cursor-pointer border-b md:border-b-0 border-white/5"
          >
            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center bg-white/5 shrink-0">
              <MapPin className="text-slate-300 w-4 h-4"/>
            </div>
            <div className="flex flex-col w-full text-left">
              <span className="text-[11px] text-slate-400 mb-0.5">Qyteti</span>
              <div className="text-sm font-medium text-white pr-4">{getCityName(city)}</div>
            </div>
            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-transform ${openDropdown === 'city' ? 'rotate-180' : ''}`}/>
          </button>

          {openDropdown === 'city' && (
            <div className="absolute top-[calc(100%+12px)] left-0 w-full md:w-[300px] bg-[#101724] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className={scrollbarClasses}>
                <button type="button" onClick={() => { setCity("all"); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition flex items-center justify-between ${city === "all" ? "bg-[#8B5CF6]/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-4 h-4 ${city === "all" ? "text-[#8B5CF6]" : "text-slate-500"}`} />
                    <span>Të gjitha qytetet</span>
                  </div>
                  {city === "all" && <Check className="w-4 h-4 text-[#8B5CF6]"/>}
                </button>
                {CITIES.map(c => (
                  <button key={c.id} type="button" onClick={() => { setCity(c.id); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition flex items-center justify-between ${city === c.id ? "bg-[#8B5CF6]/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-4 h-4 ${city === c.id ? "text-[#8B5CF6]" : "text-slate-500"}`} />
                      <span>{c.name}</span>
                    </div>
                    {city === c.id && <Check className="w-4 h-4 text-[#8B5CF6]"/>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block w-[1px] h-10 bg-white/5 mx-2" />

        {/* Kapaciteti */}
        <div className="flex-1 w-full relative">
          <button 
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'capacity' ? null : 'capacity')}
            className="w-full flex items-center gap-4 px-6 py-2 hover:bg-white/5 transition cursor-pointer border-b md:border-b-0 border-white/5"
          >
            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center bg-white/5 shrink-0">
              <Users className="text-slate-300 w-4 h-4"/>
            </div>
            <div className="flex flex-col w-full text-left">
              <span className="text-[11px] text-slate-400 mb-0.5">Kapaciteti</span>
              <div className="text-sm font-medium text-white pr-4">{getCapacityLabel(capacity)}</div>
            </div>
            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-transform ${openDropdown === 'capacity' ? 'rotate-180' : ''}`}/>
          </button>

          {openDropdown === 'capacity' && (
            <div className="absolute top-[calc(100%+12px)] left-0 w-full md:w-[250px] bg-[#101724] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className={scrollbarClasses}>
                {KAPACITETET.map(k => (
                  <button key={k.value} type="button" onClick={() => { setCapacity(k.value); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition flex items-center justify-between ${capacity === k.value ? "bg-[#8B5CF6]/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                    <div className="flex items-center gap-3">
                      <Users className={`w-4 h-4 ${capacity === k.value ? "text-[#8B5CF6]" : "text-slate-500"}`} />
                      <span>{k.label}</span>
                    </div>
                    {capacity === k.value && <Check className="w-4 h-4 text-[#8B5CF6]"/>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block w-[1px] h-10 bg-white/5 mx-2" />

        {/* Eventi */}
        <div className="flex-1 w-full relative">
          <button 
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'event' ? null : 'event')}
            className="w-full flex items-center gap-4 px-6 py-2 hover:bg-white/5 rounded-b-3xl md:rounded-none transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center bg-white/5 shrink-0">
              <Calendar className="text-slate-300 w-4 h-4"/>
            </div>
            <div className="flex flex-col w-full text-left">
              <span className="text-[11px] text-slate-400 mb-0.5">Lloji i eventit</span>
              {/* Thirrja e funksionit për të shfaqur emrin (label) e eventit të zgjedhur */}
              <div className="text-sm font-medium text-white pr-4">
                {getEventLabel(event)}
              </div>
            </div>
            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-transform ${openDropdown === 'event' ? 'rotate-180' : ''}`}/>
          </button>

          {openDropdown === 'event' && (
            <div className="absolute top-[calc(100%+12px)] left-0 w-full md:w-[250px] bg-[#101724] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className={scrollbarClasses}>
                
                {/* Gjenerimi dinamik i butonave nga lista EVENTET */}
                {EVENTET.map(e => (
                  <button 
                    key={e.value} 
                    type="button" 
                    onClick={() => { 
                      setEvent(e.value); // Ruan vlerën e saktë nga constants.ts
                      setOpenDropdown(null); 
                    }} 
                    className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition flex items-center justify-between ${event === e.value ? "bg-[#8B5CF6]/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-4 h-4 ${event === e.value ? "text-[#8B5CF6]" : "text-slate-500"}`} />
                      <span>{e.label}</span>
                    </div>
                    {event === e.value && <Check className="w-4 h-4 text-[#8B5CF6]"/>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Butoni Kërko */}
        <div className="w-full md:w-auto p-1 shrink-0">
          <button type="submit" className="w-full md:w-auto bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl md:rounded-full px-10 py-4 h-full min-h-[56px] flex items-center justify-center font-bold text-sm transition-all shadow-lg hover:shadow-[#8B5CF6]/20">
            <Search className="w-4 h-4 mr-2"/> Kërko
          </button>
        </div>
      </form>
    );
  }

  // ==========================================
  // VARIANTI 2: VERTICAL (PËR SIDEBAR TEK SALLAT)
  // ==========================================
  return (
    <form onSubmit={handleSearch} ref={dropdownRef} className="space-y-4 relative z-40">
      {/* Qyteti */}
      <div className="relative w-full">
        <button 
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')}
          className="w-full flex items-center gap-4 bg-[#0F111A] border border-white/5 px-4 py-3.5 rounded-2xl hover:border-white/10 transition cursor-pointer"
        >
          <MapPin className="text-slate-400 w-5 h-5 shrink-0" />
          <div className="flex flex-col w-full text-left">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Qyteti</span>
            <div className="text-sm font-medium text-white">{getCityName(city)}</div>
          </div>
          <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-transform ${openDropdown === 'city' ? 'rotate-180' : ''}`} />
        </button>

        {openDropdown === 'city' && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#101724] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className={scrollbarClasses}>
              <button type="button" onClick={() => { setCity("all"); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition flex items-center justify-between ${city === "all" ? "bg-[#8B5CF6]/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                <div className="flex items-center gap-3">
                  <MapPin className={`w-4 h-4 ${city === "all" ? "text-[#8B5CF6]" : "text-slate-500"}`} />
                  <span>Të gjitha qytetet</span>
                </div>
                {city === "all" && <Check className="w-4 h-4 text-[#8B5CF6]"/>}
              </button>
              {CITIES.map(c => (
                <button key={c.id} type="button" onClick={() => { setCity(c.id); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition flex items-center justify-between ${city === c.id ? "bg-[#8B5CF6]/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-4 h-4 ${city === c.id ? "text-[#8B5CF6]" : "text-slate-500"}`} />
                    <span>{c.name}</span>
                  </div>
                  {city === c.id && <Check className="w-4 h-4 text-[#8B5CF6]"/>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Kapaciteti */}
      <div className="relative w-full">
        <button 
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'capacity' ? null : 'capacity')}
          className="w-full flex items-center gap-4 bg-[#0F111A] border border-white/5 px-4 py-3.5 rounded-2xl hover:border-white/10 transition cursor-pointer"
        >
          <Users className="text-slate-400 w-5 h-5 shrink-0" />
          <div className="flex flex-col w-full text-left">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Kapaciteti</span>
            <div className="text-sm font-medium text-white">{getCapacityLabel(capacity)}</div>
          </div>
          <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-transform ${openDropdown === 'capacity' ? 'rotate-180' : ''}`} />
        </button>

        {openDropdown === 'capacity' && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#101724] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className={scrollbarClasses}>
              {KAPACITETET.map(k => (
                <button key={k.value} type="button" onClick={() => { setCapacity(k.value); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition flex items-center justify-between ${capacity === k.value ? "bg-[#8B5CF6]/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                  <div className="flex items-center gap-3">
                    <Users className={`w-4 h-4 ${capacity === k.value ? "text-[#8B5CF6]" : "text-slate-500"}`} />
                    <span>{k.label}</span>
                  </div>
                  {capacity === k.value && <Check className="w-4 h-4 text-[#8B5CF6]"/>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Eventi */}
      <div className="relative w-full">
        <button 
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'event' ? null : 'event')}
          className="w-full flex items-center gap-4 bg-[#0F111A] border border-white/5 px-4 py-3.5 rounded-2xl hover:border-white/10 transition cursor-pointer"
        >
          <Calendar className="text-slate-400 w-5 h-5 shrink-0" />
          <div className="flex flex-col w-full text-left">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Lloji i eventit</span>
            <div className="text-sm font-medium text-white">{getEventLabel(event)}</div>
          </div>
          <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-transform ${openDropdown === 'event' ? 'rotate-180' : ''}`} />
        </button>

        {openDropdown === 'event' && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#101724] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className={scrollbarClasses}>
              {EVENTET.map(e => (
                <button key={e.value} type="button" onClick={() => { setEvent(e.value); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition flex items-center justify-between ${event === e.value ? "bg-[#8B5CF6]/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-4 h-4 ${event === e.value ? "text-[#8B5CF6]" : "text-slate-500"}`} />
                    <span>{e.label}</span>
                  </div>
                  {event === e.value && <Check className="w-4 h-4 text-[#8B5CF6]"/>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Butoni Kërko */}
      <button type="submit" className="w-full mt-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-2xl px-6 py-4 flex items-center justify-center font-bold text-sm transition-all shadow-lg hover:shadow-[#8B5CF6]/20">
        <Search className="w-4 h-4 mr-2" /> Kërko
      </button>
    </form>
  );
}