"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";

// Funksion ndihmës për të gjetur biznesin e loguar
async function getBusiness() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  let business = await prisma.businesses.findUnique({ where: { email: session.user.email } });
  if (!business) {
    const staff = await prisma.users.findUnique({ where: { email: session.user.email } });
    if (staff?.business_id) business = await prisma.businesses.findUnique({ where: { id: staff.business_id } });
  }
  return business;
}

export async function createTicketAction(subject: string, message: string) {
  try {
    const business = await getBusiness();
    if (!business) return { error: "Biznesi nuk u gjet" };

    const ticket = await prisma.tickets.create({
      data: {
        business_id: business.id,
        subject,
        messages: {
          create: {
            sender_type: "business",
            message
          }
        }
      }
    });
    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error(error);
    return { error: "Gabim gjatë krijimit të kërkesës." };
  }
}

export async function sendMessageAction(ticketId: string, message: string) {
  try {
    const business = await getBusiness();
    if (!business) return { error: "Biznesi nuk u gjet" };

    await prisma.ticket_messages.create({
      data: {
        ticket_id: ticketId,
        sender_type: "business",
        message
      }
    });
    
    // Përditësojmë kohën e ticket-it që të dalë i pari në listë
    await prisma.tickets.update({
      where: { id: ticketId },
      data: { updated_at: new Date() }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gabim gjatë dërgimit të mesazhit." };
  }
}