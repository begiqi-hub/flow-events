"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function saveMenuAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    // Gjejmë përdoruesin dhe business_id
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return { error: "Biznesi nuk u gjet." };

    if (!data.name || !data.price_per_person) {
      return { error: "Ju lutem plotësoni emrin dhe çmimin." };
    }

    // Ruajmë menunë në databazë duke përfshirë koston e brendshme
    await prisma.menus.create({
      data: {
        business_id: user.business_id,
        name: data.name,
        description: data.description,
        price_per_person: Number(data.price_per_person),
        internal_cost: data.internal_cost ? Number(data.internal_cost) : null,
        image: data.image 
      }
    });

    // Rifreskojmë cache-in
    revalidatePath("/[locale]/biznes/konfigurimet/menut", "layout");
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË RUAJTJES SË MENUSË:", error.message || error);
    return { error: "Ndodhi një gabim gjatë ruajtjes." };
  }
}