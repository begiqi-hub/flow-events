"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";
import { checkBusinessLimit } from "../../../../lib/limits"; // <-- Importi i Rojës

// 1. SHTO MENU TË RE
export async function saveMenuAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user?.business_id) return { error: "Biznesi nuk u gjet." };

    // =======================================================================
    // 1. KONTROLLI I LIMITIT TË PAKETËS (PËR MENUTË)
    // =======================================================================
    const limitCheck = await checkBusinessLimit(user.business_id, "menus");
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
    await prisma.menus.create({
      data: {
        business_id: user.business_id,
        name: data.name,
        description: data.description,
        price_per_person: Number(data.price_per_person),
        image: data.image
      }
    });

    revalidatePath("/[locale]/biznes/menut", "layout");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Dështoi ruajtja e menusë." };
  }
}

// 2. FSHI MENUNË
export async function deleteMenuAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Pa autorizim!" };

    await prisma.menus.delete({ where: { id } });
    revalidatePath("/[locale]/biznes/menut", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Dështoi fshirja." };
  }
}

// 3. MERR TË DHËNAT E NJË MENUJE 
export async function getMenuAction(id: string) {
  try {
    const menu = await prisma.menus.findUnique({ where: { id } });
    if (!menu) return null;

    return {
      ...menu,
      price_per_person: Number(menu.price_per_person)
    };
  } catch (error) {
    return null;
  }
}

// 4. PËRDITËSO MENUNË EKZISTUESE
export async function updateMenuAction(id: string, data: any) {
  try {
    await prisma.menus.update({
      where: { id },
      data: {
        name: data.name,
        price_per_person: Number(data.price_per_person),
        description: data.description,
        image: data.image
      }
    });
    revalidatePath("/[locale]/biznes/menut", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Përditësimi dështoi." };
  }
}