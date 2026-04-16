import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  let userRole = "admin";
  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email },
    include: {
      users: true
    }
  });

  if (!business) {
    const staffUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });
    if (staffUser && staffUser.business_id) {
      userRole = staffUser.role; // Këtu kapim rolin e saktë (psh. 'reception')
      business = await prisma.businesses.findUnique({
        where: { id: staffUser.business_id },
        include: {
          users: true
        }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  const safeBusiness = JSON.parse(JSON.stringify(business));

  return <ProfileClient business={safeBusiness} locale={locale} userRole={userRole} />;
}