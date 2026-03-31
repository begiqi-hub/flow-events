"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function convertQuotationToBooking(bookingId: string, depositAmount: number, method: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const user = await prisma.users.findUnique({ where: { email: session.user.email } });
    if (!user) return { error: "Përdoruesi nuk u gjet." };

    // 1. Gjejmë ofertën
    const quote = await prisma.bookings.findUnique({ where: { id: bookingId } });
    
    if (!quote || quote.status !== 'quotation') {
      return { error: "Kjo ofertë nuk ekziston ose data është zënë tashmë nga dikush tjetër!" };
    }

    // Siguria: A është e lirë data ende?
    const overlapping = await prisma.bookings.findMany({
      where: {
        hall_id: quote.hall_id,
        status: { notIn: ['cancelled', 'draft', 'quotation'] },
        event_date: quote.event_date
      }
    });

    if (overlapping.length > 0) {
      return { error: "Kjo datë është konfirmuar tashmë për dikë tjetër. Oferta nuk mund të kthehet në rezervim." };
    }

    const totalAmount = Number(quote.total_amount);
    let newPaymentStatus = "pending";

    if (depositAmount >= totalAmount && totalAmount > 0) newPaymentStatus = "paid";
    else if (depositAmount > 0) newPaymentStatus = "deposit";

    await prisma.$transaction(async (tx) => {
      // 2. E kthejmë në Rezervim të Konfirmuar
      await tx.bookings.update({
        where: { id: bookingId },
        data: { 
          status: 'confirmed',
          payment_status: newPaymentStatus 
        }
      });

      // 3. Nëse ka lënë depozitë, e regjistrojmë në financa
      if (depositAmount > 0) {
        await tx.payments.create({
          data: {
            booking_id: bookingId,
            amount: depositAmount,
            method: method as "cash" | "bank" | "pos",
            recorded_by: user.id
          }
        });
      }

      // 4. E shënojmë në Logfile
      await tx.audit_logs.create({
        data: {
          business_id: quote.business_id,
          user_id: user.id,
          action: "Konvertim në Rezervim",
          entity: "bookings",
          entity_id: bookingId,
          after_state: JSON.stringify({ detaje: `Oferta u kthye në rezervim zyrtar me depozitë ${depositAmount}` })
        }
      });
    });

    revalidatePath("/[locale]/biznes/ofertat", "page");
    revalidatePath("/[locale]/biznes/rezervimet", "page");
    
    return { success: true };

  } catch (error) {
    console.error("Gabim në konvertim:", error);
    return { error: "Ndodhi një gabim gjatë konvertimit." };
  }
}