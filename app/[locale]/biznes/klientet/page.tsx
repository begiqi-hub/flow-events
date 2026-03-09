import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import KlientetClient from "./KlientetClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  const clients = await prisma.clients.findMany({
    where: { business_id: business.id },
    include: {
      bookings: {
        select: {
          total_amount: true,
          status: true
        }
      }
    },
    // KËTU BËHET MAGJIA: Renditja alfabetike nga A te Zh
    orderBy: { name: 'asc' } 
  });

  // Pastrojmë të dhënat (sidomos çmimet nga databaza) para se t'ia dërgojmë dizajnit
  const safeClients = JSON.parse(JSON.stringify(clients));

  return <KlientetClient clients={safeClients} locale={locale} />;
}