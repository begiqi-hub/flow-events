import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import BusinessesClient from "./BusinessesClient";

export const dynamic = "force-dynamic";

export default async function SuperadminBusinessesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const user = await prisma.users.findUnique({ where: { email: session.user.email } });
  if (user?.role !== "superadmin") redirect(`/${locale}/biznes`);

  // Marrim të gjitha bizneset bashkë me paketën dhe pronarin (admin)
  const businesses = await prisma.businesses.findMany({
    orderBy: { created_at: 'desc' },
    include: { 
      package: true,
      users: {
        where: { role: 'admin' },
        select: { id: true, email: true, full_name: true }
      }
    }
  });

  const safeBusinesses = JSON.parse(JSON.stringify(businesses));

  return <BusinessesClient locale={locale} businesses={safeBusinesses} />;
}