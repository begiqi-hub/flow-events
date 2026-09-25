import React from 'react';
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Users, 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  Image as ImageIcon, 
  Heart, 
  User, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube, 
  ArrowRight, 
  PartyPopper, 
  SlidersHorizontal, 
  SearchX,
  ArrowLeft
} from 'lucide-react';
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import HeroSearch from "@/components/public/HeroSearch";
import { getCityName } from "@/lib/constants/cities";

export const dynamic = "force-dynamic";

// Font editorial luksoz për detajet
const premiumItalicStyle = { fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Georgia', serif", fontStyle: 'italic', letterSpacing: '0.02em' };

export default async function SearchResultsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ locale: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params;
  const sp = await searchParams;
  
  // Leximi i parametrave nga URL
  const city = typeof sp.city === 'string' ? sp.city : 'all';
  const capacity = typeof sp.capacity === 'string' ? sp.capacity : 'all';
  const event = typeof sp.event === 'string' ? sp.event : 'all';

  // Ndërtimi i Query-t Dinamik për Prisma (I korrigjuar)
const whereClause: any = {
  status: "PUBLISHED",
};

// Filtri i qytetit (lidhja me tabelën business)
if (city && city !== 'all') {
  whereClause.business = {
    city: { 
      contains: city 
    }
  };
}

// Filtri i llojit të eventit i përket tabelës listing (fusha 'type')
if (event && event !== 'all') {
  whereClause.type = { 
    contains: event 
    // mode: "insensitive" është fshirë gjithashtu këtu
  };
}

const hallConditions: any = {};

// Filtri i kapacitetit i përket tabelës halls
if (capacity && capacity !== 'all') {
  if (capacity === '100') hallConditions.capacity = { lte: 100 };
  if (capacity === '200') hallConditions.capacity = { gt: 100, lte: 200 };
  if (capacity === '300') hallConditions.capacity = { gt: 200, lte: 300 };
  if (capacity === '500') hallConditions.capacity = { gt: 300, lte: 500 };
  if (capacity === '500+') hallConditions.capacity = { gt: 500 };
}

if (Object.keys(hallConditions).length > 0) {
  whereClause.hall = hallConditions;
}

  // Ekzekutimi i kërkimit në DB
  const listings = await prisma.listing.findMany({
    where: whereClause,
    include: {
      hall: true,
      business: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-[#060d18] text-slate-200 selection:bg-[#8B5CF6] selection:text-white relative font-sans overflow-x-hidden">
      
      {/* Background Efekte */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#8B5CF6]/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[20%] left-0 w-[500px] h-[500px] bg-indigo-900/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* HEADER PREMIUM (U largua butoni 'Për Bizneset') */}
      <PublicHeader locale={locale} />

     {/* STRUKTURA E KËRKIMIT */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-10 relative z-10">
        
        {/* Sidebar me Filtrat Aktivë */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-[#101724] border border-white/5 rounded-[24px] p-6 md:p-8 sticky top-28 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5 text-[#C4B5FD]" />
              </div>
              <h2 className="text-lg font-serif text-white tracking-tight">Filtrat e kërkimit</h2>
            </div>
            
            {/* Thirrja e komponentit dinamik HeroSearch në formatin Vertikal */}
            <HeroSearch 
              locale={locale} 
              variant="vertical" 
              defaultValues={{ city, capacity, event }} 
            />
            
          </div>
        </aside>

        {/* Rezultatet e Kërkimit */}
        <div className="flex-1 pb-20">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-white tracking-tight mb-2">Rezultatet e kërkimit</h1>
              <p className="text-slate-400 text-sm font-light">U gjetën {listings.length} salla që përputhen me kriteret.</p>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="w-full bg-[#101724] border border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-xl">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                 <SearchX className="w-10 h-10 text-slate-500" />
               </div>
               <h3 className="text-2xl font-serif text-white mb-3">Nuk u gjet asnjë sallë</h3>
               <p className="text-slate-400 max-w-md mb-8 leading-relaxed">Provoni të ndryshoni kriteret e kërkimit ose zgjidhni "Të gjitha" për të parë opsione të tjera.</p>
               <Link href={`/${locale}/sallat`} className="px-8 py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full font-bold transition-all shadow-lg hover:shadow-[#8B5CF6]/20">
                 Pastro filtrat
               </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing: any) => (
                <Link key={listing.id} href={`/${locale}/salla/${listing.hallId}`} className="group flex flex-col bg-[#101724] rounded-[24px] overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300">
                  
                  {/* Imazhi i Kartës & Badges */}
                  <div className="relative h-[220px] w-full bg-[#0F111A] overflow-hidden">
                    {listing.mainImage || listing.hall?.image ? (
                      <img 
                        src={listing.mainImage || listing.hall.image || ""} 
                        alt={listing.hall?.name || "Salla"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-700" />
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 bg-[#B2549C]/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 z-20 shadow-lg border border-white/10">
                      <PartyPopper className="w-3.5 h-3.5 text-white" />
                      <span className="text-white text-xs font-bold">{listing.type || "Dasma"}</span>
                    </div>

                    <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#242730]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20">
                      <Heart className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101724] via-transparent to-transparent opacity-40" />
                  </div>
                  
                  {/* Trupi i Kartës */}
                  <div className="p-5 flex-1 flex flex-col z-10 bg-[#101724]">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 line-clamp-1 group-hover:text-[#C4B5FD] transition-colors">
                        {listing.hall?.name || "Sallë Eventesh"}
                      </h3>
                      <div className="flex flex-col gap-2.5 text-sm font-medium text-[#94A3B8] mb-6">
                        <span className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 shrink-0"/> {getCityName(listing.business?.city)}
                        </span>
                        <span className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 shrink-0" /> Deri në {listing.hall?.capacity || 200} persona
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                       <div className="flex flex-wrap gap-2 overflow-hidden max-h-[30px]">
                         <span className="bg-[#1E2332] text-[#94A3B8] text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                           Dasma
                         </span>
                         <span className="bg-[#1E2332] text-[#94A3B8] text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                           Fejesa
                         </span>
                       </div>
                       <div className="w-9 h-9 shrink-0 rounded-full bg-[#1E2332] flex items-center justify-center group-hover:bg-[#8B5CF6] transition-colors ml-2">
                         <ArrowRight className="w-4 h-4 text-white" />
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER PREMIUM */}
      <PublicFooter locale={locale} />

    </main>
  );
}