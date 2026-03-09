import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma"; 
import BookingsClient from "./BookingsClient"; 

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReservationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  // SHTUAM booking_extras QË TË DALIN NË POPUP
  const bookings = await prisma.bookings.findMany({
    where: { business_id: business.id },
    include: {
      clients: true,
      halls: true,
      payments: true,
      booking_extras: {
        include: { extras: true }
      }
    },
    orderBy: { event_date: 'asc' }
  });

  // 1. Pastrojmë të dhënat nga formati Decimal i Prismës
  const safeBookings = JSON.parse(JSON.stringify(bookings));
  const safeBusiness = JSON.parse(JSON.stringify(business));

  // 2. I dërgojmë të dhënat e pastruara tek Klienti
  return (
    <BookingsClient 
      initialBookings={safeBookings} 
      business={safeBusiness} 
      locale={locale} 
    />
  );
}