"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function deleteClientAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    await prisma.clients.delete({
      where: { 
        id: id,
        business_id: business.id 
      }
    });

    revalidatePath("/[locale]/biznes/klientet", "layout");
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË FSHIRJES SË KLIENTIT:", error);
    return { error: "Ky klient nuk mund të fshihet sepse ka rezervime të regjistruara në sistem!" };
  }
}