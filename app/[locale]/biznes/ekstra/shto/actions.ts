"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function saveExtraAction(data: { name: string; price: number; internal_cost: number | null }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    // BUG FIX: Kërko userin për business_id
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return { error: "Biznesi nuk u gjet." };

    if (!data.name || data.price < 0) {
      return { error: "Ju lutem plotësoni saktë emrin dhe çmimin." };
    }

    await prisma.extras.create({
      data: {
        name: data.name,
        price: new Prisma.Decimal(data.price.toString()),
        internal_cost: data.internal_cost ? new Prisma.Decimal(data.internal_cost.toString()) : null,
        business_id: user.business_id,
      }
    });

    revalidatePath("/[locale]/biznes/ekstra", "layout");
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË RUAJTJES SË EKSTRAS:", error);
    return { error: "Ndodhi një gabim gjatë ruajtjes. Provoni përsëri." };
  }
}