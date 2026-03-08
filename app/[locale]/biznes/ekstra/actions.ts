"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function deleteExtraAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    // Fshijmë ekstran nga databaza
    await prisma.extras.delete({
      where: { 
        id: id,
        business_id: business.id // Siguri që fshihet vetëm ekstra e këtij biznesi
      }
    });

    revalidatePath("/[locale]/biznes/ekstra", "layout");
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË FSHIRJES:", error);
    return { error: "Kjo Ekstra nuk mund të fshihet sepse mund të jetë e lidhur me një rezervim ekzistues." };
  }
}