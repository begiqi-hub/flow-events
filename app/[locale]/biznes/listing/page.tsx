import React from 'react';
import { Globe, CheckCircle2, Circle, ArrowRight, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ListingManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const session = await getServerSession();
  const userEmail = session?.user?.email;

  let realHalls: any[] = [];
  let businessId: string | null | undefined = null;

  if (userEmail) {
    const currentUser = await prisma.users.findUnique({
      where: { email: userEmail },
      select: { business_id: true }
    });

    businessId = currentUser?.business_id;

    if (businessId) {
      realHalls = await prisma.halls.findMany({
        where: { 
          business_id: businessId,
          status: 'active' 
        },
        include: {
          listing: true, 
          businesses: true, 
        }
      });
    }
  }

  const processedHalls = realHalls.map((hall) => {
    const listing = hall.listing;

    const checklist = {
      name: !!hall.name || !!listing?.marketing_name,
      capacity: (hall.capacity || 0) > 0,
      city: !!hall.businesses?.city || !!hall.businesses?.address,
      description: true, // Validimi u hoq, tani është gjithmonë i gjelbër (opsional)
      eventTypes: true,
      mainPhoto: !!listing?.mainImage || !!hall.image, 
    };

    const totalChecks = Object.keys(checklist).length;
    const passedChecks = Object.values(checklist).filter(Boolean).length;
    const completionScore = Math.round((passedChecks / totalChecks) * 100);

    return {
      id: hall.id,
      name: hall.name,
      capacity: hall.capacity,
      listingStatus: (hall.is_published && completionScore === 100) ? "PUBLISHED" : "DRAFT", 
      completionScore,
      checklist
    };
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold uppercase tracking-widest text-indigo-600 mb-4">
          <Globe className="w-4 h-4" />
          HALLEVO.COM
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Listimi Publik</h1>
        <p className="mt-2 text-slate-500 font-medium max-w-2xl">
          Menaxho se si shfaqen sallat e tua në platformën publike. Plotëso të dhënat dhe publiko sallat për të pranuar rezervime të reja.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {processedHalls.map((hall) => (
          <div key={hall.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{hall.name}</h3>
                <p className="text-sm text-slate-500 mt-1">Kapaciteti: Deri {hall.capacity} persona</p>
              </div>
              
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border
                ${hall.listingStatus === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                ${hall.listingStatus === 'DRAFT' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                ${hall.listingStatus === 'INACTIVE' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
              `}>
                {hall.listingStatus === 'PUBLISHED' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                {hall.listingStatus === 'DRAFT' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                {hall.listingStatus === 'INACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                {hall.listingStatus === 'PUBLISHED' ? 'Publikuar' : hall.listingStatus === 'DRAFT' ? 'Draft' : 'Joaktiv'}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-700">Plotësimi i të dhënave</span>
                  <span className="text-sm font-black text-indigo-600">{hall.completionScore}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${hall.completionScore === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${hall.completionScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <ChecklistItem label="Emri i sallës" isDone={hall.checklist.name} />
                <ChecklistItem label="Kapaciteti" isDone={hall.checklist.capacity} />
                <ChecklistItem label="Qyteti dhe Adresa" isDone={hall.checklist.city} />
                <ChecklistItem label="Përshkrimi (Opsionale)" isDone={hall.checklist.description} />
                <ChecklistItem label="Lloji i eventeve" isDone={hall.checklist.eventTypes} />
                <ChecklistItem label="Fotografia kryesore e listimit" isDone={hall.checklist.mainPhoto} />
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                {hall.completionScore < 100 ? (
                  <div className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 mr-1.5" />
                    Plotësoni të dhënat për publikim
                  </div>
                ) : (
                   <div className="text-xs font-medium text-slate-500">
                     Salla është gati për t'u shfaqur publikisht.
                   </div>
                )}

                <Link 
                  href={`/${locale}/biznes/listing/${hall.id}`} 
                  className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2
                  ${hall.completionScore === 100 && hall.listingStatus !== 'PUBLISHED' 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}
                `}>
                  {hall.listingStatus === 'PUBLISHED' ? 'Menaxho' : 'Publiko'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
          </div>
        ))}

        {processedHalls.length === 0 && (
          <div className="col-span-1 lg:col-span-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
               <ImageIcon className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-2">Nuk keni asnjë sallë të regjistruar</h3>
             <p className="text-slate-500 max-w-sm mb-6">Për të publikuar në HALLEVO.COM, fillimisht duhet të shtoni një sallë në modulin e sallave.</p>
             <Link href={`/${locale}/biznes/sallat`} className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition">
               Menaxho Sallat
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistItem({ label, isDone }: { label: string, isDone: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {isDone ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      ) : (
        <Circle className="w-5 h-5 text-slate-300 shrink-0" />
      )}
      <span className={`text-sm font-medium ${isDone ? 'text-slate-700' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}