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

  // 1. ZGJIDHJA PËRFUNDIMTARE: Përjashtojmë vetëm ato që ekzistojnë në enum
  const allBookings = await prisma.bookings.findMany({
    where: { 
      business_id: business.id,
      // Heqim 'draft' dhe 'quotation' (Ofertat) që të mos dalin te të Hyrat
      status: { notIn: ['draft', 'quotation'] } 
    },
    include: { 
      halls: true,
      clients: true,
      payments: true,
      booking_extras: { 
        include: { extras: true } 
      } 
    },
    orderBy: { event_date: 'asc' }
  });

  const allMenus = await prisma.menus.findMany({
    where: { business_id: business.id }
  });

  // 3. Kryqëzojmë të dhënat, llogarisim koston dhe NET CASHFLOW (Pagesat - Rimbursimet)
  const bookingsWithCosts = allBookings.map((b: any) => {
    const currentMenu = allMenus.find((m: any) => m.id === b.menu_id);
    
    const participants = Number(b.participants) || 0;
    const menuInternalCost = currentMenu?.internal_cost ? Number(currentMenu.internal_cost) : 0;
    const totalMenuCost = participants * menuInternalCost;

    let totalExtrasCost = 0;
    if (b.booking_extras && b.booking_extras.length > 0) {
      b.booking_extras.forEach((be: any) => {
        const extraCost = be.extras?.internal_cost ? Number(be.extras.internal_cost) : 0;
        totalExtrasCost += (extraCost * (Number(be.qty) || 1));
      });
    }

    const calculated_cost = totalMenuCost + totalExtrasCost;

    // MATEMATIKA E RE FINANCIARE (PËR RAPORTET)
    let net_paid = 0;
    let refunded = 0;
    if (b.payments) {
      b.payments.forEach((p: any) => {
        if (p.type === 'refund') {
          net_paid -= Number(p.amount);
          refunded += Number(p.amount);
        } else {
          net_paid += Number(p.amount);
        }
      });
    }

    // Nëse është anuluar, "e ardhura e pritshme" është vetëm gjoba që i mbajtëm (net_paid)
    // Nëse nuk është anuluar, e ardhura e pritshme është totali i kontratës.
    const expected_revenue = b.status === 'cancelled' ? net_paid : (Number(b.total_amount) || 0);

    return {
      ...b,
      calculated_cost: calculated_cost,
      net_paid: net_paid,            // <- Të ardhurat reale në arkë
      refunded_amount: refunded,      // <- Sa para kemi kthyer
      expected_revenue: expected_revenue // <- Të ardhurat që presim të bëjmë
    };
  });

  const serializedBookings = JSON.parse(JSON.stringify(bookingsWithCosts));
  const serializedBusiness = JSON.parse(JSON.stringify(business));

  return (
    <ReportsClient 
      business={serializedBusiness} 
      allBookings={serializedBookings} 
    />
  );
}