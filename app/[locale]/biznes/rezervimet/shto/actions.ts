"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. KONTROLLI I ORARIT (Data dhe Ora)
// ==========================================
export async function checkAvailabilityAction(hallId: string, dateStr: string, startTime: string, endTime: string) {
  try {
    const checkDate = new Date(dateStr);
    
    // Gjejmë të gjitha rezervimet për këtë sallë në këtë datë
    const dailyBookings = await prisma.bookings.findMany({
      where: {
        hall_id: hallId,
        event_date: checkDate,
        status: { notIn: ['cancelled', 'draft'] } // Injorojmë ato të anuluara
      }
    });

    if (dailyBookings.length === 0) return { available: true };

    const formatTime = (date: Date) => {
      const h = date.getUTCHours().toString().padStart(2, '0');
      const m = date.getUTCMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    // Kontrollojmë për mbivendosje orari
    for (const booking of dailyBookings) {
      const bookedStart = formatTime(booking.start_time);
      const bookedEnd = formatTime(booking.end_time);

      if (startTime < bookedEnd && endTime > bookedStart) {
        return { 
          available: false, 
          message: `Salla është e zënë në këtë datë nga ora ${bookedStart} deri në ${bookedEnd}. Ju lutem zgjidhni një orar tjetër.` 
        };
      }
    }

    return { available: true };
  } catch (error) {
    console.error("Gabim në checkAvailability:", error);
    return { available: false, message: "Ndodhi një gabim gjatë verifikimit të orarit." };
  }
}

// ==========================================
// 2. RUAJTJA E REZERVIMIT (Bashkë me Ekstrat)
// ==========================================
export async function saveReservationAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    const result = await prisma.$transaction(async (tx) => {
      
      // A. Menaxhimi i Klientit
      const fullPhone = `${data.client_phone_prefix} ${data.client_phone}`;
      let client = await tx.clients.findFirst({
        where: { business_id: business.id, phone: fullPhone }
      });

      if (!client) {
        client = await tx.clients.create({
          data: {
            business_id: business.id,
            name: data.client_name,
            phone: fullPhone,
            email: data.client_email || null,
            personal_id: data.client_personal_id || null, // Bonus: Ruan ID-në e klientit të ri automatikisht
          }
        });
      }

      // B. Llogaritja e Totaleve (Ushqim + Ekstra)
      const menu = await tx.menus.findUnique({ where: { id: data.menu_id } });
      if (!menu) throw new Error("Menuja e zgjedhur nuk ekziston.");
      
      const menuTotal = Number(data.participants) * Number(menu.price_per_person);
      
      let extrasTotal = 0;
      if (data.extras && data.extras.length > 0) {
        extrasTotal = data.extras.reduce((sum: number, ext: any) => sum + Number(ext.price), 0);
      }

      const subTotal = menuTotal + extrasTotal;
      const discountAmount = (subTotal * Number(data.discount_percent || 0)) / 100;
      const finalTotal = subTotal - discountAmount;

      // ---------------------------------------------------------
      // TRURI I PAGESËS: Llogarisim Statusin zyrtar para ruajtjes
      // ---------------------------------------------------------
      const deposit = Number(data.deposit_amount) || 0;
      let calculatedPaymentStatus = "pending";

      if (data.payment_status === "paid" || (deposit >= finalTotal && finalTotal > 0)) {
        calculatedPaymentStatus = "paid";
      } else if (data.payment_status === "deposit" || (deposit > 0 && deposit < finalTotal)) {
        calculatedPaymentStatus = "deposit";
      }

      // C. Krijimi i Rezervimit
      const booking = await tx.bookings.create({
        data: {
          business_id: business.id,
          hall_id: data.hall_id,
          client_id: client.id,
          event_date: new Date(data.event_date),
          start_time: new Date(`${data.event_date}T${data.start_time}:00`),
          end_time: new Date(`${data.event_date}T${data.end_time}:00`),
          participants: Number(data.participants),
          status: data.payment_status === "pending" ? "pending" : "confirmed",
          total_amount: finalTotal,
          
          // KËTU VULISET NË DATABAZË PËRGJITHMONË! 
          payment_status: calculatedPaymentStatus, 
          
          // deposit_amount: deposit, // Nëse ke shtuar fushën 'deposit_amount' tek schema.prisma, mund t'ja heqësh komentet këtij rreshti
        }
      });

      // D. Ruajtja e Ekstrave në tabelën e bashkimit (booking_extras)
      if (data.extras && data.extras.length > 0) {
        for (const extra of data.extras) {
          await tx.booking_extras.create({
            data: {
              booking_id: booking.id,
              extra_id: extra.id,
              qty: 1, 
              unit_price: Number(extra.price),
              line_total: Number(extra.price)
            }
          });
        }
      }

      // E. Regjistrimi i Pagesës
      if (data.payment_status === "deposit" && Number(data.deposit_amount) > 0) {
        await tx.payments.create({
          data: {
            booking_id: booking.id,
            amount: Number(data.deposit_amount),
            method: data.payment_method || "cash",
          }
        });
      } else if (data.payment_status === "paid") {
        await tx.payments.create({
          data: {
            booking_id: booking.id,
            amount: finalTotal,
            method: data.payment_method || "cash",
          }
        });
      }

      return booking;
    });

    revalidatePath("/[locale]/biznes/rezervimet", "layout");
    
    return { success: true, bookingId: result?.id };

  } catch (error: any) {
    console.error("GABIM GJATË REZERVIMIT:", error);
    return { error: error.message || "Ndodhi një gabim i panjohur" };
  }
}