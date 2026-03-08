"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

// 1. Tërheqim të dhënat ekzistuese të sallës
export async function getHallAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return null;

    const hall = await prisma.halls.findUnique({
      where: {
        id: id,
        business_id: business.id
      }
    });

    return hall;
  } catch (error) {
    console.error("Gabim në leximin e sallës:", error);
    return null;
  }
}

// 2. Ruajmë ndryshimet e reja
export async function updateHallAction(id: string, data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    if (!data.name || !data.capacity) {
      return { error: "Ju lutem plotësoni emrin dhe kapacitetin." };
    }

    await prisma.halls.update({
      where: { 
        id: id,
        business_id: business.id
      },
      data: {
        name: data.name,
        capacity: Number(data.capacity),
        description: data.description,
        parking: data.parking,
        ac: data.ac,
        image: data.image // Linku i fotos
      }
    });

    revalidatePath("/[locale]/biznes/sallat", "layout");
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË PËRDITËSIMIT TË SALLËS:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit." };
  }
}