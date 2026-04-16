import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma"; 
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, parseISO } from "date-fns";
import RecepsioniClient from "./RecepsioniClient";

export const dynamic = "force-dynamic";

export default async function RecepsioniPage(props: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { locale } = await props.params;
  const { date } = await props.searchParams;

  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect(`/${locale}/login`);
  }

  // 1. PËRGATITIM NDRYSHORET PËR EMËR DHE ROL
  let userRole = "Administrator"; 
  let userName = "";

  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (business) {
    userName = business.name; // Nëse është pronari, shfaq emrin e biznesit
  }

  if (!business) {
    const staffUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });
    if (staffUser && staffUser.business_id) {
      userName = staffUser.full_name; // Kapim emrin real të përdoruesit
      userRole = staffUser.role === 'reception' ? 'Recepsioni' : (staffUser.role === 'manager' ? 'Menaxher' : 'Administrator');
      
      business = await prisma.businesses.findUnique({
        where: { id: staffUser.business_id }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  const currentDate = date ? parseISO(date) : new Date();
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });

  const allHalls = await prisma.halls.findMany({
    where: { business_id: business.id }
  });

  const bookings = await prisma.bookings.findMany({
    where: { 
      business_id: business.id,
      status: { in: ['confirmed', 'pending', 'postponed'] }, // Completed dhe Cancelled nuk shfaqen!
      event_date: { gte: startDate, lte: endDate }
    },
    include: {
      halls: true,
      clients: true,
      booking_extras: { include: { extras: true } }
    }
  });

  const safeBookings = JSON.parse(JSON.stringify(bookings));
  const safeHalls = JSON.parse(JSON.stringify(allHalls));
  const safeBusiness = JSON.parse(JSON.stringify(business));

  return (
    <RecepsioniClient 
      bookings={safeBookings} 
      halls={safeHalls}
      business={safeBusiness} 
      locale={locale} 
      currentDateStr={currentDate.toISOString()} 
      userName={userName} // <--- Ia dërgojmë emrin e saktë Client-it
      userRole={userRole} // <--- Ia dërgojmë rolin e saktë Client-it
    />
  );
}