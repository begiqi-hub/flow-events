"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

// ==========================================
// 1. TËRHEQJA E TË DHËNAVE PËR T'I SHFAQUR NË FORMË
// ==========================================
export async function getBookingAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return null;

    const booking = await prisma.bookings.findUnique({
      where: {
        id: id,
        business_id: business.id
      },
      include: {
        clients: true,
        halls: true,
        // Nëse ke nevojë të tërheqësh edhe pagesat e vjetra
        // payments: true, 
      }
    });

    return booking;
  } catch (error) {
    console.error("Gabim në leximin e rezervimit:", error);
    return null;
  }
}

// ==========================================
// 2. RUAJTJA E NDRYSHIMEVE (DHE LLOGARITJA E PAGESËS)
// ==========================================
export async function updateBookingAction(id: string, data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    // Sigurohemi që numrat janë korrektë
    const finalTotal = Number(data.total_amount) || 0;
    const deposit = Number(data.deposit_amount) || 0;

    // ---------------------------------------------------------
    // TRURI I PAGESËS: Përditësojmë Statusin Zyrtar
    // ---------------------------------------------------------
    let calculatedPaymentStatus = "pending";

    // Nëse zgjedh "paid" nga forma OSE ka paguar avans aq sa është totali
    if (data.payment_status === "paid" || (deposit >= finalTotal && finalTotal > 0)) {
      calculatedPaymentStatus = "paid";
    } 
    // Nëse zgjedh "deposit" OSE ka paguar avans më pak se totali
    else if (data.payment_status === "deposit" || (deposit > 0 && deposit < finalTotal)) {
      calculatedPaymentStatus = "deposit";
    }

    // Ruajmë ndryshimet në Databazë
    await prisma.bookings.update({
      where: { 
        id: id,
        business_id: business.id
      },
      data: {
        // Përditësojmë Të dhënat Bazë
        event_date: data.event_date ? new Date(data.event_date) : undefined,
        start_time: data.start_time ? new Date(`${data.event_date}T${data.start_time}:00`) : undefined,
        end_time: data.end_time ? new Date(`${data.event_date}T${data.end_time}:00`) : undefined,
        participants: data.participants ? Number(data.participants) : undefined,
        hall_id: data.hall_id,
        
        // Përditësojmë Financat
        total_amount: finalTotal,
        status: data.status || "confirmed", 
        
        // KËTU VULOSIM STATUSIN E RI TË PAGESËS PËRGJITHMONË!
        payment_status: calculatedPaymentStatus,
        
        // deposit_amount: deposit, // Nëse ke fushën e avansit në schema.prisma të bookings, hiqi vizat.
      }
    });

    // (Opsionale) Regjistrimi i një pagese të re në historik nëse u shtuan para
    if (deposit > 0 && data.log_new_payment) {
      await prisma.payments.create({
        data: {
          booking_id: id,
          amount: deposit,
          method: data.payment_method || "cash",
        }
      });
    }

    // Rifreskojmë faqet që Raportet dhe Dashboardi të lexojnë menjëherë ndryshimin
    revalidatePath("/[locale]/biznes/rezervimet", "layout");
    revalidatePath("/[locale]/biznes/raportet", "layout");
    revalidatePath("/[locale]/biznes", "layout");
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË PËRDITËSIMIT TË REZERVIMIT:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit." };
  }
}