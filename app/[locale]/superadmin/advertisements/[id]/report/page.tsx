import { prisma } from "@/lib/prisma";
import { ArrowLeft, Eye, MousePointerClick, TrendingUp, Calendar, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { sq } from "date-fns/locale";
import PrintButton from "@/components/admin/PrintButton";

export default async function AdvertisementReport({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  
  const ad = await prisma.advertisement.findUnique({
    where: { id },
    include: { business: true }
  });

  if (!ad) {
    redirect(`/${locale}/superadmin/advertisements`);
  }

  const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(2) : "0.00";
  const isExpired = ad.endDate ? new Date() > new Date(ad.endDate) : false;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto print:max-w-full print:p-0 print:m-0 print:bg-white print:text-black">
      
      {/* Header i Raportit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 print:mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/superadmin/advertisements`} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition print:hidden">
            <ArrowLeft size={20} className="text-gray-600"/>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 print:text-3xl">Raporti i Performancës</h1>
            <p className="text-xs md:text-sm text-gray-500 print:text-gray-600">Përditësuar: {format(new Date(), "dd MMM yyyy, HH:mm")}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 print:hidden">
          <Link 
            href={`/${locale}/superadmin/advertisements/${ad.id}/edit`}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            Ndrysho
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Të Dhënat e Klientit dhe Fushatës */}
      <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300 print:rounded-lg">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 print:text-gray-500"><Building2 size={14}/> Detajet e Klientit</h3>
          <p className="font-bold text-base md:text-lg text-gray-900">{ad.business?.name || "Klient i Jashtëm"}</p>
          <p className="text-sm text-gray-500 mt-1">Fushata: {ad.name}</p>
          {ad.targetUrl && (
            <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 mt-3 font-medium print:text-blue-700 print:underline">
              <ExternalLink size={14}/> {ad.targetUrl}
            </a>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300 print:rounded-lg">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 print:text-gray-500"><Calendar size={14}/> Periudha kohore</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Nisja:</span>
              <span className="font-bold text-gray-900">{ad.startDate ? format(new Date(ad.startDate), "dd MMM yyyy", { locale: sq }) : "N/A"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Skadimi:</span>
              <span className={`font-bold ${isExpired ? 'text-red-600' : 'text-gray-900'} print:text-black`}>
                {ad.endDate ? format(new Date(ad.endDate), "dd MMM yyyy", { locale: sq }) : "Pa afat"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2.5 border-t border-gray-50 print:border-gray-200">
              <span className="text-gray-500">Statusi:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-black tracking-wider uppercase ${isExpired ? 'bg-red-50 text-red-600' : ad.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'} print:border print:border-gray-300 print:bg-transparent print:text-black`}>
                {isExpired ? 'E SKADUAR' : ad.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistikat Kryesore (KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300 print:rounded-lg flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 print:text-gray-500">Shikime</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-none">{ad.views}</h2>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-xl print:bg-transparent print:border print:border-gray-200"><Eye size={20} className="text-indigo-600 print:text-black"/></div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300 print:rounded-lg flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 print:text-gray-500">Klikime</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-none">{ad.clicks}</h2>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl print:bg-transparent print:border print:border-gray-200"><MousePointerClick size={20} className="text-emerald-600 print:text-black"/></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300 print:rounded-lg flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 print:text-gray-500">CTR</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-none">{ctr}%</h2>
          </div>
          <div className="bg-orange-50 p-2.5 rounded-xl print:bg-transparent print:border print:border-gray-200"><TrendingUp size={20} className="text-orange-600 print:text-black"/></div>
        </div>
      </div>

      {/* Pamja e Reklamës */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300 print:rounded-lg overflow-hidden print:break-inside-avoid">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 print:bg-gray-100 print:[print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider print:text-black">Pamja Vizuale (Preview)</h3>
        </div>
        
        <div className="p-4 md:p-6 flex justify-center bg-gray-50/30 print:bg-white">
          {/* I rëndësishëm: Klasa print-color-adjust detyron ngjyrat e sfondit të printohen */}
          <div className="w-full max-w-[800px] h-[160px] md:h-[220px] relative rounded-2xl overflow-hidden shadow-lg print:shadow-none border border-gray-200/50 bg-[#101724] print:[print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
            <Image 
              src={ad.desktopImage} 
              alt={ad.title || "Banner"} 
              fill
              className="object-cover print:object-contain"
              sizes="(max-width: 800px) 100vw, 800px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070d19]/90 via-[#070d19]/40 to-transparent z-10 print:hidden" />
            <div className="absolute top-3 left-3 bg-black/50 print:bg-black px-2.5 py-1 rounded-full z-20 backdrop-blur-sm print:[print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Sponsorizuar</span>
            </div>
            
            <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-20 pr-4 print:bg-black/60 print:p-2 print:rounded-lg print:[print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
              {ad.title && <h3 className="text-lg md:text-xl font-bold text-white mb-0.5">{ad.title}</h3>}
              {ad.description && <p className="text-[11px] md:text-xs text-white/90 line-clamp-2">{ad.description}</p>}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}