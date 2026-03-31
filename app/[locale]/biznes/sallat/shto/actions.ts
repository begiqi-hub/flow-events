"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { checkBusinessLimit } from "../../../../../lib/limits"; // <--- Importuam funksionin e limiteve

export async function saveHallAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    // =======================================================================
    // 1. KONTROLLI I LIMITIT TË PAKETËS
    // =======================================================================
    const limitCheck = await checkBusinessLimit(business.id, "halls");
    if (!limitCheck.allowed) {
      // Kthejmë të dhënat e plota te frontend-i për të hapur Pop-upin!
      return { 
        error: limitCheck.message, 
        isLimitError: limitCheck.isLimitError,
        limitTitle: limitCheck.title
      };
    }

    // =======================================================================
    // 2. Krijojmë sallën e re të vërtetë (Nëse e kaloi limitin)
    // =======================================================================
    await prisma.halls.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        capacity: parseInt(data.capacity),
        description: data.description || null,
        parking: data.parking ?? true,
        ac: data.ac ?? true,
        image: data.image || null,
        business_id: business.id,
      },
    });

    // =======================================================================
    // 3. LOGJIKA E TURIT UDHËZUES (Fshirja automatike e Demo-s)
    // =======================================================================
    let isFirstRealHall = false;
    
    // Gjejmë nëse ka një Sallë Demo
    const demoHall = await prisma.halls.findFirst({
      where: { business_id: business.id, name: "Salla VIP (Demo)" }
    });

    if (demoHall) {
      isFirstRealHall = true;
      
      // A. Fillimisht fshijmë Rezervimin Demo që e përdorte këtë sallë (për të shmangur bllokimin nga baza)
      await prisma.bookings.deleteMany({
        where: { business_id: business.id, hall_id: demoHall.id }
      });
      
      // B. Tani fshijmë Sallën Demo lirisht
      await prisma.halls.delete({
        where: { id: demoHall.id }
      });
    }

    revalidatePath("/biznes/sallat");
    revalidatePath("/biznes"); // Rifreskojmë dashboardin

    // Kthejmë një sinjal që të dimë nga cili hap të vazhdojmë në frontend
    return { success: true, isFirstRealHall };
    
  } catch (error: any) {
    console.error("GABIM I DETAJUAR:", error);
    return { error: "Gabim teknik: " + error.message };
  }
}