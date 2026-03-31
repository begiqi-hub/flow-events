"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMenuAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return null;

    const menu = await prisma.menus.findUnique({
      where: {
        id: id,
        business_id: user.business_id
      }
    });

    if (!menu) return null;

    // ZGJIDHJA E GABIMIT KËTU: Kthejmë Decimal në numra të thjeshtë (Numbers)
    return {
      ...menu,
      price_per_person: menu.price_per_person.toNumber(),
      internal_cost: menu.internal_cost ? menu.internal_cost.toNumber() : null,
    };
    
  } catch (error) {
    console.error("Gabim në leximin e menusë:", error);
    return null;
  }

}

export async function updateMenuAction(id: string, data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    // Rregullimi i BUG-ut: Gjejmë userin për të marrë business_id
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return { error: "Biznesi nuk u gjet." };

    if (!data.name || !data.price_per_person) {
      return { error: "Ju lutem plotësoni emrin dhe çmimin." };
    }

    await prisma.menus.update({
      where: { 
        id: id,
        business_id: user.business_id
      },
      data: {
        name: data.name,
        price_per_person: Number(data.price_per_person),
        internal_cost: data.internal_cost ? Number(data.internal_cost) : null,
        description: data.description,
        image: data.image
      }
    });

    revalidatePath("/[locale]/biznes/konfigurimet/menut", "layout");
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË PËRDITËSIMIT TË MENUSË:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit." };
  }
}