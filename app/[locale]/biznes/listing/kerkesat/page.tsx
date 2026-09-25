import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Calendar, Users, Phone, MessageSquare, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ListingLeadsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  
  const session = await getServerSession();
  const userEmail = session?.user?.email;
  if (!userEmail) redirect(`/${locale}/login`);

  const currentUser = await prisma.users.findUnique({
    where: { email: userEmail },
    select: { business_id: true }
  });

  const businessId = currentUser?.business_id;
  if (!businessId) redirect(`/${locale}/login`);

  // 1. Logjika e Parametrave të URL-së (Filtri dhe Paginimi)
  const currentTab = resolvedSearchParams.tab || "new"; 
  const currentPage = parseInt(resolvedSearchParams.page || "1", 10);
  const take = 12; 
  const skip = (currentPage - 1) * take;

  // 2. Krijimi i kushteve të kërkimit (Query) në Prisma
  const isContactedCondition = {
    OR: [
      { status: "confirmed" },
      { admin_notes: { contains: "Kërkesë e trajtuar" } }
    ]
  };

  const whereCondition = {
    business_id: businessId,
    admin_notes: { contains: "[HALLEVO_LEAD]" },
    ...(currentTab === "new" ? { NOT: isContactedCondition } : isContactedCondition)
  };

  // 3. Ekzekutimi paralel për të marrë të dhënat dhe totalin për paginimin
  const [leads, totalLeads] = await Promise.all([
    prisma.bookings.findMany({
      where: whereCondition,
      include: { clients: true, halls: true },
      orderBy: { created_at: 'desc' },
      take: take,
      skip: skip,
    }),
    prisma.bookings.count({ where: whereCondition })
  ]);

  const totalPages = Math.ceil(totalLeads / take);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Kërkesat nga Marketplace</h1>
          <p className="text-slate-500 text-sm mt-1">
            Menaxhoni klientët që ju kanë kontaktuar përmes portalit publik HALLEVO.COM.
          </p>
        </div>
        <Link href={`/${locale}/biznes/listing`} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition w-fit">
          Kthehu te Listimet
        </Link>
      </div>

      {/* TABS PËR MENAXHIMIN E KËRKESAVE */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-px">
        <Link 
          href={`/${locale}/biznes/listing/kerkesat?tab=new`}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${currentTab === "new" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          Kërkesa të Reja
        </Link>
        <Link 
          href={`/${locale}/biznes/listing/kerkesat?tab=contacted`}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${currentTab === "contacted" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          Të Trajtuara
        </Link>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Nuk u gjet asnjë kërkesë</h3>
          <p className="text-slate-500 text-sm max-w-sm">
            {currentTab === "new" ? "Sapo të merrni kërkesa të reja, ato do të shfaqen këtu." : "Nuk keni shënuar asnjë kërkesë si të trajtuar ende."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {leads.map((lead) => {
              const isContacted = currentTab === "contacted";
              
              let cleanNotes = lead.admin_notes || "";
              if (cleanNotes.includes("Lloji i eventit:")) {
                cleanNotes = cleanNotes.split("| Shënime:")[1]?.replace("[HALLEVO_LEAD] Kërkesë e trajtuar dhe kontaktuar.", "").trim() || "";
              } else {
                cleanNotes = cleanNotes.replace("[HALLEVO_LEAD] Kërkesë për ofertë: ", "").replace("[HALLEVO_LEAD] Kërkesë e trajtuar dhe kontaktuar.", "").trim();
              }
              
              return (
                <div key={lead.id} className={`bg-white border rounded-2xl overflow-hidden transition ${isContacted ? 'border-slate-200 shadow-sm opacity-80 hover:opacity-100' : 'border-indigo-100 shadow-md'}`}>
                  <div className={`p-5 border-b flex justify-between items-start ${isContacted ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50/30 border-indigo-50'}`}>
                    <div>
                      {isContacted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
                          E Trajtuar
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider mb-2">
                          Kërkesë e re
                        </span>
                      )}
                      <h3 className="font-bold text-slate-900">{lead.clients?.name || "Klient i panjohur"}</h3>
                    </div>
                    <a href={`tel:${lead.clients?.phone || ""}`} className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition">
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Data: {new Date(lead.event_date).toLocaleDateString("sq-AL")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>Të ftuar: {lead.participants}</span>
                    </div>
                    
                    {cleanNotes && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
                          <MessageSquare className="w-3 h-3" /> Mesazhi
                        </div>
                        <p className="text-sm text-slate-700 italic truncate">{cleanNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <Link href={`/${locale}/biznes/listing/kerkesat/${lead.id}`} className="block w-full py-2.5 bg-white border border-slate-200 rounded-lg text-center text-sm font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition">
                      Shiko Detajet
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* KONTROLLET E PAGINIMIT */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <span className="text-sm text-slate-500 font-medium">
                Faqja {currentPage} nga {totalPages} ({totalLeads} total)
              </span>
              <div className="flex gap-2">
                {currentPage > 1 ? (
                  <Link href={`/${locale}/biznes/listing/kerkesat?tab=${currentTab}&page=${currentPage - 1}`} className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50">
                    <ChevronLeft className="w-4 h-4" /> Para
                  </Link>
                ) : (
                  <button disabled className="flex items-center gap-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-400 cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" /> Para
                  </button>
                )}
                
                {currentPage < totalPages ? (
                  <Link href={`/${locale}/biznes/listing/kerkesat?tab=${currentTab}&page=${currentPage + 1}`} className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50">
                    Tjetra <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button disabled className="flex items-center gap-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-400 cursor-not-allowed">
                    Tjetra <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}