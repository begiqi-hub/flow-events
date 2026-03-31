"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function getExtraAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    // BUG FIX: Kërko userin për business_id
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return null;

    const extra = await prisma.extras.findUnique({
      where: {
        id: id,
        business_id: user.business_id
      }
    });

    if (!extra) return null;

    // FIX DECIMAL: Kthe formatin Decimal në numër
    return {
      name: extra.name,
      price: extra.price.toNumber(),
      internal_cost: extra.internal_cost ? extra.internal_cost.toNumber() : null
    };
  } catch (error) {
    console.error("Gabim në lexim:", error);
    return null;
  }
}

export async function updateExtraAction(id: string, data: { name: string; price: number; internal_cost: number | null }) {
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

    await prisma.extras.update({
      where: { 
        id: id,
        business_id: user.business_id
      },
      data: {
        name: data.name,
        price: new Prisma.Decimal(data.price.toString()),
        internal_cost: data.internal_cost ? new Prisma.Decimal(data.internal_cost.toString()) : null,
      }
    });

    revalidatePath("/[locale]/biznes/ekstra", "layout");
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit." };
  }
}