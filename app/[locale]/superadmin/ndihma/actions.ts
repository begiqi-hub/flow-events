"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function replyToTicket(ticketId: string, message: string, locale: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "I paautorizuar" };

    // Marrim ID-në e superadminit që po kthen përgjigje
    const superadmin = await prisma.users.findUnique({ 
      where: { email: session.user.email } 
    });

    // Shto mesazhin e ri duke përdorur fushat E SAKTA të databazës tënde
    await prisma.ticket_messages.create({
      data: {
        ticket_id: ticketId,
        sender_type: "superadmin", // <--- Rregulluam emrin e fushës
        sender_id: superadmin?.id, // <--- Shtuam ID-në e adminit (opsionale, por e mirë)
        message: message,
      }
    });

    // Përditëso datën e ticket-it që të dalë në krye të listës
    await prisma.tickets.update({
      where: { id: ticketId },
      data: { updated_at: new Date() }
    });

    revalidatePath(`/${locale}/superadmin/ndihma`);
    return { success: true };
  } catch (error) {
    console.error("Gabim në dërgim:", error);
    return { error: "Mesazhi nuk u dërgua dot." };
  }
}

export async function closeTicket(ticketId: string, locale: string) {
  try {
    await prisma.tickets.update({
      where: { id: ticketId },
      data: { status: "closed", updated_at: new Date() }
    });
    revalidatePath(`/${locale}/superadmin/ndihma`);
    return { success: true };
  } catch (error) {
    return { error: "Nuk u mbyll dot kërkesa." };
  }
}