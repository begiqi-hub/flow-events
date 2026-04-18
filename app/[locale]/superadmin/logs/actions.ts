"use server";

import { prisma } from "../../../../lib/prisma";

// Ky funksion regjistron vetëm veprimet e stafit të platformës (Superadmin/Support)
export async function createAuditLog(userEmail: string, action: "LOGIN" | "CREATE" | "UPDATE" | "DELETE", entity: string, details: string) {
  try {
    await prisma.superadmin_logs.create({
      data: {
        user_email: userEmail,
        action: action,
        entity: entity,
        details: details
      }
    });
  } catch (error) {
    console.error("Gabim në regjistrimin e Superadmin Log:", error);
  }
}