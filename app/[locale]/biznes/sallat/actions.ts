"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function deleteHallAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    await prisma.halls.delete({
      where: { 
        id: id,
        business_id: business.id 
      }
    });

    revalidatePath("/[locale]/biznes/sallat", "layout");
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË FSHIRJES SË SALLËS:", error);
    return { error: "Salla nuk mund të fshihet sepse keni rezervime të lidhura me këtë sallë!" };
  }
}