"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { checkBusinessLimit } from "../../../../lib/limits";

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
   const totalHalls = await prisma.halls.count({
      where: { business_id: business.id }
    });

    if (totalHalls >= 5) {
      return { 
        error: "Mund të shtoni maksimumi 5 salla për listim publik.", 
        isLimitError: true,
        limitTitle: "Limiti i Platformës"
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
        is_published: true,  // Salla bëhet automatikisht publike kur krijohet
        is_managed: false,   // Menaxhimi SaaS mbetet OFF derisa ta ndezë përdoruesi nga butoni
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

// =======================================================================
// 4. FUNKSIONI I FSHIRJES (Ai që na mungonte)
// =======================================================================
export async function deleteHallAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    // Fshijmë sallën
    await prisma.halls.delete({
      where: { id: id }
    });

    revalidatePath("/biznes/sallat");
    revalidatePath("/biznes");
    
    return { success: true };
  } catch (error: any) {
    console.error("GABIM GJATË FSHIRJES:", error);
    return { error: "Nuk mund të fshihet salla. " + error.message };
  }
}

export async function toggleHallManagement(hallId: string, businessId: string, turnOn: boolean) {
  try {
    // 1. Marrim biznesin SË BASHKU me pakon e tij
    const business = await prisma.businesses.findUnique({
      where: { id: businessId },
      include: { package: true } // E DETYRUESHME: Për të lexuar limitet e pakos
    });

    if (!business) {
      return { success: false, error: "Biznesi nuk u gjet" };
    }

    if (turnOn) {
      let allowedLimit = 0;

      // 2. Lexojmë limitin e saktë bazuar në status
      if (business.status === 'trial') {
        allowedLimit = 1; // Limiti manual i provës për salla
      } else if (business.status === 'active' && business.package) {
        allowedLimit = business.package.halls_limit; // Lexon "3" nga pakoja jote
      } else {
        // Nëse biznesi është 'inactive' ose pa pako, bllokohet menjëherë
        return { success: false, error: "LIMIT_REACHED" };
      }

      // 3. Verifikimi i limitit (përjashtohet rasti -1 që do të thotë Pa Kufizim)
      if (allowedLimit !== -1) {
        const currentManagedHalls = await prisma.halls.count({
          where: { 
            business_id: businessId, 
            is_managed: true // Numëron VETËM sallat aktive në Kalendar, jo listimet e thjeshta
          }
        });

        if (currentManagedHalls >= allowedLimit) {
          return { 
            success: false, 
            error: "LIMIT_REACHED" 
          };
        }
      }
    }

    // 4. Përditëso gjendjen e sallës
    await prisma.halls.update({
      where: { id: hallId },
      data: { is_managed: turnOn }
    });

    return { success: true };

  } catch (error) {
    console.error("Gabim gjatë përditësimit të statusit të sallës:", error);
    return { success: false, error: "Gabim i brendshëm në server" };
  }
}

export async function toggleHallPublication(hallId: string, turnOn: boolean) {
  try {
    // Nëse po tenton ta bëjë Publik (ON), verifikojmë a i ka plotësuar të dhënat
    if (turnOn) {
      const hall = await prisma.halls.findUnique({
        where: { id: hallId },
        include: { listing: true }
      });

      if (!hall) return { success: false, error: "Salla nuk u gjet" };

      // Verifikojmë nëse ka përshkrim (mbi 10 karaktere) dhe nëse ka foto
      const hasDescription = hall.description && hall.description.length > 10;
      const hasPhoto = hall.image || hall.listing?.mainImage;

      if (!hasDescription || !hasPhoto) {
        return { success: false, error: "INCOMPLETE_PROFILE" }; // Sinjalizojmë Frontend-in
      }
    }

    await prisma.halls.update({
      where: { id: hallId },
      data: { is_published: turnOn }
    });
    return { success: true };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të publikimit:", error);
    return { success: false, error: "Gabim i brendshëm në server" };
  }
}