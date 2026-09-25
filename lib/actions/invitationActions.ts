"use server";

import { prisma } from "../prisma"; // Import direkt nga dosja prind (lib)
import { revalidatePath } from "next/cache";

const serializeData = (data: any) => JSON.parse(JSON.stringify(data));

// 1. Tërheqja e të gjitha shablloneve aktive
export async function getTemplatesAction(eventType?: string) {
  try {
    const whereClause = eventType ? { event_type: eventType } : {};
    const templates = await prisma.event_invitation_templates.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
    });
    return serializeData({ success: true, templates });
  } catch (error) {
    console.error("Gabim gjatë tërheqjes së shablloneve:", error);
    return { success: false, error: "Gabim në lidhjen me databazën." };
  }
}

// 2. Krijimi i një ftese të re (Draft)
export async function createInvitationAction(data: {
  event_type: string;
  template_id?: string;
  booking_id?: string;
  business_id?: string;
  canvas_data: any;
}) {
  try {
    const newInvitation = await prisma.event_invitations.create({
      data: {
        event_type: data.event_type,
        template_id: data.template_id,
        booking_id: data.booking_id,
        business_id: data.business_id,
        canvas_data: data.canvas_data || {},
        status: "draft",
      },
    });
    return serializeData({ success: true, invitation: newInvitation });
  } catch (error) {
    console.error("Gabim gjatë krijimit të ftesës:", error);
    return { success: false, error: "Nuk u arrit krijimi i ftesës." };
  }
}

// 3. Tërheqja e një ftese specifike bazuar në Token
export async function getInvitationByTokenAction(token: string) {
  try {
    const invitation = await prisma.event_invitations.findUnique({
      where: { token },
      include: {
        template: true,
      }
    });
    
    if (!invitation) return { success: false, error: "Ftesa nuk u gjet ose është fshirë." };
    
    return serializeData({ success: true, invitation });
  } catch (error) {
    console.error("Gabim gjatë leximit të ftesës:", error);
    return { success: false, error: "Gabim në server." };
  }
}