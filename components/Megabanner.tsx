import React from 'react';

export default function Megabanner() {
  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="relative w-full h-[180px] md:h-[220px] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-[#101724] group">
        
        {/* Imazhi i Sfondit */}
        <img 
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000&auto=format&fit=crop" 
          alt="Sponsorizuar" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-100"
        />
        
        {/* Gradient Overlay për kontrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070d19]/90 via-[#070d19]/40 to-transparent" />

        {/* Etiketa Sponsorizuar */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Sponsorizuar</span>
        </div>

        {/* Përmbajtja e Bannerit */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-1">ROYAL PALACE</h3>
            <p className="text-slate-300 text-xs md:text-sm font-light">Eleganca që e bën çdo event të paharrueshëm</p>
          </div>
        </div>

      </div>
    </div>
  );
}