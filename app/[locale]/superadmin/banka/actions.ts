"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

// 1. MARRJA E LLOGARIVE
export async function getBankAccounts() {
  try {
    return await prisma.bank_accounts.findMany({
      orderBy: { created_at: 'desc' }
    });
  } catch (error) {
    console.error("Gabim gjatë marrjes së llogarive:", error);
    return [];
  }
}

// 2. SHTIMI I LLOGARISË SË RE
export async function addBankAccount(data: any, locale: string) {
  try {
    await prisma.bank_accounts.create({
      data: {
        bank_name: data.bank_name,
        account_holder: data.account_holder,
        iban: data.iban,
        swift: data.swift || null,
        currency: data.currency || "EUR",
      }
    });
    revalidatePath(`/${locale}/superadmin/banka`);
    return { success: true };
  } catch (error) {
    console.error("Gabim gjatë shtimit:", error);
    return { error: "Gabim gjatë shtimit të llogarisë." };
  }
}

// 3. NDRYSHIMI I LLOGARISË EKZISTUESE
export async function updateBankAccount(id: string, data: any, locale: string) {
  try {
    await prisma.bank_accounts.update({
      where: { id },
      data: {
        bank_name: data.bank_name,
        account_holder: data.account_holder,
        iban: data.iban,
        swift: data.swift || null,
        currency: data.currency,
      }
    });
    revalidatePath(`/${locale}/superadmin/banka`);
    return { success: true };
  } catch (error) {
    console.error("Gabim gjatë përditësimit:", error);
    return { error: "Gabim gjatë përditësimit të llogarisë." };
  }
}

// 4. FSHIRJA E LLOGARISË
export async function deleteBankAccount(id: string, locale: string) {
  try {
    await prisma.bank_accounts.delete({
      where: { id }
    });
    revalidatePath(`/${locale}/superadmin/banka`);
    return { success: true };
  } catch (error) {
    console.error("Gabim gjatë fshirjes:", error);
    return { error: "Nuk mund të fshihet kjo llogari." };
  }
}