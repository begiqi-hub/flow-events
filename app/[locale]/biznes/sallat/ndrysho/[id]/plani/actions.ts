"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFloorPlan(hallId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar" };

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return { error: "Biznesi nuk u gjet" };

    // Gjejmë nëse salla ka tashmë një plan
    const layout = await prisma.venue_layouts.findFirst({
      where: { hall_id: hallId },
      include: { tables: true }
    });

    return { success: true, layout };
  } catch (error: any) {
    console.error("Gabim gjatë marrjes së planit:", error);
    return { error: "Gabim teknik gjatë ngarkimit të planit." };
  }
}

export async function saveFloorPlan(hallId: string, tablesData: any[]) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar" };

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return { error: "Biznesi nuk u gjet" };

    // Kontrollojmë nëse salla i përket këtij biznesi
    const hall = await prisma.halls.findFirst({
      where: { id: hallId, business_id: user.business_id }
    });

    if (!hall) return { error: "Salla nuk u gjet ose nuk keni akses." };

    // Gjejmë ose krijojmë layout-in kryesor
    let layout = await prisma.venue_layouts.findFirst({
      where: { hall_id: hallId }
    });

    if (!layout) {
      layout = await prisma.venue_layouts.create({
        data: {
          hall_id: hallId,
          name: "Plani Kryesor",
        }
      });
    }

    // Për thjeshtësi në MVP: Fshijmë tavolinat e vjetra të këtij plani dhe i krijojmë nga e para me koordinatat e reja
    await prisma.tables.deleteMany({
      where: { layout_id: layout.id }
    });

    const newTables = tablesData.map((t: any) => ({
      id: t.id.includes("-") ? crypto.randomUUID() : t.id, // Nëse është ID e përkohshme nga frontend, krijojmë të re
      layout_id: layout!.id,
      name: t.name,
      seats: parseInt(t.seats),
      type: t.type,
      pos_x: parseFloat(t.pos_x),
      pos_y: parseFloat(t.pos_y),
    }));

    if (newTables.length > 0) {
      await prisma.tables.createMany({
        data: newTables
      });
    }

    revalidatePath("/[locale]/biznes/sallat", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("Gabim gjatë ruajtjes së planit:", error);
    return { error: "Gabim teknik gjatë ruajtjes." };
  }
}