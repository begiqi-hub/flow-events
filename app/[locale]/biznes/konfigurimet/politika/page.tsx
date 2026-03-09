import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import PolitikaClient from "./PolitikaClient";

export const dynamic = "force-dynamic";

export default async function PolitikaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  return <PolitikaClient business={business} />;
}