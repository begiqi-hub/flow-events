"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function saveExtraAction(data: { name: string; price: number }) {
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

    // Ruajmë Ekstran në databazë (E pastër dhe e thjeshtë)
    await prisma.extras.create({
      data: {
        name: data.name,
        price: new Prisma.Decimal(data.price.toString()),
        business_id: business.id,
        // Shënim: id, is_active, created_at, etj i shton vetë Prisma nga @default
      }
    });

    revalidatePath("/[locale]/biznes/ekstra", "layout");
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË RUAJTJES SË EKSTRAS:", error);
    return { error: "Ndodhi një gabim gjatë ruajtjes. Provoni përsëri." };
  }
}