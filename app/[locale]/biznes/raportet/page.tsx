import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma"; 
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  const allBookings = await prisma.bookings.findMany({
    where: { 
      business_id: business.id,
      status: { notIn: ['cancelled', 'draft'] }
    },
    include: { 
      halls: true,
      clients: true 
    },
    orderBy: { event_date: 'asc' }
  });

  // MAGJIA KËTU: Kthejmë Decimal dhe Date në format të thjeshtë JSON
  const serializedBookings = JSON.parse(JSON.stringify(allBookings));

  return (
    <ReportsClient 
      business={business} 
      allBookings={serializedBookings} 
      locale={locale} 
    />
  );
}