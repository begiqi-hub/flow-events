import { prisma } from "../../../../lib/prisma";
import AuditLogsClient from "./AuditLogsClient";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage(props: { params: Promise<{ locale: string }> }) {
  // Nuk kemi më nevojë për getServerSession ose redirect këtu.
  // Mbrojtja e faqes bëhet nga layout.tsx i superadminit.

  // 1. Marrim 200 veprimet e fundit nga tabela e superadminit
  const logs = await prisma.superadmin_logs.findMany({
    orderBy: { created_at: 'desc' },
    take: 200
  });

  // 2. Kthejmë të dhënat në format të sigurt për Client Component
  const safeLogs = JSON.parse(JSON.stringify(logs));

  // 3. I dërgojmë të dhënat te skedari AuditLogsClient
  return <AuditLogsClient logs={safeLogs} />;
}