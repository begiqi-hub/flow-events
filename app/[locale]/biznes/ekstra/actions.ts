"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";
import { checkBusinessLimit } from "../../../../lib/limits"; // <-- Importi i Rojës së Limiteve

export async function saveExtraAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user?.business_id) return { error: "Biznesi nuk u gjet." };

    // =======================================================================
    // 1. KONTROLLI I LIMITIT TË PAKETËS (PËR EKSTRAT)
    // =======================================================================
    const limitCheck = await checkBusinessLimit(user.business_id, "extras");
    if (!limitCheck.allowed) {
      // Kthejmë të dhënat e plota te frontend-i për të hapur Pop-upin
      return { 
        error: limitCheck.message, 
        isLimitError: limitCheck.isLimitError,
        limitTitle: limitCheck.title
      };
    }

    // =======================================================================
    // 2. Krijimi nëse lejohet
    // =======================================================================
    await prisma.extras.create({
      data: {
        business_id: user.business_id,
        name: data.name,
        price: Number(data.price),
        is_active: true
      }
    });

    revalidatePath("/[locale]/biznes/ekstra", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Dështoi ruajtja e shërbimit." };
  }
}

export async function deleteExtraAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user?.business_id) return { error: "Biznesi nuk u gjet." };

    await prisma.extras.deleteMany({
      where: { 
        id: id,
        business_id: user.business_id 
      }
    });

    revalidatePath("/[locale]/biznes/ekstra", "layout");
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË FSHIRJES SË EKSTRAS:", error);
    return { error: "Kjo Ekstra nuk mund të fshihet sepse është e lidhur me një rezervim ekzistues." };
  }
}

export async function getExtraAction(id: string) {
  try {
    const extra = await prisma.extras.findUnique({ where: { id } });
    if (!extra) return null;
    return { ...extra, price: Number(extra.price) };
  } catch (error) {
    return null;
  }
}

export async function updateExtraAction(id: string, data: any) {
  try {
    await prisma.extras.update({
      where: { id },
      data: {
        name: data.name,
        price: Number(data.price)
      }
    });
    revalidatePath("/[locale]/biznes/ekstra", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Përditësimi dështoi." };
  }
}