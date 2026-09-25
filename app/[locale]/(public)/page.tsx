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

// MAGJIA E PERFORMANCËS: Cache faqen për 1 orë. 
export const revalidate = 3600; 

// Font editorial luksoz i tipizuar saktë për të shmangur gabimet e kompilatorit
const premiumItalicStyle: React.CSSProperties = { 
  fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif', 
  fontStyle: 'italic', 
  letterSpacing: '0.02em' 
};

// TË DHËNAT DEMO PËR PREZANTIM (13 Salla me të dhëna unike)
const DEMO_LISTINGS = [
  { id: "1", hallId: "demo-1", hall: { name: "Grand Palace", capacity: 400, image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop" }, business: { city: "Prishtinë" }, type: "Dasma" },
  { id: "2", hallId: "demo-2", hall: { name: "Elegance Royal", capacity: 250, image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop" }, business: { city: "Prizren" }, type: "Fejesa" },
  { id: "3", hallId: "demo-3", hall: { name: "Diamond Hall", capacity: 500, image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop" }, business: { city: "Gjakovë" }, type: "Dasma" },
  { id: "4", hallId: "demo-4", hall: { name: "Garden Event", capacity: 150, image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800&auto=format&fit=crop" }, business: { city: "Mitrovicë" }, type: "Evente familjare" },
  { id: "5", hallId: "demo-5", hall: { name: "Premium Resort", capacity: 350, image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800&auto=format&fit=crop" }, business: { city: "Pejë" }, type: "Dasma" },
  { id: "6", hallId: "demo-6", hall: { name: "Crystal Venue", capacity: 200, image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=800&auto=format&fit=crop" }, business: { city: "Gjilan" }, type: "Ditëlindje" },
  { id: "7", hallId: "demo-7", hall: { name: "Imperial Palace", capacity: 600, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop" }, business: { city: "Ferizaj" }, type: "Dasma" },
  { id: "8", hallId: "demo-8", hall: { name: "Lakeview Events", capacity: 180, image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop" }, business: { city: "Vushtrri" }, type: "Fejesa" },
  { id: "9", hallId: "demo-9", hall: { name: "Sky Event Hall", capacity: 300, image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800&auto=format&fit=crop" }, business: { city: "Prishtinë" }, type: "Event Biznesi" },
  { id: "10", hallId: "demo-10", hall: { name: "Golden Restaurant", capacity: 120, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop" }, business: { city: "Prizren" }, type: "Ditëlindje" },
  { id: "11", hallId: "demo-11", hall: { name: "Luxury Tent", capacity: 280, image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop" }, business: { city: "Gjakovë" }, type: "Evente familjare" },
  { id: "12", hallId: "demo-12", hall: { name: "Classic Ballroom", capacity: 450, image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=800&auto=format&fit=crop" }, business: { city: "Mitrovicë" }, type: "Dasma" },
  { id: "13", hallId: "demo-13", hall: { name: "Boutique Venue", capacity: 90, image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop" }, business: { city: "Pejë" }, type: "Fejesa" }
];

export default async function PublicMarketplaceHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Lexojmë sallat nga databaza
  const publishedListings = await prisma.listing.findMany({
    where: { 
      status: "PUBLISHED",
      // SHTUAR: Filtri absolut i çelësit. Nëse çelësi "Listimi Publik" është OFF, salla fshihet!
      hall: {
        is_published: true
      }
    },
    include: {
      hall: true,
      business: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 16 
  });

  // Zëvendësimi dinamik me Demo nëse databaza është e zbrazët
  const displayListings = [...publishedListings, ...DEMO_LISTINGS];
  //const displayListings = publishedListings.length > 0 ? publishedListings : DEMO_LISTINGS; -> kur mbushen me salla aktivizoje kete dhe fshihen demot.

  // Ndarja për të integruar Megabanner-in e dytë
  const firstBatch = displayListings.slice(0, 8);
  const secondBatch = displayListings.slice(8);

  return (
    <main className="min-h-screen bg-[#070d19] text-slate-200 selection:bg-[#8B5CF6] selection:text-white relative font-sans overflow-x-hidden">
      
      {/* Background Efekte */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#8B5CF6]/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[20%] left-0 w-[500px] h-[500px] bg-indigo-900/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* HEADER PREMIUM */}
      <PublicHeader locale={locale} />

      {/* CONTAINER PËR HERO & FILTRA */}
      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-8 w-full">
        
        {/* EDITORIAL HERO SECTION */}
        <section className="relative pt-8 pb-16 md:pt-10 md:pb-24 flex flex-col lg:flex-row items-start justify-between z-10">
          
          <div className="w-full lg:w-[45%] flex flex-col items-start text-left relative z-20">
            <p className="text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4 flex items-center gap-3">
              SALLA • EVENTE • MOMENTE TË VEÇANTA
            </p>
            
            <h1 className="text-5xl md:text-6xl lg:text-[68px] font-serif text-white leading-[1.05] tracking-tight mb-4">
              Gjej sallën ideale për <br />
              <span className="text-[#C4B5FD]" style={premiumItalicStyle}>
                eventin tënd
              </span>
            </h1>
            
            <p className="text-base text-slate-400 leading-relaxed max-w-sm font-light">
              Zbulo sallat më të mira për dasma, fejesa, biznese dhe çdo event tjetër të veçantë, në gjithë Kosovën.
            </p>
          </div>

          <div className="hidden lg:block absolute right-6 lg:right-8 top-[-80px] w-[52%] max-w-[700px] h-[520px] z-0 overflow-visible">
            <div className="w-full h-full overflow-hidden rounded-bl-[160px]">
              <img 
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000&auto=format&fit=crop" 
                alt="Venue background" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#3B1D5C]/30 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#070d19]/95" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070d19] via-[#070d19]/50 to-transparent opacity-95" />
            </div>
            
            <div 
              className="absolute right-[-250px] top-[30%] text-white/90 text-4xl lg:text-3xl rotate-[-5deg] text-right leading-[1.2] drop-shadow-xl"
              style={premiumItalicStyle}
            >
              Çdo event <br/> fillon me një <br/> sallë të mirë <br/>
              <span className="text-1xl mt-4 inline-block font-sans opacity-70" style={{ fontStyle: 'normal' }}>♡</span>
            </div>
          </div>
        </section>

      {/* FLOATING SEARCH PANEL */}
        <section className="relative z-30 -mt-10 md:-mt-16 mb-16 w-full max-w-[1000px] mx-auto">
          <HeroSearch locale={locale} variant="horizontal" />
        </section>
        
      </div>
          
      {/* MEGABANNER 1 */}
      <section className="w-full mb-20 z-10 relative">
        <Megabanner />
      </section>

      {/* LISTA E SALLAVE PREMIUM DHE MEGABANNER 2 */}
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

        {/* Pjesa e parë e sallave (8 salla maksimum) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {firstBatch.map((listing: any) => (
            <Link key={listing.id} href={`/${locale}/salla/${listing.hallId}`} className="group flex flex-col bg-[#101724] rounded-[24px] overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="relative h-[220px] w-full bg-[#0F111A] overflow-hidden">
                {listing.mainImage || listing.hall?.image ? (
                  <img 
                    src={listing.mainImage || listing.hall.image || ""} 
                    alt={listing.hall?.name || "Salla"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-700"/>
                  </div>
                )}
                
                <div className="absolute top-4 left-4 bg-[#B2549C]/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 z-20 shadow-lg border border-white/10">
                  <PartyPopper className="w-3.5 h-3.5 text-white"/>
                  <span className="text-white text-xs font-bold">{listing.type || "Dasma"}</span>
                </div>

                <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#242730]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20">
                  <Heart className="w-4 h-4"/>
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-[#101724] via-transparent to-transparent opacity-40" />
              </div>
              
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
                      <Users className="w-4 h-4 shrink-0"/> Deri në {listing.hall?.capacity || 200} persona
                    </span>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between">
                   <div className="flex flex-wrap gap-2 overflow-hidden max-h-[30px]">
                     <span className="bg-[#1E2332] text-[#94A3B8] text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                       {listing.type || "Dasma"}
                     </span>
                   </div>
                   <div className="w-9 h-9 shrink-0 rounded-full bg-[#1E2332] flex items-center justify-center group-hover:bg-[#8B5CF6] transition-colors ml-2">
                     <ArrowRight className="w-4 h-4 text-white"/>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* MEGABANNER 2 - NË MES TË LISTËS */}
        {displayListings.length > 8 && (
          <div className="w-full my-16">
            <Megabanner/>
          </div>
        )}

        {/* Pjesa e dytë e sallave */}
        {secondBatch.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {secondBatch.map((listing: any) => (
              <Link key={listing.id} href={`/${locale}/salla/${listing.hallId}`} className="group flex flex-col bg-[#101724] rounded-[24px] overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300">
                <div className="relative h-[220px] w-full bg-[#0F111A] overflow-hidden">
                  {listing.mainImage || listing.hall?.image ? (
                    <img 
                      src={listing.mainImage || listing.hall.image || ""} 
                      alt={listing.hall?.name || "Salla"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-700"/>
                    </div>
                  )}
                  
                  <div className="absolute top-4 left-4 bg-[#B2549C]/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 z-20 shadow-lg border border-white/10">
                    <PartyPopper className="w-3.5 h-3.5 text-white"/>
                    <span className="text-white text-xs font-bold">{listing.type || "Dasma"}</span>
                  </div>

                  <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#242730]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20">
                    <Heart className="w-4 h-4"/>
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101724] via-transparent to-transparent opacity-40" />
                </div>
                
                <div className="p-5 flex-1 flex flex-col z-10 bg-[#101724]">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1 group-hover:text-[#C4B5FD] transition-colors">
                      {listing.hall?.name || "Sallë Eventesh"}
                    </h3>
                    <div className="flex flex-col gap-2.5 text-sm font-medium text-[#94A3B8] mb-6">
                      <span className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 shrink-0"/> {listing.business?.city || "Prishtinë"}
                      </span>
                      <span className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 shrink-0"/> Deri në {listing.hall?.capacity || 200} persona
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex flex-wrap gap-2 overflow-hidden max-h-[30px]">
                       <span className="bg-[#1E2332] text-[#94A3B8] text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                         {listing.type || "Dasma"}
                       </span>
                     </div>
                     <div className="w-9 h-9 shrink-0 rounded-full bg-[#1E2332] flex items-center justify-center group-hover:bg-[#8B5CF6] transition-colors ml-2">
                       <ArrowRight className="w-4 h-4 text-white"/>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* SEKSIONI I RI: SI FUNKSIONON */}
      <HowItWorks />

      {/* FOOTER PREMIUM */}
      <PublicFooter locale={locale} />

    </main>
  );
}