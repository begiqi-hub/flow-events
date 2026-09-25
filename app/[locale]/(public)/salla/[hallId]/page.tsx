import React from 'react';
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from 'next/link';
import { 
  MapPin, 
  Users, 
  CheckCircle2, 
  Info, 
  ArrowLeft, 
  Phone, 
  Mail, 
  Image as ImageIcon, 
  Youtube,
  Wind,
  Car,
  Heart,
  ArrowRight,
  User,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';
import RequestForm from "./RequestForm"; 
import HallGallery from "./HallGallery";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

export const revalidate = 3600;

// Mbetet e pandryshuar logjika e Metadata
export async function generateMetadata({ params }: { params: Promise<{ hallId: string }> }) {
  const { hallId } = await params;
  
  const listing = await prisma.listing.findUnique({
    where: { hallId: hallId, status: "PUBLISHED" },
    include: { hall: true, business: true }
  });

  if (!listing) {
    return {
      title: "Salla nuk u gjet | HALLEVO",
      description: "Kjo sallë nuk ekziston ose është hequr nga publikimi."
    };
  }

  const title = `${listing.marketing_name || listing.hall.name} në ${listing.address || listing.business.city || 'Kosovë'} | HALLEVO`;
  const description = listing.hall.description 
    ? listing.hall.description.substring(0, 155) + "..."
    : `Rezervoni sallën ${listing.marketing_name || listing.hall.name} për eventin tuaj. Kapaciteti deri në ${listing.hall.capacity} persona.`;
  const imageUrl = listing.mainImage || listing.hall.image || "https://hallevo.com/default-share-image.jpg";

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://hallevo.com/sq/salla/${hallId}`,
      siteName: 'HALLEVO',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: listing.marketing_name || listing.hall.name }],
      locale: 'sq_AL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
    },
  };
}

// Font editorial luksoz për detaje (p.sh. teksti i footerit)
const premiumItalicStyle: React.CSSProperties = { 
  fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif', 
  fontStyle: 'italic', 
  letterSpacing: '0.02em' 
};

