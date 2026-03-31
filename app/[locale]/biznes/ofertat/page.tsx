import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import QuotationsClient from "./QuotationsClient";

export const dynamic = "force-dynamic";

export default async function OfertatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email },
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

  // Marrim datën e sotme në mesnatë (UTC) për të hequr ofertat e vjetra
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Marrim VETËM ofertat (quotation) që janë nga dita e sotme e tutje
  const quotations = await prisma.bookings.findMany({
    where: { 
      business_id: business.id,
      status: 'quotation',
      event_date: { gte: today } // Fsheh ofertat e skaduara
    },
    include: {
      clients: true,
      halls: true,
      booking_extras: { include: { extras: true } }
    },
    orderBy: { event_date: 'asc' } // I renditim nga ajo që ndodh më shpejt
  });

  const allMenus = await prisma.menus.findMany({
    where: { business_id: business.id }
  });

  const quotationsWithMenus = quotations.map((booking: any) => {
    const matchedMenu = allMenus.find(m => m.id === booking.menu_id) || null;
    return { ...booking, menus: matchedMenu };
  });

  const safeBusiness = JSON.parse(JSON.stringify(business));
  const safeQuotations = JSON.parse(JSON.stringify(quotationsWithMenus));

  return <QuotationsClient business={safeBusiness} quotations={safeQuotations} locale={locale} />;
}