import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import TicketsClient from "./TicketsClient";

export const dynamic = "force-dynamic";

export default async function SuperadminTicketsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const user = await prisma.users.findUnique({ where: { email: session.user.email } });
  if (user?.role !== "superadmin") redirect(`/${locale}/biznes`);

  // Marrim të gjitha Tickets bashkë me mesazhet dhe detajet e biznesit
  const tickets = await prisma.tickets.findMany({
    orderBy: { updated_at: 'desc' },
    include: {
      businesses: true,
      messages: {
        orderBy: { created_at: 'asc' }
      }
    }
  });

  const safeTickets = JSON.parse(JSON.stringify(tickets));

  return <TicketsClient locale={locale} tickets={safeTickets} />;
}