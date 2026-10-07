"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma";
import { createAuditLog } from "../../../logs/actions";
import { revalidatePath } from "next/cache";
import { authOptions } from "../../../../../../lib/auth"; 

export async function updateBusinessAction(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { error: "Nuk jeni i loguar." };

    // ==========================================
    // 🛠️ HAPI I DEBUGGING (DETEKTIVIT)
    // ==========================================
    console.log("--- TESTIMI I SIGURISË PËR UPDATE BIZNES ---");
    console.log("1. Emaili që po provon të bëjë update:", session.user.email);

    // Kërkojmë në tabelën 'users'
    let dbUser = await prisma.users.findUnique({ where: { email: session.user.email } });
    
    // Nëse nuk gjendet te 'users', provojmë te tabela 'user' (nëse e ke në skemë)
    if (!dbUser && (prisma as any).user) {
        dbUser = await (prisma as any).user.findUnique({ where: { email: session.user.email } });
        console.log("2. Përdoruesi u gjet në tabelën alternative 'user'");
    }

    console.log("3. Të dhënat e përdoruesit nga Databaza:", dbUser ? "U GJET" : "NUK U GJET");
    console.log("4. Roli i saktë në Databazë është:", dbUser?.role);
    console.log("--------------------------------------------");
    // ==========================================

    if (!dbUser) {
        return { error: "Llogaria nuk u gjet në databazë!" };
    }

    const userRole = dbUser.role?.toLowerCase();
    
    // Nëse përsëri nuk përputhet, kthejmë mesazhin origjinal
    if (userRole !== "superadmin" && userRole !== "support") {
      return { error: `Nuk keni të drejta Superadmini. (Roli juaj aktual: ${dbUser.role})` };
    }

    // ... Pjesa tjetër e kodit tënd mbetet e njëjtë ...
    let trialDate = null;
    if (data.trialEndsAt) {
      trialDate = new Date(data.trialEndsAt);
    }

    const transactionOperations = [];

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

    if (data.status === "suspended") {
      transactionOperations.push(
        prisma.listing.updateMany({
          where: { businessId: id },
          data: { status: "DRAFT" } 
        })
      );
    }

    await prisma.$transaction(transactionOperations);

    await createAuditLog(
      session.user.email,
      "UPDATE",
      "BIZNESI",
      `U përditësuan të dhënat për biznesin: ${data.name} (Statusi i ri: ${data.status})`
    );

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error: any) {
    console.error("GABIMI I PLOTË NGA PRISMA:", error);
    return { 
      error: "Ndodhi një gabim gjatë përditësimit të biznesit. Kontrolloni terminalin e VS Code për detaje." 
    };
  }
}