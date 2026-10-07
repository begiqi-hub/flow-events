import { redirect } from "next/navigation";
import { prisma } from "../../../../../../lib/prisma";
import EditBusinessClient from "./EditBusinessClient";

export const dynamic = "force-dynamic";

export default async function SuperadminEditBusinessPage(props: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await props.params;
  
  // Verifikimi i sesionit dhe rolit është hequr pasi menaxhohet nga superadmin/layout.tsx

  const business = await prisma.businesses.findUnique({
    where: { id }
  });

  // Kthejmë përdoruesin në listë vetëm nëse biznesi specifik nuk gjendet në databazë
  if (!business) {
    redirect(`/${locale}/superadmin/bizneset`);
  }

  // Marrim paketat nëse ke model `Package` në db (Për Dropdown-in e Abonimeve)
  let packages: any[] = [];
  try {
    packages = await prisma.package.findMany();
  } catch (e) {
    console.warn("Modeli Package nuk ekziston ose është bosh.");
  }

  const safeBusiness = JSON.parse(JSON.stringify(business));
  const safePackages = JSON.parse(JSON.stringify(packages));

  return <EditBusinessClient locale={locale} business={safeBusiness} packages={safePackages} />;
}