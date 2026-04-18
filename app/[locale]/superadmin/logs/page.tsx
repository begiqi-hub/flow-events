import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import AuditLogsClient from "./AuditLogsClient";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const user = await prisma.users.findFirst({ where: { email: session.user.email } });
  if (user?.role !== "superadmin" && user?.role !== "support") redirect(`/${locale}/biznes`);

  // Marrim 200 veprimet e fundit nga tabela E RE e superadminit
  const logs = await prisma.superadmin_logs.findMany({
    orderBy: { created_at: 'desc' },
    take: 200
  });

  const safeLogs = JSON.parse(JSON.stringify(logs));

  return <AuditLogsClient logs={safeLogs} />;
}