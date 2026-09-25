import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const premiumItalicStyle: React.CSSProperties = { 
  fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif', 
  fontStyle: 'italic', 
  letterSpacing: '0.02em' 
};

export default function PublicFooter({ locale }: { locale: string }) {
  return (
    <footer className="bg-[#0c1220] border-t border-white/5 pt-16 pb-16 px-6 lg:px-8 relative z-10">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-start gap-10">
        
        {/* Kolona 1: Logo, Përshkrimi dhe Të Drejtat e Autorit */}
        <div className="w-full lg:w-1/5 flex flex-col justify-between">
          <div>
            <img 
              src="/logo.png" 
              alt="HALLEVO" 
              className="h-8 md:h-9 w-auto object-contain brightness-0 invert opacity-100 mb-3 block" 
            />
            <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
              Salla për çdo moment të veçantë
            </p>
          </div>
          
          <div className="mt-8 lg:mt-16">
            <p className="text-slate-500 text-[11px] font-medium">
              &copy; {new Date().getFullYear()} HALLEVO. Të gjitha të drejtat e rezervuara.
            </p>
          </div>
        </div>

        {/* Kolona 2: Navigim */}
        <div className="w-full lg:w-1/5">
          <h4 className="text-white font-bold mb-4 text-sm">Navigim</h4>
          <ul className="space-y-2.5">
            <li><Link className="text-slate-400 hover:text-white text-[13px] transition" href={`/${locale}/sallat`}>Sallat</Link></li>
            <li><Link className="text-slate-400 hover:text-white text-[13px] transition" href={`/${locale}/bizneset`}>Për Bizneset</Link></li>
            <li><a href="https://hallevo.com/" className="text-slate-400 hover:text-white text-[13px] transition">Rreth nesh</a></li>
            <li><a href="https://hallevo.com/sq" className="text-slate-400 hover:text-white text-[13px] transition">FAQ</a></li>
          </ul>
        </div>

        {/* Kolona 3: Ndihmë */}
        <div className="w-full lg:w-1/5">
          <h4 className="text-white font-bold mb-4 text-sm">Ndihmë</h4>
          <ul className="space-y-2.5">
            <li><a href="https://hallevo.com/" className="text-slate-400 hover:text-white text-[13px] transition">Kontakt</a></li>
            <li><a href="https://hallevo.com/sq/terms-and-conditions" className="text-slate-400 hover:text-white text-[13px] transition">Kushtet e përdorimit</a></li>
            <li><a href="https://hallevo.com/sq/privacy" className="text-slate-400 hover:text-white text-[13px] transition">Privatësia</a></li>
            <li><a href="https://hallevo.com/sq/register" className="text-slate-400 hover:text-white text-[13px] transition">Bëhu partner</a></li>
          </ul>
        </div>

        {/* Kolona 4: Na ndiqni */}
        <div className="w-full lg:w-1/5">
          <h4 className="text-white font-bold mb-4 text-sm">Na ndiqni</h4>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-400 hover:text-white transition">
              <Facebook className="w-[18px] h-[18px]"/>
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition">
              <Instagram className="w-[18px] h-[18px]"/>
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition">
              <Youtube className="w-[18px] h-[18px]"/>
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition">
              <Linkedin className="w-[18px] h-[18px]"/>
            </a>
          </div>
        </div>

        {/* Kolona 5: Slogani */}
        <div className="w-full lg:w-1/5 flex lg:justify-end items-center">
        <div className="text-[#8b5cf6] text-3xl leading-snug drop-shadow-md text-left lg:text-right" style={premiumItalicStyle}>
            Momente që <br/> mbeten përgjithmonë. <br/>
            <span className="text-xl inline-block mt-1 font-sans opacity-70" style={{ fontStyle: 'normal' }}>♡</span>
        </div>
        </div>

      </div>
    </footer>
  );
}