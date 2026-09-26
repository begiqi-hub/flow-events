"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma";
// 1. IMPORTI I DITARIT TË SPIUNAZHIT 🕵️‍♂️
import { createAuditLog } from "../../../logs/actions";
// SHTUAR: Moduli i domosdoshëm për të rifreskuar tabelat në UI
import { revalidatePath } from "next/cache";

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
        // KORRIGJUAR: U hoq komenti për të ruajtur paketën e re ose për ta bërë null
        packageId: data.packageId || null 
      }
    });

    // 2. REGJISTRIMI I VEPRIMIT NË AUDIT LOG
    await createAuditLog(
      session.user.email,
      "UPDATE",
      "BIZNESI",
      `U përditësuan të dhënat për biznesin: ${data.name} (Statusi i ri: ${data.status})`
    );

    // 3. SHTUAR: Detyron Next.js të fshijë cache-in dhe të tregojë të dhënat e reja në tabelë
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Gabim në updateBusinessAction:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit të biznesit." };
  }
}