export default async function PublicHallDetails({ params }: { params: Promise<{ locale: string, hallId: string }> }) {
  const { locale, hallId } = await params;

  // 1. Lexo të dhënat e listimit nga baza e të dhënave (LOGJIKA E PANDRYSHUAR)
  const listing = await prisma.listing.findUnique({
    where: { hallId: hallId },
    include: {
      hall: true,
      business: true,
    }
  });

  if (!listing || listing.status !== "PUBLISHED") {
    notFound();
  }

  // 2. Lexo salla të tjera nga i njëjti biznes (LOGJIKA E PANDRYSHUAR)
  const otherListings = await prisma.listing.findMany({
    where: {
      businessId: listing.businessId,
      status: "PUBLISHED",
      hallId: { not: hallId } 
    },
    include: {
      hall: true
    },
    take: 3
  });

  const displayTitle = listing.marketing_name || listing.hall.name;
  const displayAddress = listing.address || listing.business.city || "Adresa e pacaktuar";
  const galleryImages = (listing.gallery as string[]) || [];

  return (
    <main className="min-h-screen bg-[#0A0D14] text-slate-200 selection:bg-[#8B5CF6] selection:text-white relative font-sans overflow-x-hidden">
      
      {/* Background Efekte (Premium Dark Luxury) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#8B5CF6]/5 blur-[150px] rounded-full pointer-events-none z-0" />
      
      <PublicHeader locale={locale} showBackButton={true} />

      {/* HERO IMMERSIVE */}
      <section className="relative w-full h-[360px] md:h-[480px] lg:h-[550px] bg-[#0F111A]">
        {listing.mainImage || listing.hall.image ? (
          <img 
            src={listing.mainImage || listing.hall.image || ""} 
            alt={displayTitle} 
            className="w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-slate-800" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/60 to-transparent opacity-95" />
        
        {/* Hero Content positioned at bottom */}
        <div className="absolute bottom-0 left-0 w-full px-6 lg:px-8 pb-10 md:pb-16 z-10">
          <div className="max-w-[1200px] mx-auto flex flex-col items-start">
            
            
            {/* Business Badge */}
            <div className="flex items-center gap-3 mb-5 bg-white/5 backdrop-blur-md border border-white/10 p-1.5 pr-5 rounded-full shadow-lg">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {listing.business.logo_url ? (
                  <img src={listing.business.logo_url} alt={listing.business.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="font-bold text-white text-[10px] uppercase">{listing.business.name.substring(0, 2)}</span>
                )}
              </div>
              <span className="text-xs md:text-sm font-semibold text-slate-200 tracking-wide">{listing.business.name}</span>
            </div>

            {/* Hall Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight mb-6 leading-[1.1]">
              {displayTitle}
            </h1>

            {/* Location & Capacity Metadata */}
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-light text-slate-300">
              <span className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#C4B5FD]" /> 
                {displayAddress}
              </span>
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#C4B5FD]" /> 
                Deri në {listing.hall.capacity} persona
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN CONTENT & SIDEBAR */}
      <section className="max-w-[1200px] mx-auto px-6 lg:px-8 py-12 md:py-20 flex flex-col lg:flex-row gap-12 lg:gap-16 relative z-20">
        
        {/* Left Column: Details */}
        
        <div className="w-full lg:w-[65%] space-y-16">
          {/* Desktop Back Button */}
            <Link href={`/${locale}/sallat`} className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors mb-8 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full w-fit">
              <ArrowLeft className="w-4 h-4" /> Kthehu te kërkimi
            </Link>
          
          {/* About / Rreth Sallës */}
          <div>
            <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
              Rreth Sallës
            </h2>
            <p className="text-slate-400 leading-[1.8] text-base md:text-lg font-light whitespace-pre-wrap">
              {listing.marketing_description || listing.hall.description || "Nuk ka përshkrim të detajuar për këtë sallë."}
            </p>
          </div>

          {/* Characteristics */}
          <div>
            <h3 className="text-xl font-serif text-white mb-6">Karakteristikat</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[#A855F7]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold">Kapaciteti</p>
                  <p className="text-sm font-medium text-slate-200">{listing.hall.capacity} persona</p>
                </div>
              </div>

              <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                  <Wind className="w-5 h-5 text-[#A855F7]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold">Klimatizimi</p>
                  <p className="text-sm font-medium text-slate-200">
                    {listing.hall.ac ? "AC i përfshirë" : "E padisponueshme"}
                  </p>
                </div>
              </div>

              <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-[#A855F7]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold">Parking</p>
                  <p className="text-sm font-medium text-slate-200">
                    {listing.hall.parking ? "Parking privat" : "I padisponueshëm"}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Premium Gallery Component (Pandryshuar Logjika e Komponentit, vetëm wrapper) */}
          <div className="prose-gallery-wrapper">
             <HallGallery images={[listing.mainImage || listing.hall.image, ...galleryImages].filter(Boolean) as string[]} />
          </div>

          {/* YouTube Video Presentation */}
          {listing.youtube_url && (
            <div>
              <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                Video Prezantimi
              </h3>
              <div className="aspect-video w-full rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-[#0F111A]">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={listing.youtube_url.includes('watch?v=') ? listing.youtube_url.replace('watch?v=', 'embed/') : listing.youtube_url} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Sidebar for CTA & Contact */}
        <div className="w-full lg:w-[35%] space-y-6 lg:sticky lg:top-28 h-fit">
          
          {/* Primary CTA Form Wrapper */}
          <div className="bg-[#111827] border border-white/5 rounded-[24px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
             {/* Dekore të lehta brenda formës */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 blur-[50px] rounded-full pointer-events-none" />
             
             {/* Komponenti funksional i RequestForm mbetet i paprekur. Ky wrapper vetëm rregullon sfondin rreth tij. */}
             <RequestForm businessId={listing.businessId} hallId={listing.hallId} />
          </div>

          {/* Direct Contact Card */}
          <div className="bg-[#111827] border border-white/5 rounded-[24px] p-6 md:p-8 shadow-xl">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
              Kontakto drejtpërdrejt
            </h4>
            <div className="space-y-4">
              
              {/* Phone */}
              <a href={`tel:${listing.business.phone}`} className="flex items-center gap-4 bg-[#151B2B] hover:bg-[#1E2538] border border-white/5 p-4 rounded-xl transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#8B5CF6]/20 transition-colors">
                  <Phone className="w-4 h-4 text-[#A855F7]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Telefon</p>
                  <span className="text-sm font-medium text-white">{listing.business.phone}</span>
                </div>
              </a>
              
              {/* Email (Conditional) */}
              {listing.business.email && (
                <a href={`mailto:${listing.business.email}`} className="flex items-center gap-4 bg-[#151B2B] hover:bg-[#1E2538] border border-white/5 p-4 rounded-xl transition-colors group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#8B5CF6]/20 transition-colors">
                    <Mail className="w-4 h-4 text-[#A855F7]" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Email</p>
                    <span className="text-sm font-medium text-white truncate block">{listing.business.email}</span>
                  </div>
                </a>
              )}

            </div>
          </div>

        </div>

      </section>

      {/* RELATED HALLS SECTION */}
      {otherListings.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 lg:px-8 py-20 lg:py-24 border-t border-white/5 relative z-20">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-white tracking-tight mb-2">
                Salla të tjera nga {listing.business.name}
              </h2>
              <p className="text-slate-400 text-sm font-light">Eksploroni hapësira të tjera nga i njëjti biznes.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherListings.map((other) => (
              <Link key={other.id} href={`/${locale}/salla/${other.hallId}`} className="group flex flex-col bg-[#111827] rounded-[24px] overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300">
                
                <div className="relative h-[220px] w-full bg-[#0F111A] overflow-hidden">
                  {other.mainImage || other.hall.image ? (
                    <img 
                      src={other.mainImage || other.hall.image || ""} 
                      alt={other.marketing_name || other.hall.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-700" />
                    </div>
                  )}
                  
                  <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#242730]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20">
                    <Heart className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-50" />
                </div>
                
                <div className="p-5 flex-1 flex flex-col z-10 bg-[#111827]">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1 group-hover:text-[#C4B5FD] transition-colors">
                      {other.marketing_name || other.hall.name}
                    </h3>
                    <div className="flex flex-col gap-2.5 text-sm font-medium text-[#94A3B8] mb-6">
                      <span className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 shrink-0" /> 
                        Deri në {other.hall.capacity} persona
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                     <span className="text-[13px] font-semibold text-slate-300 group-hover:text-white transition-colors">
                       Shiko detajet
                     </span>
                     <div className="w-9 h-9 shrink-0 rounded-full bg-[#1E2332] flex items-center justify-center group-hover:bg-[#8B5CF6] transition-colors ml-2">
                       <ArrowRight className="w-4 h-4 text-white" />
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER PREMIUM */}
      <PublicFooter locale={locale} />

    </main>
  );
}