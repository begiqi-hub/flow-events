"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateContractTemplateAction(templateText: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return { error: "Biznesi nuk u gjet." };

    await prisma.businesses.update({
      where: { id: user.business_id },
      data: { contract_template: templateText }
    });

    revalidatePath("/[locale]/biznes/template-kontrata", "page");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Ndodhi një gabim gjatë ruajtjes së template-it." };
  }
}