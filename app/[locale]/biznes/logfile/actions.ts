"use server";

import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

/**
 * Funksion universal për të regjistruar një veprim (Log)
 */
export async function createAuditLog(action: string, entity: string, details: string) {
  const session = await getServerSession();
  if (!session?.user?.email) return;

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  const user = await prisma.users.findUnique({
    where: { email: session.user.email }
  });

  if (!business) return;

  await prisma.audit_logs.create({
    data: {
      business_id: business.id,
      user_id: user?.id || null,
      action: action,
      entity: entity,
      entity_id: "general", // Ose ID e rezervimit nëse ja kalojmë
      after_state: details
    }
  });
}

/**
 * Fshirja e të gjithë historikut
 */
export async function clearLogsAction() {
  const session = await getServerSession();
  if (!session?.user?.email) return { error: "I paautorizuar" };

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) return { error: "Biznesi nuk u gjet" };

  try {
    await prisma.audit_logs.deleteMany({
      where: { business_id: business.id }
    });
    
    revalidatePath("/[locale]/biznes/logfile", "page");
    return { success: true };
  } catch (error) {
    return { error: "Dështoi fshirja e historikut." };
  }
}