import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma"; // Shto '../' nëse ka vizë të kuqe
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import DashboardClient from "./DashboardClient"; // Importojmë skedarin që krijuam

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BusinessDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  // LLOGARITJET E DATAVE
  const now = new Date();
  const sWeek = startOfWeek(now, { weekStartsOn: 1 }); // Java fillon të Hënën
  const eWeek = endOfWeek(now, { weekStartsOn: 1 });
  const sMonth = startOfMonth(now);
  const eMonth = endOfMonth(now);

  // Tërheqim të gjitha rezervimet aktive të këtij biznesi
  const allBookings = await prisma.bookings.findMany({
    where: { 
      business_id: business.id,
      status: { notIn: ['cancelled', 'draft'] }
    },
    include: { clients: true, halls: true }
  });

  // STATISTIKAT E KARTAVE
  const totalCount = allBookings.length;
  
  const weekCount = allBookings.filter((b: any) => 
    new Date(b.event_date) >= sWeek && new Date(b.event_date) <= eWeek
  ).length;

  // REZERVIMET E KËTIJ MUAJI (Për Listën dhe Kalendarin)
  const monthBookings = allBookings
    .filter((b: any) => new Date(b.event_date) >= sMonth && new Date(b.event_date) <= eMonth)
    .sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  
  const monthCount = monthBookings.length;

  // Evitojmë gabimet me datat duke i kthyer ato në tekst përpara se t'i dërgojmë në Client Component
  const serializedMonthBookings = JSON.parse(JSON.stringify(monthBookings));

  return (
    <DashboardClient 
      business={business} 
      locale={locale} 
      stats={{ total: totalCount, week: weekCount, month: monthCount }}
      monthBookings={serializedMonthBookings}
    />
  );
}