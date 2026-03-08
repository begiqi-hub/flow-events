"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveMenuAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    await prisma.menus.create({
      data: {
        // E hoqëm ID-në manuale. Prisma e shton vetë automatikisht!
        name: data.name,
        description: data.description || null,
        price_per_person: data.price_per_person,
        image: data.image || null,
        is_active: true,
        business_id: business.id,
      },
    });

    revalidatePath("/[locale]/biznes/menut", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("GABIM I DETAJUAR:", error);
    return { error: "Gabim teknik: " + error.message };
  }
}