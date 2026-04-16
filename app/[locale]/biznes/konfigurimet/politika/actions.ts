"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function updatePolicyAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    await prisma.businesses.update({
      where: { email: session.user.email },
      data: {
        cancel_days: Number(data.cancel_days),
        cancel_penalty: Number(data.cancel_penalty),
        contract_template: data.contract_template || null, // SHTUAR KËTU
      }
    });

    revalidatePath("/[locale]/biznes/konfigurimet/politika", "page");
    return { success: true };
  } catch (error) {
    return { error: "Ndodhi një gabim gjatë ruajtjes." };
  }
}