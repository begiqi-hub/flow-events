import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import AbonimiClient from "./AbonimiClient";

export const dynamic = "force-dynamic";

export default async function AbonimiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  // 1. Tërheqim biznesin
  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email },
    include: { package: true }
  });

  if (!business) {
    const staffUser = await prisma.users.findUnique({ where: { email: session.user.email } });
    if (staffUser?.business_id) {
      business = await prisma.businesses.findUnique({
        where: { id: staffUser.business_id },
        include: { package: true }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  // 2. Tërheqim paketat, të dhënat e sistemit dhe të bankës
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
    />
  );
}