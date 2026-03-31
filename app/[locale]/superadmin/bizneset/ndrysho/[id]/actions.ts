"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma";

export async function updateBusinessAction(id: string, data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar." };

    const superadmin = await prisma.users.findUnique({ where: { email: session.user.email } });
    if (superadmin?.role !== "superadmin") return { error: "Nuk keni të drejta Superadmini." };

    // Formatizimi i datës së trial-it (nëse ka dhënë)
    let trialDate = null;
    if (data.trialEndsAt) {
      trialDate = new Date(data.trialEndsAt);
    }

    await prisma.businesses.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        trialEndsAt: trialDate,
       //* packageId: data.packageId || null //
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Gabim në updateBusinessAction:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit të biznesit." };
  }
}