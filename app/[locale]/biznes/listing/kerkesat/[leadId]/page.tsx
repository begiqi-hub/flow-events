import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, Calendar, Users, MessageSquare, CheckCircle2 } from "lucide-react";
import LeadStatusButton from "./LeadStatusButton";

export const dynamic = "force-dynamic";

export default async function LeadDetailsPage({ params }: { params: Promise<{ locale: string, leadId: string }> }) {
  const { locale, leadId } = await params;
  
  const session = await getServerSession();
  const userEmail = session?.user?.email;
  if (!userEmail) redirect(`/${locale}/login`);

  const currentUser = await prisma.users.findUnique({
    where: { email: userEmail },
    select: { business_id: true }
  });

  const businessId = currentUser?.business_id;
  if (!businessId) redirect(`/${locale}/login`);

  const lead = await prisma.bookings.findUnique({
    where: { 
      id: leadId,
      business_id: businessId,
    },
    include: {
      clients: true,
      halls: true,
    }
  });

  if (!lead) redirect(`/${locale}/biznes/listing/kerkesat`);

  // Logjika e saktë e statusit
  const isContacted = lead.status === "confirmed" || (lead.admin_notes || "").includes("Kërkesë e trajtuar");

  // Nxjerrja e llojit të eventit dhe shënimeve nga formati i ri
  let eventType = "I pacaktuar";
  let cleanNotes = lead.admin_notes || "";

  if (cleanNotes.includes("Lloji i eventit:")) {
    const parts = cleanNotes.split("| Shënime:");
    eventType = parts[0].replace("[HALLEVO_LEAD] Lloji i eventit:", "").trim();
    cleanNotes = parts[1] ? parts[1].replace("[HALLEVO_LEAD] Kërkesë e trajtuar dhe kontaktuar.", "").trim() : "";
  } else {
    // Për kërkesat e vjetra që nuk kanë pasur fushën "Lloji i eventit"
    cleanNotes = cleanNotes.replace("[HALLEVO_LEAD] Kërkesë për ofertë: ", "").replace("[HALLEVO_LEAD] Kërkesë e trajtuar dhe kontaktuar.", "").trim();
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link href={`/${locale}/biznes/listing/kerkesat`} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kthehu te Kërkesat
      </Link>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header-i i Kërkesës */}
        <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest mb-3 ${isContacted ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
              {isContacted ? 'E Trajtuar' : 'Kërkesë e Re'}
            </div>
            <h1 className="text-2xl font-black text-slate-900">Kërkesë për {lead.halls?.name}</h1>
            <p className="text-slate-500 text-sm mt-1">Pranuar më {new Date(lead.created_at).toLocaleDateString("sq-AL", { hour: '2-digit', minute:'2-digit' })}</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Detajet e Klientit</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Emri i plotë</p>
                    <p className="font-bold text-slate-900">{lead.clients?.name}</p>
                  </div>
                </div>
                
                <a href={`tel:${lead.clients?.phone}`} className="flex items-center gap-3 hover:bg-slate-50 p-2 -ml-2 rounded-xl transition group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100">
                    <Phone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Telefoni (Kliko për të thirrur)</p>
                    <p className="font-bold text-indigo-700">{lead.clients?.phone}</p>
                  </div>
                </a>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Detajet e Eventit</h3>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-400">Data e kërkuar</p>
                    <p className="font-bold text-slate-900">{new Date(lead.event_date).toLocaleDateString("sq-AL")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-400">Numri i të ftuarve</p>
                    <p className="font-bold text-slate-900">{lead.participants} persona</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-400">Lloji i Eventit</p>
                    <p className="font-bold text-indigo-900">{eventType}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8 flex flex-col h-full">
            <section className="flex-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Shënime nga klienti</h3>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 h-[150px] overflow-y-auto">
                {cleanNotes ? (
                  <p className="text-sm text-slate-700 leading-relaxed italic">"{cleanNotes}"</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">Klienti nuk ka lënë shënime shtesë.</p>
                )}
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Veprimet</h3>
              <p className="text-slate-500 text-sm mb-6">Pasi të keni kontaktuar klientin dhe të keni dhënë ofertën tuaj, shënojeni kërkesën si të trajtuar.</p>
              
              {!isContacted ? (
                <LeadStatusButton leadId={lead.id} />
              ) : (
                <div className="w-full py-3 rounded-xl font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Klienti është kontaktuar
                </div>
              )}
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}