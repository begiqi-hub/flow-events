"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";

export async function createInquiryAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    // Gjejmë biznesin
    let business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) {
      const staff = await prisma.users.findUnique({ where: { email: session.user.email } });
      if (staff && staff.business_id) {
        business = await prisma.businesses.findUnique({ where: { id: staff.business_id } });
      }
    }

    if (!business) return { error: "Biznesi nuk u gjet!" };

    // 1. Kontrollojmë nëse klienti ekziston
    let clientId = null;
    if (data.client_phone) {
      const existingClient = await prisma.clients.findFirst({
        where: { business_id: business.id, phone: data.client_phone }
      });
      if (existingClient) clientId = existingClient.id;
    }

    // 2. Krijojmë klientin e ri nëse nuk ekziston
    if (!clientId) {
      const newClient = await prisma.clients.create({
        data: {
          business_id: business.id,
          name: data.client_name || "Klient i Ri (Recepsioni)",
          phone: data.client_phone || "",
          client_type: "individual"
        }
      });
      clientId = newClient.id;
    }

    // --- PËRGATITJA E SIGURT E DATËS DHE ORËS ---
    let safeDateStr = data.event_date;
    if (safeDateStr && safeDateStr.includes('.')) {
      const parts = safeDateStr.split('.');
      if (parts.length === 3) safeDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const baseDate = new Date(safeDateStr);

    const parseTimeSafely = (timeStr: string) => {
      if (!timeStr) return { h: 0, m: 0 };
      const match = String(timeStr).match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return { h: 0, m: 0 };
      let h = parseInt(match[1], 10);
      let m = parseInt(match[2], 10);
      let ampm = match[3] ? match[3].toUpperCase() : null;
      
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return { h, m };
    };

    const startParsed = parseTimeSafely(data.start_time);
    const startDateTime = new Date(baseDate);
    startDateTime.setHours(startParsed.h, startParsed.m, 0, 0);

    const endParsed = parseTimeSafely(data.end_time);
    const endDateTime = new Date(baseDate);
    endDateTime.setHours(endParsed.h, endParsed.m, 0, 0);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
         return { error: "Formati i datës ose orës nuk u kuptua nga sistemi!" };
    }

    // 3. Ndërtojmë objektin e të dhënave DINAMIKISHT (Pa hall_id)
    const bookingData: any = {
      business_id: business.id,
      client_id: clientId,
      event_date: baseDate,
      start_time: startDateTime,
      end_time: endDateTime,
      participants: Number(data.participants) || 0,
      event_type: data.event_type || "Kërkesë nga Recepsioni",
      status: "pending", 
      payment_status: "unpaid",
      total_amount: "0", // E kthejmë në String për të shmangur gabime të tipit Decimal
      staff_notes: `[SHTUAR NGA RECEPSIONI] - ${data.notes || "S'ka shënime."}`
    };

    // MAGJIA: E shtojmë sallën në rezervim VETËM nëse klienti ka zgjedhur një sallë
    if (data.hall_id && data.hall_id.trim() !== "" && data.hall_id !== "null") {
      bookingData.hall_id = data.hall_id;
    }

    // 4. Krijojmë rezervimin
    const newBooking = await prisma.bookings.create({
      data: bookingData
    });

    return { success: true, bookingId: newBooking.id };
  } catch (error: any) {
    console.error("Gabim në createInquiryAction:", error);
    
    // E kthejmë gabimin e gjatë në një mesazh të thjeshtë dhe të kuptueshëm në shqip
    let errMessage = error.message || "Gabim i panjohur.";
    if (errMessage.includes("hall_id")) {
       return { error: "Në sistemin tuaj salla është e detyrueshme. Ju lutem zgjidhni një sallë!" };
    }
    if (errMessage.includes("total_amount")) {
       return { error: "Gabim në formatin e çmimit." };
    }
    
    return { error: `Gabim: ${errMessage.split('\n').pop()}` }; // Shfaq vetëm rreshtin e fundit të gabimit
  }
}