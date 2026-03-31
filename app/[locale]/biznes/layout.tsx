import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import BusinessLayoutUI from "./BusinessLayoutUI";
import { NextIntlClientProvider } from "next-intl"; 
import { getMessages, getTranslations } from "next-intl/server";
import FlowAssistant from "./FlowAssistant";
import GlobalAlert from "@/components/GlobalAlert"; // <-- Sigurohu që rruga e importit është e saktë

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  const messages = await getMessages();
  const tNotif = await getTranslations("Notifications");

  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  // 1. MARRJA E BIZNESIT
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

  // 2. MARRJA E NJOFTIMIT GLOBAL (SHTESA E RE)
  const activeAlert = await prisma.global_alerts.findFirst({
    where: { 
      is_active: true,
      OR: [
        { expires_at: null },
        { expires_at: { gt: new Date() } }
      ]
    },
    orderBy: { created_at: 'desc' }
  });

  // --- LOGJIKA E NOTIFIKIMEVE (E PA NDRYSHUAR) ---
  const symbol = { "EUR": "€", "USD": "$", "GBP": "£", "CHF": "CHF", "ALL": "L" }[business.currency] || "€";
  const notifications: any[] = [];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); 
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); 
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const tomorrowEnd = new Date(todayEnd);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  const upcomingEventsRaw = await prisma.bookings.findMany({
    where: {
      business_id: business.id,
      event_date: { gte: todayStart, lte: tomorrowEnd },
      status: { notIn: ['cancelled', 'draft', 'quotation'] } 
    },
    include: { clients: true, halls: true }
  });

  const todaysEvents = upcomingEventsRaw.filter(e => e.event_date >= todayStart && e.event_date <= todayEnd);
  const tomorrowsEvents = upcomingEventsRaw.filter(e => e.event_date >= tomorrowStart && e.event_date <= tomorrowEnd);

  todaysEvents.forEach(ev => {
    notifications.push({
      id: `today_${ev.id}`,
      type: "TODAY",
      title: tNotif("todayEventTitle"),
      message: tNotif("todayEventMsg", { client: ev.clients?.name || "...", hall: ev.halls?.name || "..." }),
      link: `/biznes/rezervimet/ndrysho/${ev.id}`,
      time: new Date(ev.start_time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})
    });
  });

  tomorrowsEvents.forEach(ev => {
    notifications.push({
      id: `tomorrow_${ev.id}`,
      type: "TOMORROW",
      title: tNotif("tomorrowEventTitle"),
      message: tNotif("tomorrowEventMsg", { client: ev.clients?.name || "...", hall: ev.halls?.name || "..." }),
      link: `/biznes/rezervimet/ndrysho/${ev.id}`,
      time: new Date(ev.start_time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})
    });
  });

  const nextWeekEnd = new Date(todayEnd);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

  const missingContracts = await prisma.bookings.findMany({
    where: {
      business_id: business.id,
      event_date: { gte: todayStart, lte: nextWeekEnd },
      status: { notIn: ['cancelled', 'completed', 'quotation'] },
      client_signature_url: null 
    },
    include: { clients: true }
  });

  missingContracts.forEach(ev => {
    notifications.push({
      id: `contract_${ev.id}`,
      type: "WARNING",
      title: tNotif("unsignedContractTitle"),
      message: tNotif("unsignedContractMsg", { client: ev.clients?.name || "..." }),
      link: `/biznes/rezervimet/${ev.id}/kontrata`,
      time: new Date(ev.event_date).toLocaleDateString('en-GB').replace(/\//g, '.')
    });
  });

  const allPastBookings = await prisma.bookings.findMany({
    where: {
      business_id: business.id,
      event_date: { lt: todayStart },
      status: { in: ['completed', 'confirmed'] }
    },
    include: { clients: true, payments: true }
  });

  allPastBookings.forEach(ev => {
    const total = Number(ev.total_amount) || 0;
    const paid = ev.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const left = total - paid;
    
    if (left > 0) {
      notifications.push({
        id: `debt_${ev.id}`,
        type: "DANGER",
        title: tNotif("unpaidDebtTitle"),
        message: tNotif("unpaidDebtMsg", { client: ev.clients?.name || "...", amount: `${symbol} ${left.toFixed(2)}` }),
        link: `/biznes/rezervimet/ndrysho/${ev.id}`,
        time: new Date(ev.event_date).toLocaleDateString('en-GB').replace(/\//g, '.')
      });
    }
  });

  const safeBusiness = JSON.parse(JSON.stringify(business));
  const safeNotifications = JSON.parse(JSON.stringify(notifications));

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* SHFAQJA E NJOFTIMIT GLOBAL "SMART" */}
      {activeAlert && (
        <GlobalAlert 
          id={activeAlert.id}
          title={(activeAlert.translations as any)?.[locale]?.title || (activeAlert.translations as any)?.['sq']?.title || "Njoftim"}
          message={(activeAlert.translations as any)?.[locale]?.message || (activeAlert.translations as any)?.['sq']?.message || ""}
          type={activeAlert.type}
        />
      )}

      <BusinessLayoutUI business={safeBusiness} notifications={safeNotifications}>
        {children}
        <FlowAssistant locale={locale} />
      </BusinessLayoutUI>
    </NextIntlClientProvider>
  );
}