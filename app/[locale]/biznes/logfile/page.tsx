import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import LogfileClient from "./LogfileClient";
import { getTranslations } from "next-intl/server"; 

export default async function LogfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) {
    const staffUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });
    if (staffUser && staffUser.business_id) {
      business = await prisma.businesses.findUnique({
        where: { id: staffUser.business_id }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  const tEntity = await getTranslations("Entities");

  const logs = await prisma.audit_logs.findMany({
    where: { business_id: business.id },
    orderBy: { created_at: 'desc' },
    include: {
      users: true 
    },
    take: 100 
  });

  const formattedLogs = logs.map(log => {
    const translatedEntity = tEntity.has(log.entity as any) 
      ? tEntity(log.entity as any) 
      : log.entity.toUpperCase();

    let cleanDetails = log.after_state || log.before_state || "";
    try {
      const parsedJson = JSON.parse(cleanDetails);
      if (parsedJson && parsedJson.detaje) {
        cleanDetails = parsedJson.detaje;
      }
    } catch (e) {
      
    }

    return {
      id: log.id,
      created_at: log.created_at,
      user_name: log.users?.full_name || log.users?.email || "Sistemi / Admin",
      action: log.action,
      details: `${translatedEntity} — ${cleanDetails}` 
    };
  });

  const serializedLogs = JSON.parse(JSON.stringify(formattedLogs));

  return <LogfileClient logs={serializedLogs} />;
}