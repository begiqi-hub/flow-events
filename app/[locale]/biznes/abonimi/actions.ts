"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPaymentIntent(data: {
  businessId: string;
  amount: number;
  locale: string;
  packageId?: string; // SHTUAM KËTË PËR TË MARRË ID-NË
}) {
  try {
    const invoiceNum = `INV-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newPayment = await prisma.sa_payments.create({
      data: {
        business_id: data.businessId,
        amount: data.amount,
        status: "pending", 
        invoice_number: invoiceNum, 
        payment_method: "bank",
        // TRUKU MAGJIK: Ruajmë ID-në e Paketës këtu që ta gjejë Superadmini!
        description: data.packageId || "Abonim i thjeshtë", 
      }
    });

    revalidatePath(`/${data.locale}/biznes/abonimi`);
    return { success: true, referenceCode: invoiceNum };
  } catch (error) {
    console.error(error);
    return { error: "Dështoi krijimi i kërkesës për pagesë." };
  }
}