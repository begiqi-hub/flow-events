import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import { getTranslations } from "next-intl/server"; 
import ReservationWizard from "./ReservationWizard";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AddReservationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // --- THËRRASIM PËRKTHIMET ---
  const t = await getTranslations("AddReservationPage");

  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  // ==========================================
  // LOGJIKA UNIVERSALE: PRONAR OSE STAF
  // ==========================================
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
  // ==========================================

  // KËTU ËSHTË NDRYSHIMI: 
  // Marrim VETËM sallat aktive që kanë çelësin e menaxhimit "ON"
  const halls = await prisma.halls.findMany({ 
    where: { 
      business_id: business.id,
      status: { not: 'inactive' },
      is_managed: true // <-- FILTRI I RI PËR MENAXHIM (SaaS)
    },
    orderBy: { created_at: 'asc' }
  });
  
  const menus = await prisma.menus.findMany({ where: { business_id: business.id } });
  const extras = await prisma.extras.findMany({ where: { business_id: business.id } });
  const clients = await prisma.clients.findMany({ where: { business_id: business.id } });

  const safeBusiness = JSON.parse(JSON.stringify(business));
  const safeHalls = JSON.parse(JSON.stringify(halls));
  const safeMenus = JSON.parse(JSON.stringify(menus));
  const safeExtras = JSON.parse(JSON.stringify(extras));
  const safeClients = JSON.parse(JSON.stringify(clients));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t("pageTitle")}</h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">{t("pageSubtitle")}</p>
      </div>

      {safeHalls.length === 0 ? (
        // UI kur nuk ka salla të aktivizuara për menaxhim
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center max-w-3xl mx-auto my-8 shadow-sm">
  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
    <AlertCircle size={30} strokeWidth={2} />
  </div>
  
  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
    Nuk keni asnjë sallë aktive për menaxhim
  </h3>
  
  <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
    Për të regjistruar rezervime të reja në kalendar, duhet të keni të paktën një sallë me <strong className="text-slate-700">Menaxhimin SaaS të aktivizuar</strong>.
  </p>
  
  <Link 
    href={`/${locale}/biznes/sallat`}
    className="bg-[#0f172a] hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md inline-flex items-center justify-center gap-2 text-sm"
  >
    Shko tek Sallat për ta aktivizuar
  </Link>
</div>
      ) : (
        // UI standard kur ka të paktën 1 sallë për menaxhim
        <ReservationWizard 
          business={safeBusiness} 
          halls={safeHalls} 
          menus={safeMenus} 
          extras={safeExtras} 
          clients={safeClients} 
          locale={locale} 
        />
      )}
    </div>
  );
}