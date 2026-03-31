"use server";

import { prisma } from "../../../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveClientSignatureAction(bookingId: string, signatureBase64: string) {
  try {
    await prisma.bookings.update({
      where: { id: bookingId },
      data: { client_signature_url: signatureBase64 }
    });
    
    // Rifreskojmë faqen që firma të shfaqet menjëherë
    revalidatePath("/[locale]/biznes/rezervimet/[id]/kontrata", "page");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Ndodhi një problem gjatë ruajtjes së firmës." };
  }
}