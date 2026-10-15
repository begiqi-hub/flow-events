"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Përcaktojmë strukturën e të dhënave që presim nga databaza
interface MegabannerProps {
  ad?: {
    id: string;
    title: string | null;
    description: string | null;
    desktopImage: string;
    targetUrl: string | null; // <--- Ndryshimi 1: U bë opsionale (string | null)
  };
}

export default function Megabanner({ ad }: MegabannerProps) {
  // Fshehim banner-in nëse nuk kalojmë të dhëna (ose s'ka reklama aktive)
  if (!ad) return null;

  // Funksioni që numëron klikimet në sfond pa ngadalësuar hapjen e linkut
  const handleAdClick = () => {
    fetch('/api/ads/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ad.id, action: 'click' })
    }).catch(() => {});
  };

  // Ndryshimi 2: Ndajmë përmbajtjen e brendshme (Imazhi, gradienti, tekstet) për të mos përsëritur kodin
  const innerContent = (
    <>
      <Image 
        src={ad.desktopImage} 
        alt={ad.title || "Sponsorizuar"} 
        fill
        priority // Siguron që ngarkohet menjëherë (ndihmon LCP-në)
        sizes="(max-width: 1400px) 100vw, 1400px"
        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-100"
      />
      
      {/* Gradient Overlay për kontrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070d19]/90 via-[#070d19]/40 to-transparent z-10" />

      {/* Etiketa Sponsorizuar */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 z-20">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Sponsorizuar</span>
      </div>

      {/* Përmbajtja e Bannerit */}
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-20">
        <div>
          {ad.title && (
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-1">
              {ad.title}
            </h3>
          )}
          {ad.description && (
            <p className="text-slate-300 text-xs md:text-sm font-light">
              {ad.description}
            </p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {/* Ndryshimi 3: Logjika if/else. Nëse kemi targetUrl e bëjmë <Link>, përndryshe <div> normal pa dorën e klikimit (cursor-default) */}
      {ad.targetUrl ? (
        <Link 
          href={ad.targetUrl}
          target="_blank"
          onClick={handleAdClick}
          className="relative block w-full h-[180px] md:h-[220px] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-[#101724] group cursor-pointer"
        >
          {innerContent}
        </Link>
      ) : (
        <div 
          onClick={handleAdClick}
          className="relative block w-full h-[180px] md:h-[220px] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-[#101724] group cursor-default"
        >
          {innerContent}
        </div>
      )}
    </div>
  );
}