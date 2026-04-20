import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import AbonimiClient from "./AbonimiClient";

export const dynamic = "force-dynamic";

export default async function AbonimiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email },
    include: { 
      package: true,
      sa_payments: {
        orderBy: { created_at: 'desc' }
      }
    }
  });

  if (!business) {
    const staffUser = await prisma.users.findFirst({ where: { email: session.user.email } });
    if (staffUser?.business_id) {
      business = await prisma.businesses.findUnique({
        where: { id: staffUser.business_id },
        include: { 
          package: true,
          sa_payments: {
            orderBy: { created_at: 'desc' }
          }
        }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  // ==========================================
  // KODI I RI: NUMËROJMË ASETET AKTIVE (PËR KONTROLLIN E DOWNGRADE)
  // ==========================================
  const activeHalls = await prisma.halls.count({ where: { business_id: business.id, status: 'active' } });
  const activeUsers = await prisma.users.count({ where: { business_id: business.id, status: 'active' } });
  const activeMenus = await prisma.menus.count({ where: { business_id: business.id, is_active: true } });

  const currentUsage = {
    halls: activeHalls,
    users: activeUsers,
    menus: activeMenus
  };
  // ==========================================

  const allPackages = await prisma.package.findMany({
    orderBy: { monthly_price: 'asc' }
  });

  const systemSettings = await prisma.system_settings.findFirst() || {};
  const bankAccount = await prisma.bank_accounts.findFirst({ where: { is_active: true } }) || {};

  const safeBusiness = JSON.parse(JSON.stringify(business));
  const safePackages = JSON.parse(JSON.stringify(allPackages));
  const safeSystemSettings = JSON.parse(JSON.stringify(systemSettings));
  const safeBankAccount = JSON.parse(JSON.stringify(bankAccount));

  return (
    <AbonimiClient 
      business={safeBusiness} 
      packages={safePackages} 
      locale={locale} 
      systemSettings={safeSystemSettings}
      bankAccount={safeBankAccount}
      currentUsage={currentUsage} // <--- Ia kalojmë numërimin klientit
    />
  );
}