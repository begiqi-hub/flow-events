import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import StaffClient from "./StaffClient";

export const dynamic = "force-dynamic";

export default async function SuperadminUsersPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const currentUser = await prisma.users.findUnique({ where: { email: session.user.email } });
  if (currentUser?.role !== "superadmin") redirect(`/${locale}/biznes`); 

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

  return <StaffClient locale={locale} users={safeUsers} currentUserEmail={session.user.email} />;
}