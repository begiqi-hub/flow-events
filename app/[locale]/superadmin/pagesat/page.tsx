import { prisma } from "../../../../lib/prisma";
import PaymentsClient from "./PaymentsClient";

export const dynamic = "force-dynamic";

export default async function PagesatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const payments = await prisma.sa_payments.findMany({
    include: {
      businesses: true // Tërheqim biznesin
    },
    orderBy: { created_at: 'desc' }
  });

  // Marrim të gjitha paketat për të përkthyer ID-në që vjen te "description"
  const packages = await prisma.package.findMany();

  // Marrja e të dhënave të sistemit për faturën
  const systemSettings = await prisma.system_settings.findFirst() || {};
  const bankAccount = await prisma.bank_accounts.findFirst({ where: { is_active: true } }) || {};

  return (
    <PaymentsClient 
      initialPayments={JSON.parse(JSON.stringify(payments))} 
      packages={JSON.parse(JSON.stringify(packages))} // SHTUAR KËTU
      locale={locale} 
      systemSettings={JSON.parse(JSON.stringify(systemSettings))}
      bankAccount={JSON.parse(JSON.stringify(bankAccount))}
    />
  );
}