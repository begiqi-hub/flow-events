"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBankAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    // 🔥 KËTU ËSHTË RREGULLIMI: Gjejmë përdoruesin fillimisht për të marrë ID-në e biznesit
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return { error: "Biznesi nuk u gjet." };

    // Ruajmë të dhënat e Bankës në Databazë duke përdorur ID-në e saktë
    await prisma.businesses.update({
      where: { id: user.business_id },
      data: {
        bank_name: data.bank_name || null,
        account_holder: data.account_holder || null,
        iban: data.iban || null,
        swift: data.swift || null,
      }
    });

    revalidatePath("/[locale]/biznes/banka", "page");
    return { success: true };
  } catch (error: any) {
    console.error("GABIM NE BANK:", error);
    return { error: "Ndodhi një gabim gjatë ruajtjes së llogarisë bankare." };
  }
}