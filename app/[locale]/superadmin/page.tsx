import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import SuperadminDashboardClient from "./SuperadminDashboardClient";

export const dynamic = "force-dynamic";

export default async function SuperadminPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  // Kontrollojmë nëse është vërtet Superadmin
  const user = await prisma.users.findUnique({ where: { email: session.user.email } });
  if (user?.role !== "superadmin") redirect(`/${locale}/biznes`); // Nëse s'është, ktheje te biznesi

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
  const mrr = businessesWithPackages.reduce((sum, b) => sum + (b.package?.price || 0), 0);

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