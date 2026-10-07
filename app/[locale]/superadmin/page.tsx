import { prisma } from "../../../lib/prisma";
import SuperadminDashboardClient from "./SuperadminDashboardClient";

export const dynamic = "force-dynamic";

export default async function SuperadminPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  
  // Verifikimi i sesionit dhe logjika e ridrejtimit (redirect) janë hequr.
  // Mbrojtja e kësaj faqeje menaxhohet tërësisht nga layout.tsx i superadminit.

  // 1. STATISTIKAT KRYESORE
  const totalBusinesses = await prisma.businesses.count();
  const activeBusinesses = await prisma.businesses.count({ where: { status: 'active' } });
  const trialBusinesses = await prisma.businesses.count({ where: { status: 'trial' } });
  const totalUsers = await prisma.users.count();
  const openTickets = await prisma.tickets.count({ where: { status: 'open' } });

  // Llogarisim Të Ardhurat Mujore të Platformës (MRR) nga bizneset aktive
  const businessesWithPackages = await prisma.businesses.findMany({
    where: { status: 'active' },
    include: { package: true }
  });
  
  // Rregullim i vogël te llogaritja e mrr për të shmangur gabimet nëse package mungon
  const mrr = businessesWithPackages.reduce((sum, b) => {
    const monthlyPrice = Number(b.package?.monthly_price) || 0;
    return sum + monthlyPrice;
  }, 0);

  // 2. BIZNESET E FUNDIT TË REGJISTRUARA
  const recentBusinesses = await prisma.businesses.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: { package: true }
  });

  // 3. KËRKESAT E FUNDIT PËR NDIHMË (TICKETS)
  const recentTickets = await prisma.tickets.findMany({
    where: { status: 'open' },
    take: 4,
    orderBy: { updated_at: 'desc' },
    include: { businesses: true }
  });

  // Sigurohemi që të dhënat kalojnë të pastra në Client Component
  const safeStats = { totalBusinesses, activeBusinesses, trialBusinesses, totalUsers, openTickets, mrr };
  const safeBusinesses = JSON.parse(JSON.stringify(recentBusinesses));
  const safeTickets = JSON.parse(JSON.stringify(recentTickets));

  return (
    <SuperadminDashboardClient 
      locale={locale} 
      stats={safeStats} 
      recentBusinesses={safeBusinesses} 
      recentTickets={safeTickets} 
    />
  );
}