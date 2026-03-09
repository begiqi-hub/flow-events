import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, parseISO } from "date-fns";
import CalendarClient from "./CalendarClient"; // Lidhja me skedarin e ri

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CalendarPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { locale } = await params;
  const { date } = await searchParams;

  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  const currentDate = date ? parseISO(date) : new Date();
  
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });

  // Tërheqim rezervimet bashkë me Ekstrat
  const bookings = await prisma.bookings.findMany({
    where: { 
      business_id: business.id,
      event_date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      halls: true,
      clients: true,
      booking_extras: {
        include: { extras: true }
      }
    }
  });

  // Pastrimi nga gabimi i Decimal
  const safeBookings = JSON.parse(JSON.stringify(bookings));
  const safeBusiness = JSON.parse(JSON.stringify(business));

  return (
    <CalendarClient 
      bookings={safeBookings} 
      business={safeBusiness} 
      locale={locale} 
      currentDateStr={currentDate.toISOString()} // Kalojmë datën e saktë këtu
    />
  );
}