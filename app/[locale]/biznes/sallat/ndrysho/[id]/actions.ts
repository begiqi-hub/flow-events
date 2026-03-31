"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

// 1. Tërheqim të dhënat ekzistuese të sallës
export async function getHallAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    // Gjejmë përdoruesin dhe business_id e tij (Qasja e re e sigurt)
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return null;

    // Gjejmë sallën duke u siguruar që i përket këtij biznesi
    const hall = await prisma.halls.findFirst({
      where: {
        id: id,
        business_id: user.business_id
      }
    });

    return hall;
  } catch (error) {
    console.error("Gabim në leximin e sallës:", error);
    return null;
  }
}

// 2. Ruajmë ndryshimet e reja
export async function updateHallAction(id: string, data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    // Gjejmë përdoruesin që po bën ndryshimin (për logfile dhe siguri)
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true, business_id: true }
    });

    if (!user || !user.business_id) return { error: "Biznesi nuk u gjet." };

    if (!data.name || data.capacity === undefined) {
      return { error: "Ju lutem plotësoni emrin dhe kapacitetin." };
    }

    // Përdorim updateMany për t'u siguruar që modifikon vetëm sallën e biznesit të tij
    const updateResult = await prisma.halls.updateMany({
      where: { 
        id: id,
        business_id: user.business_id 
      },
      data: {
        name: data.name,
        capacity: Number(data.capacity),
        description: data.description,
        parking: data.parking,
        ac: data.ac,
        image: data.image, // Linku/DataURI i fotos
        status: data.status // <--- SHTUAR: Ruan statusin Aktiv/Pasiv në databazë
      }
    });

    // Nëse nuk u përditësua asnjë rresht, salla nuk ekziston ose s'është e tija
    if (updateResult.count === 0) {
      return { error: "Kjo sallë nuk u gjet ose nuk keni të drejta modifikimi!" };
    }

    // 3. REGJISTROJMË VEPRIMIN (Audit Log) - Izoluar me try/catch
    try {
      await prisma.audit_logs.create({
        data: {
          business_id: user.business_id,
          user_id: user.id,
          action: "Modifikim Salle",
          entity: "halls",
          entity_id: id,
          after_state: `U modifikuan të dhënat për sallën: ${data.name}. Statusi: ${data.status}`
        }
      });
    } catch (auditError) {
      console.error("Gabim vetëm te krijimi i Audit Log:", auditError);
    }

    // 4. Rifreskojmë cache-in për të gjitha gjuhët - Izoluar me try/catch
    try {
      revalidatePath("/[locale]/biznes/sallat", "layout");
    } catch (cacheError) {
      console.error("Gabim te rifreskimi i cache-it (revalidatePath):", cacheError);
    }
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË PËRDITËSIMIT TË SALLËS:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit." };
  }
}