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

  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email },
    include: {
      bookings: {
        include: {
          clients: true,
          halls: true,
          payments: true, 
          booking_extras: { include: { extras: true } }
        },
      }
    }
  });

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
              payments: true, 
              booking_extras: { include: { extras: true } }
            },
          }
        }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  const allMenus = await prisma.menus.findMany({
    where: { business_id: business.id }
  });

  // BASHKIMI I MENUSË DHE LLOGARITJA E SAKTË E PAGESAVE ME REFUNDS
  let bookingsWithMenus = business.bookings.map((booking: any) => {
    const matchedMenu = allMenus.find(m => m.id === booking.menu_id) || null;
    
    // ZGJIDHJA PËR DOUBLE PAYMENT (Math e pastër)
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
      // Shtojmë një fushë ndihmëse që komponenti klient (BookingsClient) ta përdorë:
      safe_total_paid: safePaid 
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