import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import BusinessesClient from "./BusinessesClient";

export const dynamic = "force-dynamic";

export default async function SuperadminBusinessesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  // Përdorim findFirst për të shmangur problemet me cache-in e Prisma
  const user = await prisma.users.findFirst({ where: { email: session.user.email } });
  
  // ZGJIDHJA: Lejojmë që edhe 'superadmin' edhe 'support' ta shohin këtë faqe
  if (user?.role !== "superadmin" && user?.role !== "support") {
    redirect(`/${locale}/biznes`);
  }

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