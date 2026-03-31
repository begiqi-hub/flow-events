import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../../lib/prisma";
import EditBusinessClient from "./EditBusinessClient";

export const dynamic = "force-dynamic";

export default async function SuperadminEditBusinessPage(props: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await props.params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const user = await prisma.users.findUnique({ where: { email: session.user.email } });
  if (user?.role !== "superadmin") redirect(`/${locale}/biznes`);

  const business = await prisma.businesses.findUnique({
    where: { id }
  });

  if (!business) {
    redirect(`/${locale}/superadmin/bizneset`);
  }

  // Marrim paketat nëse ke model `Package` në db (Për Dropdown-in e Abonimeve)
  // Nëse nuk ke një model 'Package' ende, lëre një array bosh
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