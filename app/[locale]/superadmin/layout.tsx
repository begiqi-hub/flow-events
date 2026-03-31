import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import SuperadminLayoutUI from "./SuperadminLayoutUI";

export const dynamic = "force-dynamic";

export default async function SuperadminLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const session = await getServerSession();

  if (!session?.user?.email) redirect(`/${locale}/login`);

  // Kontrollojmë a është VËRTET Superadmin
  const user = await prisma.users.findUnique({ 
    where: { email: session.user.email } 
  });
  
  if (user?.role !== "superadmin") {
    redirect(`/${locale}/biznes`);
  }

  // Marrim njoftimet (P.sh. kërkesat e reja për ndihmë që presin përgjigje)
  const openTickets = await prisma.tickets.findMany({
    where: { status: 'open' },
    orderBy: { updated_at: 'desc' },
    include: { businesses: true }
  });

  const notifications = openTickets.map(t => ({
    id: t.id,
    type: "WARNING", // Ikona do dalë portokalli
    title: t.businesses?.name || "Biznes i panjohur",
    message: t.subject,
    link: `/superadmin/ndihma?ticket=${t.id}`,
    time: "Kërkesë e Re"
  }));

  const safeUser = JSON.parse(JSON.stringify(user));
  const safeNotifications = JSON.parse(JSON.stringify(notifications));

  return (
    <SuperadminLayoutUI user={safeUser} locale={locale} notifications={safeNotifications}>
      {children}
    </SuperadminLayoutUI>
  );
}