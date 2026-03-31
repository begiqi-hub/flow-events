"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function approvePayment(paymentId: string, locale: string) {
  try {
    const payment = await prisma.sa_payments.findUnique({
      where: { id: paymentId },
    });

    if (!payment) return { error: "Pagesa nuk u gjet!" };

    // 1. Përditëso pagesën si "e përfunduar"
    await prisma.sa_payments.update({
      where: { id: paymentId },
      data: { status: "completed", paid_at: new Date() }
    });

    // TRUKU: E marrim ID e paketës nga 'description'
    const requestedPackageId = payment.description;
    
    // Caktojmë datën e përfundimit të abonimit (P.sh: +1 Vit)
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    // 2. Aktivizojmë Biznesin dhe caktojmë datën e skadencës
    await prisma.businesses.update({
      where: { id: payment.business_id },
      data: {
        status: "active", // E kthejmë në Aktiv (Nuk është më trial)
        trialEndsAt: expirationDate, // Përdorim këtë fushë për të ruajtur skadencën e abonimit
        ...(requestedPackageId && requestedPackageId !== "Abonim i thjeshtë" 
            ? { packageId: requestedPackageId } 
            : {})
      }
    });

    revalidatePath(`/${locale}/superadmin/pagesat`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Dështoi aprovimi i pagesës." };
  }
}

export async function rejectPayment(paymentId: string, locale: string) {
  try {
    await prisma.sa_payments.update({
      where: { id: paymentId },
      data: { status: "rejected" }
    });
    revalidatePath(`/${locale}/superadmin/pagesat`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Dështoi refuzimi i pagesës." };
  }
}