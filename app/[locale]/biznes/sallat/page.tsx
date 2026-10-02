import DeleteHallBtn from "./DeleteHallBtn";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import Link from "next/link";
import { Building2, Pencil, Users, ParkingCircle, Snowflake, Image as ImageIcon, Globe, CalendarCheck, PlusCircle } from "lucide-react";
import { getTranslations } from "next-intl/server"; 
import HallToggles from "./HallToggles";
import AddHallButton from "./AddHallButton"; // Importojmë butonin e ri inteligjent

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HallsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("HallsPage");

  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  // Marrim biznesin bashkë me të dhënat e Pakos për të lexuar limitin
  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email },
    include: { package: true }
  });

  if (!business) {
    const staffUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });
    if (staffUser && staffUser.business_id) {
      business = await prisma.businesses.findUnique({
        where: { id: staffUser.business_id },
        include: { package: true }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  const halls = await prisma.halls.findMany({
    where: { business_id: business.id },
    orderBy: { created_at: 'asc' }
  });

  // LLOGARITJA E LIMITEVE
  const HARD_LIMIT_PUBLIC = 5; // Limiti fiks i platformës
  const currentTotalHalls = halls.length;
  const percentPublic = Math.min((currentTotalHalls / HARD_LIMIT_PUBLIC) * 100, 100);

  // Kujdes: Ndrysho "halls_limit" me emrin e saktë të fushës në tabelën tënde Package
  const LIMIT_MANAGEMENT = business.package?.halls_limit || 1; 
  const currentManagedHalls = halls.filter(h => h.is_managed).length;
  const percentManaged = Math.min((currentManagedHalls / LIMIT_MANAGEMENT) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* HEADER KRYESOR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-gray-400" size={32} />
            {t("pageTitle")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {t("pageSubtitle")}
          </p>
        </div>
        
        {/* BUTONI INTELIGJENT */}
        <AddHallButton 
          currentHallsCount={currentTotalHalls} 
          maxPublicHalls={HARD_LIMIT_PUBLIC} 
          locale={locale} 
        />
      </div>

      {/* SEKSIONI I RI: LIMITET DHE LEGJENDA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        
        {/* 1. Karta e Limiteve të Listimit (Publik) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Globe size={16} className="text-blue-500" /> Salla të Regjistruara
            </span>
            <span className="text-sm font-black text-gray-900">{currentTotalHalls} / {HARD_LIMIT_PUBLIC}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
            <div className={`h-2 rounded-full transition-all ${currentTotalHalls >= HARD_LIMIT_PUBLIC ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${percentPublic}%` }}></div>
          </div>
          <p className="text-xs font-medium text-gray-500">
            Keni hapësirë edhe për <strong className="text-gray-700">{Math.max(HARD_LIMIT_PUBLIC - currentTotalHalls, 0)} salla</strong> të tjera në llogari.
          </p>
        </div>

        {/* 2. Karta e Limiteve të Menaxhimit (SaaS) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <CalendarCheck size={16} className="text-emerald-500" /> Kalendarë Aktivë
            </span>
            <span className="text-sm font-black text-gray-900">{currentManagedHalls} / {LIMIT_MANAGEMENT}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
            <div className={`h-2 rounded-full transition-all ${currentManagedHalls >= LIMIT_MANAGEMENT ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${percentManaged}%` }}></div>
          </div>
          <p className="text-xs font-medium text-gray-500">
            Sipas pakos <strong className="text-gray-700">{business.package?.name || "bazë"}</strong>, mund të menaxhoni {LIMIT_MANAGEMENT} salla njëkohësisht.
          </p>
        </div>

        {/* 3. Legjenda Shpjeguese për Çelësat */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-center gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-4 mt-0.5 bg-blue-500 rounded-full flex items-center px-0.5 shrink-0"><div className="w-3 h-3 bg-white rounded-full translate-x-4"></div></div>
            <div>
              <p className="text-xs font-bold text-gray-800">Listimi Publik (HALLEVO)</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">E bën sallën të dukshme për klientët në treg. Mund të keni deri në 5 salla publike.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-4 mt-0.5 bg-emerald-500 rounded-full flex items-center px-0.5 shrink-0"><div className="w-3 h-3 bg-white rounded-full translate-x-4"></div></div>
            <div>
              <p className="text-xs font-bold text-gray-800">Menaxhimi i Brendshëm</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Aktivizon kalendarin për stafin tuaj. Limiti varet nga pakoja që keni zgjedhur.</p>
            </div>
          </div>
        </div>

      </div>

      {/* LISTA E SALLAVE */}
      {halls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall: any) => (
            <div key={hall.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
              
              <div className="h-48 bg-gray-50 relative border-b border-gray-100">
                <div className="absolute top-4 left-4 z-10">
                  {hall.status === 'active' || !hall.status ? (
                    <span className="bg-emerald-100/90 backdrop-blur-sm border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {t("statusActive")}
                    </span>
                  ) : (
                    <span className="bg-red-100/90 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> {t("statusInactive")}
                    </span>
                  )}
                </div>

                {hall.image ? (
                  <img src={hall.image} alt={hall.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={40} className="mb-2 opacity-30" />
                    <span className="text-sm font-medium">{t("noPhoto")}</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm font-bold text-gray-900 text-sm flex items-center gap-2 z-10">
                  <Users size={16} className="text-blue-500" /> {hall.capacity} pax
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{hall.name}</h3>
                {hall.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{hall.description}</p>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  {hall.parking && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                      <ParkingCircle size={14} /> {t("parkingLabel")}
                    </span>
                  )}
                  {hall.ac && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                      <Snowflake size={14} /> {t("acLabel")}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                   <HallToggles 
                     hallId={hall.id} 
                     businessId={business.id} 
                     initialIsPublished={hall.is_published ?? false} 
                     initialIsManaged={hall.is_managed ?? false} 
                   />
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center gap-2 mt-4">
                  <Link 
                    href={`/${locale}/biznes/sallat/ndrysho/${hall.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Pencil size={16} /> {t("editBtn")}
                  </Link>
                  <div className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition-colors cursor-pointer">
                    <DeleteHallBtn id={hall.id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm mt-8">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t("emptyTitle")}</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            {t("emptySubtitle")}
          </p>
          {/* Në Empty State, e fshehim butonin e limitit sepse padyshim ka 0 salla */}
          <Link 
            href={`/${locale}/biznes/sallat/shto`} 
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md"
          >
            <PlusCircle size={20} />
            {t("createFirstHallBtn")}
          </Link>
        </div>
      )}
    </div>
  );
}