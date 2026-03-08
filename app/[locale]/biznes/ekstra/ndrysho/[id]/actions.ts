"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// FUNKSIONI 1: Tërheq të dhënat aktuale nga Databaza
export async function getExtraAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return null;

    const extra = await prisma.extras.findUnique({
      where: {
        id: id,
        business_id: business.id
      }
    });

    if (!extra) return null;

    return {
      name: extra.name,
      price: Number(extra.price)
    };
  } catch (error) {
    console.error("Gabim në lexim:", error);
    return null;
  }
}

// FUNKSIONI 2: Ruan ndryshimet e reja
export async function updateExtraAction(id: string, data: { name: string; price: number }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    if (!data.name || data.price < 0) {
      return { error: "Ju lutem plotësoni saktë emrin dhe çmimin." };
    }

    await prisma.extras.update({
      where: { 
        id: id,
        business_id: business.id
      },
      data: {
        name: data.name,
        price: new Prisma.Decimal(data.price.toString()),
      }
    });

    revalidatePath("/[locale]/biznes/ekstra", "layout");
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit." };
  }
}