"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

// 1. Tërheqim të dhënat ekzistuese të menusë
export async function getMenuAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return null;

    const menu = await prisma.menus.findUnique({
      where: {
        id: id,
        business_id: business.id
      }
    });

    return menu;
  } catch (error) {
    console.error("Gabim në leximin e menusë:", error);
    return null;
  }
}

// 2. Ruajmë ndryshimet e reja
export async function updateMenuAction(id: string, data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    if (!data.name || !data.price_per_person) {
      return { error: "Ju lutem plotësoni emrin dhe çmimin." };
    }

    await prisma.menus.update({
      where: { 
        id: id,
        business_id: business.id
      },
      data: {
        name: data.name,
        price_per_person: Number(data.price_per_person),
        description: data.description,
        image: data.image
      }
    });

    revalidatePath("/[locale]/biznes/menut", "layout");
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË PËRDITËSIMIT TË MENUSË:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit." };
  }
}