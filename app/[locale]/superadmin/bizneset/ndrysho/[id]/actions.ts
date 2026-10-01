"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma";
import { createAuditLog } from "../../../logs/actions";
import { revalidatePath } from "next/cache";

export async function updateBusinessAction(id: string, data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar." };

    const superadmin = await prisma.users.findUnique({ where: { email: session.user.email } });
    if (superadmin?.role !== "superadmin") return { error: "Nuk keni të drejta Superadmini." };

    // Formatizimi i datës së trial-it
    let trialDate = null;
    if (data.trialEndsAt) {
      trialDate = new Date(data.trialEndsAt);
    }

    // Përgatitja e Veprimeve në Databazë (Transaction Array)
    const transactionOperations = [];

    // Veprimi 1: Përditëso vetë biznesin
    transactionOperations.push(
      prisma.businesses.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status,
          trialEndsAt: trialDate,
          packageId: data.packageId || null 
        }
      })
    );

    // Veprimi 2: Logjika zinxhir nëse Bllokohet
    if (data.status === "suspended") {
      // Fshih çdo sallë nga platforma Hallevo (Forco DRAFT)
      transactionOperations.push(
        prisma.listing.updateMany({
          where: { businessId: id },
          data: { status: "DRAFT" } // Nëse merrni përsëri gabim, ndryshoni në "draft" ose hiqni thonjëzat nëse nuk është String
        })
      );
      
      // SHËNIM: Përditësimi i përdoruesve (users) është komentuar përkohësisht për të shmangur gabimet e skemës. 
      // Nëse tabela juaj 'users' ka kolonën 'status', mund ta hiqni komentin më poshtë:
      /*
      transactionOperations.push(
        prisma.users.updateMany({
          where: { business_id: id },
          data: { status: "blocked" }
        })
      );
      */
    }

    // Ekzekutimi i Transaksionit (Të gjitha bashkë)
    await prisma.$transaction(transactionOperations);

    // Regjistrimi i veprimit në Audit Log
    await createAuditLog(
      session.user.email,
      "UPDATE",
      "BIZNESI",
      `U përditësuan të dhënat për biznesin: ${data.name} (Statusi i ri: ${data.status})`
    );

    // Pastrimi i Cache në të gjithë platformën
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error: any) {
    // Printimi i detajuar i gabimit në terminal për t'ju ndihmuar në debug
    console.error("GABIMI I PLOTË NGA PRISMA:", error);
    
    return { 
      error: "Ndodhi një gabim gjatë përditësimit të biznesit. Kontrolloni terminalin e VS Code për detaje." 
    };
  }
}