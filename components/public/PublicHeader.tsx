"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User, ArrowLeft, Menu, X } from 'lucide-react';

interface PublicHeaderProps {
  locale: string;
  showBackButton?: boolean;
}

export default function PublicHeader({ locale, showBackButton = false }: PublicHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a111d]/90 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 h-20 flex items-center justify-between relative">
        
        {/* Mobile Left: Kthehu */}
        {showBackButton && (
          <div className="flex items-center md:hidden z-10">
             <Link href={`/${locale}/sallat`} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-white/5 p-2.5 rounded-full">
               <ArrowLeft className="w-4 h-4" /> 
             </Link>
          </div>
        )}

        {/* Logo dhe Navigimi */}
        <div className={`flex items-center ${showBackButton ? 'justify-center absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 w-full md:w-auto' : ''} gap-12`}>
          <Link href={`/${locale}`} className="flex items-center shrink-0">
            <img 
                src="/logo.png" 
                alt="HALLEVO" 
                className="h-8 md:h-9 w-auto object-contain brightness-0 invert opacity-100 block" 
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            <Link className="text-sm font-semibold text-white relative h-20 flex items-center" href={`/${locale}/sallat`}>
              Sallat
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8B5CF6]"></span>
            </Link>
            <Link href={`/${locale}#si-funksionon`} className="text-sm font-medium text-slate-400 hover:text-white transition-colors h-20 flex items-center">
              Si funksionon
            </Link>
            <Link className="text-sm font-medium text-slate-400 hover:text-white transition-colors h-20 flex items-center" href={`/${locale}/bizneset`}>
              Për Bizneset
            </Link>
          </nav>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-8 z-10">
          <Link className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors" href={`/${locale}/login`}>
            <User className="w-4 h-4"/> Hyr
          </Link>
          <Link className="text-sm font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-7 py-2.5 rounded-full transition-all" href={`/${locale}/register`}>
            Listo Biznesin
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center z-10">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 rounded-full bg-white/5 text-slate-300 hover:text-white transition border border-white/5"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu (Hapet kur klikohet butoni hamburger) */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0a111d] border-b border-white/10 px-6 py-6 shadow-2xl backdrop-blur-2xl">
          <nav className="flex flex-col gap-4">
            <Link 
              href={`/${locale}/sallat`} 
              onClick={closeMenu}
              className="text-base font-semibold text-white py-2.5 border-b border-white/5 hover:text-[#8B5CF6] transition flex items-center justify-between"
            >
              Sallat
            </Link>
            <Link 
              href={`/${locale}#si-funksionon`} 
              onClick={closeMenu}
              className="text-base font-medium text-slate-300 py-2.5 border-b border-white/5 hover:text-white transition flex items-center justify-between"
            >
              Si funksionon
            </Link>
            <Link 
              href={`/${locale}/bizneset`} 
              onClick={closeMenu}
              className="text-base font-medium text-slate-300 py-2.5 border-b border-white/5 hover:text-white transition flex items-center justify-between"
            >
              Për Bizneset
            </Link>
            
            <div className="pt-4 flex flex-col gap-3">
              <Link 
                href={`/${locale}/login`} 
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 text-sm font-medium text-slate-300 bg-white/5 py-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition"
              >
                <User className="w-4 h-4"/> Hyr
              </Link>
              <Link 
                href={`/${locale}/bizneset`} 
                onClick={closeMenu}
                className="text-center text-sm font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3.5 rounded-xl transition shadow-lg shadow-[#8B5CF6]/20"
              >
                Listo Biznesin
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}