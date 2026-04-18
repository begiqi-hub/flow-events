"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "../logs/actions";

// Funksioni për të marrë të gjitha paketat
export async function getPackages() {
  try {
    return await prisma.package.findMany({
      orderBy: { monthly_price: 'asc' }
    });
  } catch (error) {
    console.error("Gabim gjatë marrjes së paketave:", error);
    return [];
  }
}

// Funksioni për të shtuar ose ndryshuar një pako
export async function upsertPackage(id: string | null, data: any, locale: string) {
  try {
    const payload = {
      name: data.name,
      slug: data.name.toLowerCase().replace(/ /g, "-"),
      // Parsimi i numrave, -1 trajtohet si numër normal
      halls_limit: parseInt(data.halls_limit),
      menus_limit: parseInt(data.menus_limit),
      extras_limit: parseInt(data.extras_limit),
      users_limit: parseInt(data.users_limit),
      monthly_price: parseFloat(data.monthly_price),
      yearly_price: parseFloat(data.yearly_price),
    };

    if (id) {
      await prisma.package.update({
        where: { id },
        data: payload
      });
    } else {
      await prisma.package.create({
        data: payload
      });
    }

    revalidatePath(`/${locale}/superadmin/paketat`);
    return { success: true };
  } catch (error) {
    console.error("Gabim gjatë ruajtjes:", error);
    return { error: "Dështoi ruajtja e paketës. Sigurohu që emri është unik." };
  }
}

// Funksioni për të fshirë një pako
export async function deletePackage(id: string, locale: string) {
  try {
    await prisma.package.delete({
      where: { id }
    });
    revalidatePath(`/${locale}/superadmin/paketat`);
    return { success: true };
  } catch (error) {
    console.error("Gabim gjatë fshirjes:", error);
    return { error: "Nuk mund të fshihet. Sigurohu që asnjë biznes nuk po e përdor këtë pako aktualisht." };
  }
}