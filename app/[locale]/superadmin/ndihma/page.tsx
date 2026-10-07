import { prisma } from "../../../../lib/prisma";
import TicketsClient from "./TicketsClient";

export const dynamic = "force-dynamic";

export default async function SuperadminTicketsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  
  // Kontrollet e sesionit dhe ridrejtimet janë fshirë.
  // Siguria menaxhohet tërësisht nga skedari superadmin/layout.tsx.

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