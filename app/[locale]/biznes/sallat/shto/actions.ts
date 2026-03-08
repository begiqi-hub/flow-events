"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveHallAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    await prisma.halls.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        capacity: parseInt(data.capacity),
        description: data.description || null,
        parking: data.parking ?? true,
        ac: data.ac ?? true,
        image: data.image || null,
        business_id: business.id,
      },
    });

    revalidatePath("/biznes/sallat");
    return { success: true };
  } catch (error: any) {
    console.error("GABIM I DETAJUAR:", error);
    return { error: "Gabim teknik: " + error.message };
  }
}