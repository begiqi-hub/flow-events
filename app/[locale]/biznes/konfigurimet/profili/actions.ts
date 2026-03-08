"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBusinessProfileAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    // Ruajmë të dhënat në Databazë
    await prisma.businesses.update({
      where: { id: business.id },
      data: {
        name: data.name,
        phone: data.phone,
        city: data.city,
        // Këtu ruajmë Politikën e Anulimit
        cancel_penalty: Number(data.cancel_penalty) || 0,
        cancel_days: Number(data.cancel_days) || 0,
      }
    });

    revalidatePath("/[locale]/biznes/konfigurimet/profili", "page");
    return { success: true };
  } catch (error: any) {
    console.error("GABIM:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit të profilit." };
  }
}