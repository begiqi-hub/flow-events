import React from 'react';
import { Search, MapPin, Users, Calendar, ChevronRight, ChevronDown, Image as ImageIcon, Heart, User, Facebook, Instagram, Linkedin, Youtube, ArrowRight, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { prisma } from "@/lib/prisma";
import Megabanner from "@/components/Megabanner";
import HowItWorks from "@/components/public/HowItWorks";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import HeroSearch from "@/components/public/HeroSearch";
import { getCityName } from "@/lib/constants/cities";
import Image from 'next/image';
import { DEMO_LISTINGS } from "@/lib/demo-data";

export const revalidate = 3600; 

const premiumItalicStyle: React.CSSProperties = { 
  fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif', 
  fontStyle: 'italic', 
  letterSpacing: '0.02em' 
};

export default async function PublicMarketplaceHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const today = new Date();

  const activeAds = await prisma.advertisement.findMany({
    where: {
      status: "ACTIVE",
      type: "MEGABANNER",
      startDate: { lte: today },
      OR: [
        { endDate: null },
        { endDate: { gte: today } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 2
  });

  const publishedListings = await prisma.listing.findMany({
    where: { 
      status: "PUBLISHED",
      hall: { is_published: true }
    },
    include: {
      hall: true,
      business: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 16 
  });

  // Bashkojmë të dhënat e databazës me demot
  const allListings = [...publishedListings, ...DEMO_LISTINGS];
  
  // Kufizojmë totalin absolut në 16 salla
  const displayListings = allListings.slice(0, 16);

  // Ndajmë saktësisht: 8 lart, 8 poshtë
  const firstBatch = displayListings.slice(0, 8);
  const secondBatch = displayListings.slice(8, 16);

  return (
    <main className="min-h-screen bg-[#070d19] text-slate-200 selection:bg-[#8B5CF6] selection:text-white relative font-sans overflow-x-hidden">
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#8B5CF6]/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[20%] left-0 w-[500px] h-[500px] bg-indigo-900/5 blur-[150px] rounded-full pointer-events-none z-0" />

      <PublicHeader locale={locale} />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-8 w-full">
        <section className="relative pt-8 pb-16 md:pt-10 md:pb-24 flex flex-col lg:flex-row items-start justify-between z-10">
          <div className="w-full lg:w-[45%] flex flex-col items-start text-left relative z-20">
            <p className="text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4 flex items-center gap-3">
              SALLA • EVENTE • MOMENTE TË VEÇANTA
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-[68px] font-serif text-white leading-[1.05] tracking-tight mb-4">
              Gjej sallën ideale për <br />
              <span className="text-[#C4B5FD]" style={premiumItalicStyle}>eventin tënd</span>
            </h1>
            <p className="text-base text-slate-400 leading-relaxed max-w-sm font-light">
              Zbulo sallat më të mira për dasma, fejesa, biznese dhe çdo event tjetër të veçantë, në gjithë Kosovën.
            </p>
          </div>

          <div className="hidden lg:block absolute right-6 lg:right-5 top-[-80px] w-[52%] max-w-[700px] h-[520px] z-0 overflow-visible">
            <div className="w-full h-full overflow-hidden rounded-bl-[160px] relative">
              <Image 
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000&auto=format&fit=crop" 
                alt="Venue background" 
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#3B1D5C]/30 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#070d19]/95" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070d19] via-[#070d19]/50 to-transparent opacity-95" />
            </div>
            <div className="absolute right-[-250px] top-[30%] text-white/90 text-4xl lg:text-3xl rotate-[-5deg] text-right leading-[1.2] drop-shadow-xl" style={premiumItalicStyle}>
              Çdo event <br/> fillon me një <br/> sallë të mirë <br/>
              <span className="text-1xl mt-4 inline-block font-sans opacity-70" style={{ fontStyle: 'normal' }}>♡</span>
            </div>
          </div>
        </section>

        <section className="relative z-30 -mt-10 md:-mt-16 mb-16 w-full max-w-[1000px] mx-auto">
          <HeroSearch locale={locale} variant="horizontal" />
        </section>
      </div>
          
      {activeAds[0] && (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-8 mb-20 z-10 relative">
          <Megabanner ad={activeAds[0]} />
        </section>
      )}

      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-32 z-10 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-white tracking-tight mb-2">Sallat e disponueshme</h2>
            <p className="text-slate-400 text-sm font-light">Zgjedh nga sallat më të mira në Kosovë</p>
          </div>
          <div className="flex items-center gap-4">
             <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition group border border-white/10 rounded-full px-5 py-2 hover:bg-white/5 shadow-sm" href={`/${locale}/sallat`}>
               Shiko të gjitha <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {firstBatch.map((listing: any) => (
            <Link key={listing.id} href={`/${locale}/salla/${listing.hallId}`} className="group flex flex-col bg-[#0f1a2d] rounded-[24px] overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="relative h-[220px] w-full bg-[#0F111A] overflow-hidden">
                {listing.mainImage || listing.hall?.image ? (
                  <Image src={listing.mainImage || listing.hall.image || ""} alt={listing.hall?.name || "Salla"} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-700"/></div>
                )}
                
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20 max-w-[70%]">
                  {(listing.type ? listing.type.split(',') : ["Dasma"]).slice(0, 2).map((typeItem: string, idx: number) => (
                    <div key={idx} className="bg-[#B2549C]/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10">
                      {idx === 0 && <PartyPopper className="w-3.5 h-3.5 text-white shrink-0"/>}
                      <span className="text-white text-xs font-bold whitespace-nowrap truncate">{typeItem.trim()}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a2d] via-transparent to-transparent opacity-40" />
              </div>
              
              <div className="p-5 flex-1 flex flex-col z-10 bg-[#0f1a2d]">
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-1 group-hover:text-[#C4B5FD] transition-colors">{listing.hall?.name || "Sallë Eventesh"}</h3>
                <div className="flex items-end justify-between mt-auto">
                  <div className="flex flex-col gap-2.5 text-sm font-medium text-[#94A3B8]">
                    <span className="flex items-center gap-2.5"><MapPin className="w-4 h-4 shrink-0"/> {getCityName(listing.business?.city)}</span>
                    <span className="flex items-center gap-2.5"><Users className="w-4 h-4 shrink-0"/> Deri në {listing.hall?.capacity || 200} persona</span>
                  </div>
                  <div className="w-9 h-9 shrink-0 rounded-full bg-[#1E2332] flex items-center justify-center group-hover:bg-[#8B5CF6] transition-colors">
                    <ArrowRight className="w-4 h-4 text-white"/>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {activeAds[1] && (
          <div className="w-full my-16">
            <Megabanner ad={activeAds[1]} />
          </div>
        )}

        {secondBatch.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {secondBatch.map((listing: any) => (
              <Link key={listing.id} href={`/${locale}/salla/${listing.hallId}`} className="group flex flex-col bg-[#0f1a2d] rounded-[24px] overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300">
                <div className="relative h-[220px] w-full bg-[#0F111A] overflow-hidden">
                  {listing.mainImage || listing.hall?.image ? (
                    <Image src={listing.mainImage || listing.hall.image || ""} alt={listing.hall?.name || "Salla"} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-700"/></div>
                  )}
                  
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20 max-w-[70%]">
                    {(listing.type ? listing.type.split(',') : ["Dasma"]).slice(0, 2).map((typeItem: string, idx: number) => (
                      <div key={idx} className="bg-[#B2549C]/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10">
                        {idx === 0 && <PartyPopper className="w-3.5 h-3.5 text-white shrink-0"/>}
                        <span className="text-white text-xs font-bold whitespace-nowrap truncate">{typeItem.trim()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a2d] via-transparent to-transparent opacity-40" />
                </div>
                
                <div className="p-5 flex-1 flex flex-col z-10 bg-[#0f1a2d]">
                  <h3 className="text-lg font-bold text-white mb-3 line-clamp-1 group-hover:text-[#C4B5FD] transition-colors">{listing.hall?.name || "Sallë Eventesh"}</h3>
                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col gap-2.5 text-sm font-medium text-[#94A3B8]">
                      <span className="flex items-center gap-2.5"><MapPin className="w-4 h-4 shrink-0"/> {getCityName(listing.business?.city)}</span>
                      <span className="flex items-center gap-2.5"><Users className="w-4 h-4 shrink-0"/> Deri në {listing.hall?.capacity || 200} persona</span>
                    </div>
                    <div className="w-9 h-9 shrink-0 rounded-full bg-[#1E2332] flex items-center justify-center group-hover:bg-[#8B5CF6] transition-colors">
                      <ArrowRight className="w-4 h-4 text-white"/>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <HowItWorks />
      <PublicFooter locale={locale} />
    </main>
  );
}