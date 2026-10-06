import { prisma } from "../../../../lib/prisma";
import BusinessesClient from "./BusinessesClient";

export const dynamic = "force-dynamic";

export default async function SuperadminBusinessesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  
  // SHËNIM: Mbrojtja e faqes dhe sesioni tani menaxhohen nga `superadmin/layout.tsx`.
  // Nuk bëjmë më `redirect` nga ky skedar për të shmangur loop-in.

  // Marrim të gjitha bizneset bashkë me paketën, pronarin dhe listimet aktive
  const rawBusinesses = await prisma.businesses.findMany({
    orderBy: { created_at: 'desc' },
    include: { 
      package: true,
      users: {
        where: { role: 'admin' },
        select: { id: true, email: true, full_name: true }
      },
      // Tërheqim vetëm ID-të e listimeve që janë në Marketplace (të publikuara)
      listings: {
        where: { status: 'PUBLISHED' },
        select: { id: true }
      }
    }
  });

  // Formatimi i të dhënave për të përcaktuar logjikën e platformës
  const formattedBusinesses = rawBusinesses.map((b) => ({
    ...b,
    // Nëse ka të paktën 1 listim të publikuar, bëhet `true`, përndryshe `false`
    has_marketplace: b.listings && b.listings.length > 0
  }));

  // Konvertojmë në objekt të pastër JSON për të shmangur gabimet me datat (Date objects) në Client Component
  const safeBusinesses = JSON.parse(JSON.stringify(formattedBusinesses));

  return <BusinessesClient locale={locale} businesses={safeBusinesses} />;
}