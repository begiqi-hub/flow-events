import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import StaffClient from "./StaffClient";

export const dynamic = "force-dynamic";

export default async function SuperadminUsersPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  
  // Sasia minimale e sigurisë: Sesioni merret vetëm për të ushqyer prop-in 'currentUserEmail'.
  // Çdo logjikë ridrejtimi (redirect) dhe thirrje në databazë për verifikim roli është hequr, 
  // pasi superadmin/layout.tsx tashmë e garanton që përdoruesi ka akses.
  const session = await getServerSession();
  const currentUserEmail = session?.user?.email || "";

  // Marrim VETËM stafin e platformës (Superadminët)
  const users = await prisma.users.findMany({
    where: {
      role: {
        in: ['superadmin', 'support']
      }
    },
    orderBy: { created_at: 'desc' }
  });

  const safeUsers = JSON.parse(JSON.stringify(users));

  return <StaffClient locale={locale} users={safeUsers} currentUserEmail={currentUserEmail} />;
}