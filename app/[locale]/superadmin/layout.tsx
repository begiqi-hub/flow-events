import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import SuperadminLayoutUI from "./SuperadminLayoutUI";

export const dynamic = "force-dynamic";

export default async function SuperadminLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const session = await getServerSession();

  if (!session?.user?.email) redirect(`/${locale}/login`);

  const user = await prisma.users.findFirst({ 
    where: { email: session.user.email } 
  });
  
  if (user?.role !== "superadmin" && user?.role !== "support") {
    redirect(`/${locale}/biznes`);
  }

  // ==========================================
  // LOGJIKA E NJOFTIMEVE (NOTIFICATIONS)
  // ==========================================
  let allNotifications: any[] = [];
  const today = new Date();

  // 1. Kërkesat për Ndihmë (Tickets) të hapura
  const openTickets = await prisma.tickets.findMany({
    where: { status: 'open' },
    orderBy: { created_at: 'desc' },
    take: 10,
    include: { businesses: true }
  });
  
  openTickets.forEach(t => {
    allNotifications.push({
      id: `ticket_${t.id}`,
      title: `🎟️ Tiketë e re: ${t.businesses?.name || 'Biznes i panjohur'}`,
      message: t.subject,
      link: `/${locale}/superadmin/ndihma?ticket=${t.id}`,
      date: t.created_at || new Date()
    });
  });

  // 2. Pagesat në Pritje (Abonimet që kërkojnë aprovim bankar)
  const pendingPayments = await prisma.sa_payments.findMany({
    where: { status: 'pending' },
    orderBy: { created_at: 'desc' },
    take: 10,
    include: { businesses: true }
  });
  
  pendingPayments.forEach(p => {
    allNotifications.push({
      id: `pay_${p.id}`,
      title: `💰 Pagesë në pritje: ${p.businesses?.name || 'Biznes'}`,
      message: `Shuma: ${Number(p.amount).toFixed(2)}€ pret aprovimin tuaj.`,
      link: `/${locale}/superadmin/pagesat`,
      date: p.created_at || new Date()
    });
  });

  // 3. Biznese "Trial" që u skadon afati brenda 3 ditëve
  const nextThreeDays = new Date();
  nextThreeDays.setDate(today.getDate() + 3);
  
  const expiringTrials = await prisma.businesses.findMany({
    where: {
      status: 'trial',
      trialEndsAt: {
        gte: today,
        lte: nextThreeDays
      }
    },
    take: 5
  });
  
  expiringTrials.forEach(b => {
    allNotifications.push({
      id: `exp_${b.id}`,
      title: `⚠️ Skadim i afërt: ${b.name}`,
      message: `Paketa Trial e këtij biznesi skadon së shpejti!`,
      link: `/${locale}/superadmin/bizneset`,
      date: today 
    });
  });

  // 4. Biznese të reja të regjistruara (24 orët e fundit)
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  const newBusinesses = await prisma.businesses.findMany({
    where: {
      created_at: { gte: yesterday }
    },
    take: 5
  });
  
  newBusinesses.forEach(b => {
    allNotifications.push({
      id: `new_${b.id}`,
      title: `🚀 Biznes i ri: ${b.name}`,
      message: `U regjistrua me sukses në platformë.`,
      link: `/${locale}/superadmin/bizneset`,
      date: b.created_at || new Date()
    });
  });

  // Renditim të gjitha njoftimet nga më e reja tek e vjetra (Sipas Datës)
  allNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Prisim vetëm 15 të parat që mos të stërmbushet këmbanat në ekran
  const recentNotifications = allNotifications.slice(0, 15);

  const safeUser = JSON.parse(JSON.stringify(user));
  const safeNotifications = JSON.parse(JSON.stringify(recentNotifications));

  return (
    <SuperadminLayoutUI user={safeUser} locale={locale} notifications={safeNotifications}>
      {children}
    </SuperadminLayoutUI>
  );
}