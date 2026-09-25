"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { EVENT_TYPES } from "@/lib/constants"; // Burimi juaj i vetëm i së vërtetës

interface MultiSelectEventProps {
  selectedEvents: string[];
  onChange: (events: string[]) => void;
}

export default function MultiSelectEvent({ selectedEvents, onChange }: MultiSelectEventProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mbyll dropdown-in kur klikohet jashtë tij
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleEvent = (event: string) => {
    if (selectedEvents.includes(event)) {
      onChange(selectedEvents.filter((e) => e !== event));
    } else {
      onChange([...selectedEvents, event]);
    }
  };

  const removeEvent = (e: React.MouseEvent, eventToRemove: string) => {
    e.stopPropagation(); // Parandalon hapjen e dropdown-it kur fshihet një etiketë
    onChange(selectedEvents.filter((event) => event !== eventToRemove));
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
        Lloji i Eventeve të Mbështetura
      </label>
      
      {/* Zona kryesore e klikueshme */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[52px] w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all cursor-pointer flex flex-wrap items-center gap-2"
      >
        {selectedEvents.length === 0 ? (
          <span className="text-slate-400">Zgjidh eventet...</span>
        ) : (
          selectedEvents.map((ev) => (
            <span 
              key={ev} 
              className="flex items-center gap-1.5 bg-[#8B5CF6]/10 text-[#8B5CF6] px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              {ev}
              <button 
                type="button" 
                onClick={(e) => removeEvent(e, ev)}
                className="hover:bg-[#8B5CF6]/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
        
        <div className="ml-auto">
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Lista e opsioneve */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
          <div className="p-1">
            {EVENT_TYPES.map((type) => {
              const isSelected = selectedEvents.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleEvent(type)}
                  className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-colors flex items-center justify-between ${
                    isSelected ? "bg-[#8B5CF6]/5 text-[#8B5CF6] font-semibold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{type}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#8B5CF6]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}