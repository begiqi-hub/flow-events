"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Merr të gjitha njoftimet nga DB
export async function getAlerts() {
  try {
    return await prisma.global_alerts.findMany({
      orderBy: { created_at: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

// 2. Shto ose Përditëso njoftimin (merr objektin JSON të përkthimeve)
export async function upsertAlert(id: string | null, data: any, locale: string) {
  try {
    const payload = {
      // Këtu ruhet objekti psh: { sq: { title: "...", message: "..." }, en: { ... } }
      translations: data.translations, 
      type: data.type,
      is_active: data.is_active === true,
      expires_at: data.expires_at ? new Date(data.expires_at) : null,
    };

    if (id) {
      await prisma.global_alerts.update({ where: { id }, data: payload });
    } else {
      await prisma.global_alerts.create({ data: payload });
    }

    revalidatePath(`/${locale}/superadmin/njoftimet`);
    return { success: true };
  } catch (error) {
    console.error("Gabim te upsertAlert:", error);
    return { error: "Dështoi ruajtja e njoftimit." };
  }
}

// 3. Fshij njoftimin
export async function deleteAlert(id: string, locale: string) {
  try {
    await prisma.global_alerts.delete({ where: { id } });
    revalidatePath(`/${locale}/superadmin/njoftimet`);
    return { success: true };
  } catch (error) {
    return { error: "Gabim gjatë fshirjes." };
  }
}