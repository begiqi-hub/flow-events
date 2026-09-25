"use server";

import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function submitQuoteRequest(data: {
  businessId: string;
  hallId: string;
  name: string;
  phone: string;
  date: string;
  participants: number;
  eventType: string; // Fusha e re
  notes: string;
}) {
  try {
    let client = await prisma.clients.findUnique({
      where: { business_id_phone: { business_id: data.businessId, phone: data.phone } },
    });

    if (!client) {
      client = await prisma.clients.create({
        data: { business_id: data.businessId, name: data.name, phone: data.phone, client_type: "individual" },
      });
    }

    const eventDate = new Date(data.date);
    const startTime = new Date(eventDate);
    startTime.setHours(18, 0, 0, 0); 
    const endTime = new Date(eventDate);
    endTime.setHours(23, 59, 59, 0);

    // Ruajmë llojin e eventit brenda shënimeve të adminit për t'u shfaqur në CRM
    await prisma.bookings.create({
      data: {
        business_id: data.businessId,
        hall_id: data.hallId,
        client_id: client.id,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        participants: data.participants,
        status: "pending", 
        admin_notes: `[HALLEVO_LEAD] Lloji i eventit: ${data.eventType} | Shënime: ${data.notes}`,
        total_amount: 0,
      },
    });

    try {
      const business = await prisma.businesses.findUnique({
        where: { id: data.businessId },
        select: { email: true, name: true }
      });

      if (business?.email && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.hostinger.com",
          port: Number(process.env.SMTP_PORT) || 465,
          secure: true,
          auth: {
            user: process.env.SMTP_USER, 
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: '"HALLEVO" <no-reply@hallevo.com>',
          to: business.email,
          subject: `Kërkesë e re për sallën nga ${data.name} (HALLEVO)`,
          html: `
            <h2>Keni një kërkesë të re nga platforma HALLEVO!</h2>
            <p><strong>Klienti:</strong> ${data.name}</p>
            <p><strong>Telefoni:</strong> ${data.phone}</p>
            <p><strong>Data e Eventit:</strong> ${data.date}</p>
            <p><strong>Lloji i Eventit:</strong> ${data.eventType}</p>
            <p><strong>Të ftuar:</strong> ${data.participants}</p>
            <p><strong>Shënime:</strong> ${data.notes}</p>
            <br>
            <p>Hyni në panelin tuaj në Hallevo për ta menaxhuar këtë kërkesë.</p>
          `,
        });
      }
    } catch (emailError) {
      console.warn("Kërkesa u ruajt, por dërgimi i email-it dështoi:", emailError);
    }

    return { success: true };
    
  } catch (error) {
    console.error("Gabim gjatë ruajtjes së ofertës:", error);
    return { success: false, error: "Ndodhi një gabim në server." };
  }
}

// Funksioni markLeadAsContacted mbetet ashtu siç është
export async function markLeadAsContacted(leadId: string) {
  try {
    await prisma.bookings.update({
      where: { id: leadId },
      data: { 
        status: "confirmed",
        admin_notes: {
          set: "[HALLEVO_LEAD] Kërkesë e trajtuar dhe kontaktuar." 
        }
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të kërkesës:", error);
    return { success: false, error: "Nuk u arrit përditësimi i statusit." };
  }
}