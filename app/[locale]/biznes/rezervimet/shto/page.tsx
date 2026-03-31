import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import { getTranslations } from "next-intl/server"; 
import ReservationWizard from "./ReservationWizard";

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

  // KËTU ËSHTË NDRYSHIMI: Marrim vetëm sallat që NUK janë "inactive"
  const halls = await prisma.halls.findMany({ 
    where: { 
      business_id: business.id,
      status: { not: 'inactive' } // <-- FILTRI MAGJIK
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
      <ReservationWizard 
        business={safeBusiness} 
        halls={safeHalls} 
        menus={safeMenus} 
        extras={safeExtras} 
        clients={safeClients} 
        locale={locale} 
      />
    </div>
  );
}