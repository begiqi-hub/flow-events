import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import SupportClient from "./SupportClient";

export const dynamic = "force-dynamic";

export default async function SupportPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  let business = await prisma.businesses.findUnique({ where: { email: session.user.email } });
  if (!business) {
    const staff = await prisma.users.findUnique({ where: { email: session.user.email } });
    if (staff?.business_id) business = await prisma.businesses.findUnique({ where: { id: staff.business_id } });
  }
  if (!business) redirect(`/${locale}/login`);

  // Marrim të gjitha Tickets dhe Mesazhet e këtij biznesi
  const tickets = await prisma.tickets.findMany({
    where: { business_id: business.id },
    orderBy: { updated_at: 'desc' },
    include: {
      messages: {
        orderBy: { created_at: 'asc' } // Mesazhet renditen nga më i vjetri te më i riu
      }
    }
  });

  const safeTickets = JSON.parse(JSON.stringify(tickets));

  return <SupportClient locale={locale} initialTickets={safeTickets} />;
}