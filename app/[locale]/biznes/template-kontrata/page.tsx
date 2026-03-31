import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import TemplateClient from "./TemplateClient";

export const dynamic = "force-dynamic";

export default async function ContractTemplatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const user = await prisma.users.findUnique({
    where: { email: session.user.email },
    select: { business_id: true }
  });

  if (!user || !user.business_id) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { id: user.business_id },
    select: { contract_template: true }
  });

  return <TemplateClient business={business} locale={locale} />;
}