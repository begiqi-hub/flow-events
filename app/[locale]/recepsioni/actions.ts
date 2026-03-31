"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma"; // <--- Këtu u hoq një ../

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

    // 1. Kontrollojmë nëse klienti ekziston me këtë numër telefoni (për këtë biznes)
    let clientId = null;
    if (data.client_phone) {
      const existingClient = await prisma.clients.findFirst({
        where: { 
          business_id: business.id, 
          phone: data.client_phone 
        }
      });
      
      if (existingClient) {
        clientId = existingClient.id;
      }
    }

    // 2. Nëse nuk ekziston, e krijojmë të ri
    if (!clientId) {
      const newClient = await prisma.clients.create({
        data: {
          business_id: business.id,
          name: data.client_name || "Klient i Ri (Nga Recepsioni)",
          phone: data.client_phone || "",
          client_type: "individual"
        }
      });
      clientId = newClient.id;
    }

    // 3. Krijojmë rezervimin si "Në Pritje" (Pending)
    const newBooking = await prisma.bookings.create({
      data: {
        business_id: business.id,
        client_id: clientId,
        hall_id: data.hall_id || null,
        event_date: new Date(data.event_date),
        start_time: new Date(`${data.event_date}T${data.start_time}:00Z`),
        end_time: new Date(`${data.event_date}T${data.end_time}:00Z`),
        participants: Number(data.participants) || 0,
        event_type: data.event_type || "Kërkesë nga Recepsioni",
        status: "pending", // Statusi kyç! E verdhë.
        payment_status: "unpaid",
        total_amount: 0, 
        staff_notes: `[SHTUAR NGA RECEPSIONI] - ${data.notes || "S'ka shënime."}`
      }
    });

    return { success: true, bookingId: newBooking.id };
  } catch (error: any) {
    console.error("Gabim në createInquiryAction:", error);
    return { error: "Ndodhi një gabim gjatë regjistrimit të kërkesës." };
  }
}