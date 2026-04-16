import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import BookingsClient from "./BookingsClient";
import { startOfMonth, endOfMonth } from "date-fns"; 

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RezervimetPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const filterQuery = resolvedSearchParams?.filter as string; 

  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  // Blloku 1: Kërkojmë nëse është Pronari (FSHIMË audit_logs NGA KËTU)
  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email },
    include: {
      bookings: {
        include: {
          clients: true,
          halls: true,
          creator: true,
          payments: { include: { users: true } }, 
          booking_extras: { include: { extras: true } }
        },
        orderBy: { event_date: "asc" }
      }
    }
  });

  // Blloku 2: Nëse s'është pronari, atëherë është Stafi (FSHIMË audit_logs NGA KËTU)
  if (!business) {
    const staffUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });
    if (staffUser && staffUser.business_id) {
      business = await prisma.businesses.findUnique({
        where: { id: staffUser.business_id },
        include: {
          bookings: {
            include: {
              clients: true,
              halls: true,
              creator: true,
              payments: { include: { users: true } }, 
              booking_extras: { include: { extras: true } }
            },
            orderBy: { event_date: "asc" }
          }
        }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  // Marrim të gjitha menutë e këtij biznesi
  const allMenus = await prisma.menus.findMany({
    where: { business_id: business.id }
  });

  // MAGJIA KËTU: Marrim të gjithë Historikun për rezervimet e këtij biznesi veçmas
  const allAuditLogs = await prisma.audit_logs.findMany({
    where: { business_id: business.id, entity: "bookings" },
    include: { users: true },
    orderBy: { created_at: 'desc' }
  });

  // BASHKIMI I MENUSË, PAGESAVE DHE HISTORIKUT (Audit Logs)
  let bookingsWithMenus = business.bookings.map((booking: any) => {
    const matchedMenu = allMenus.find(m => m.id === booking.menu_id) || null;
    
    // Gjejmë vetëm ditarin që i përket këtij rezervimi specifik
    const bookingLogs = allAuditLogs.filter(log => log.entity_id === booking.id);
    
    // ZGJIDHJA PËR DOUBLE PAYMENT
    let safePaid = 0;
    booking.payments?.forEach((p: any) => {
      if (p.type === 'refund') {
        safePaid -= Number(p.amount);
      } else {
        safePaid += Number(p.amount);
      }
    });

    return {
      ...booking,
      menus: matchedMenu,
      safe_total_paid: safePaid,
      audit_logs: bookingLogs // 👈 I bashkëngjisim ditarin këtu në fund!
    };
  });

  if (filterQuery === 'this_month') {
    const now = new Date();
    const sMonth = startOfMonth(now);
    const eMonth = endOfMonth(now);
    
    bookingsWithMenus = bookingsWithMenus.filter((b: any) => {
      const eventDate = new Date(b.event_date);
      return eventDate >= sMonth && eventDate <= eMonth;
    });
  } 
  else if (filterQuery === 'debt') {
    bookingsWithMenus = bookingsWithMenus.filter((b: any) => {
      const total = Number(b.total_amount) || 0;
      return (total - b.safe_total_paid) > 0;
    });
  }

  const finalBusiness = {
    ...business,
    bookings: bookingsWithMenus 
  };

  const safeBusiness = JSON.parse(JSON.stringify(finalBusiness));

  return <BookingsClient business={safeBusiness} locale={locale} />;
}