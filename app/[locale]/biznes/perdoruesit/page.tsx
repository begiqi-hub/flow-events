import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import PerdoruesitClient from "./PerdoruesitClient";

export const dynamic = "force-dynamic";

export default async function PerdoruesitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email },
    include: {
      users: {
        where: {
          role: { notIn: ['superadmin', 'support'] } // <--- Fsheh superadminin dhe supportin
        },
        orderBy: { created_at: 'desc' }
      }
    }
  });

  if (!business) {
    const staffUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });
    if (staffUser && staffUser.business_id) {
      business = await prisma.businesses.findUnique({
        where: { id: staffUser.business_id },
        include: {
          users: {
            where: {
              role: { notIn: ['superadmin', 'support'] } // <--- Fsheh edhe këtu
            },
            orderBy: { created_at: 'desc' }
          }
        }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  const safeBusiness = JSON.parse(JSON.stringify(business));

  return <PerdoruesitClient business={safeBusiness} locale={locale} />;
}