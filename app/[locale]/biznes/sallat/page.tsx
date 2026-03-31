import DeleteHallBtn from "./DeleteHallBtn";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import Link from "next/link";
import { Building2, PlusCircle, Pencil, Users, ParkingCircle, Snowflake, Image as ImageIcon } from "lucide-react";
import { getTranslations } from "next-intl/server"; 

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HallsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("HallsPage");

  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) {
    const staffUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });
    if (staffUser && staffUser.business_id) {
      business = await prisma.businesses.findUnique({
        where: { id: staffUser.business_id }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  const halls = await prisma.halls.findMany({
    where: { business_id: business.id },
    orderBy: { created_at: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-gray-400" size={32} />
            {t("pageTitle")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {t("pageSubtitle")}
          </p>
        </div>
        <Link 
          href={`/${locale}/biznes/sallat/shto`}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <PlusCircle size={20} /> {t("addHallBtn")}
        </Link>
      </div>

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
                  // eslint-disable-next-line @next/next/no-img-element
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
                
                <div className="flex items-center gap-3 mb-6 mt-auto">
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

                <div className="pt-4 border-t border-gray-50 flex items-center gap-2">
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
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t("emptyTitle")}</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            {t("emptySubtitle")}
          </p>
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