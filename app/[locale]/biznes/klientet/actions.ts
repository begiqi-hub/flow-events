"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

// 1. SHTO KLIENT TË RI
export async function saveClientAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user?.business_id) return { error: "Biznesi nuk u gjet." };

    await prisma.clients.create({
      data: {
        business_id: user.business_id,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        personal_id: data.personal_id || null,
        business_num: data.business_num || null,
        city: data.city || null,
        client_type: data.client_type || "individual"
      }
    });

    revalidatePath("/[locale]/biznes/klientet", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("GABIM RUAJTJE:", error);
    // Nëse ka error nga Prisma për numër telefoni unik (pasi e kemi bërë unique në database)
    if (error.code === 'P2002') {
      return { error: "Ekziston tashmë një klient me këtë numër telefoni në biznesin tuaj!" };
    }
    return { error: "Dështoi ruajtja e klientit." };
  }
}

// 2. MERR TË DHËNAT E KLIENTIT DHE HISTORIKUN (PËR EDITIM)
export async function getClientAction(id: string) {
  try {
    const client = await prisma.clients.findUnique({ 
      where: { id },
      include: {
        bookings: {
          orderBy: { created_at: 'desc' },
          include: {
            halls: { select: { name: true } }
          }
        }
      }
    });
    
    if (!client) return null;

    // Rregullojmë Decimalin për historikun e faturave
    const parsedClient = JSON.parse(JSON.stringify(client));
    return parsedClient;
  } catch (error) {
    return null;
  }
}

// 3. PËRDITËSO KLIENTIN EKZISTUES
export async function updateClientAction(id: string, data: any) {
  try {
    await prisma.clients.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        personal_id: data.personal_id || null,
        city: data.city || null
      }
    });
    revalidatePath("/[locale]/biznes/klientet", "layout");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Ekziston tashmë një klient tjetër me këtë numër telefoni!" };
    }
    return { error: "Përditësimi dështoi." };
  }
}

// 4. FSHI KLIENTIN
export async function deleteClientAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user?.business_id) return { error: "Biznesi nuk u gjet." };

    await prisma.clients.deleteMany({
      where: { 
        id: id,
        business_id: user.business_id 
      }
    });

    revalidatePath("/[locale]/biznes/klientet", "layout");
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË FSHIRJES SË KLIENTIT:", error);
    return { error: "Ky klient nuk mund të fshihet sepse ka rezervime të regjistruara në sistem!" };
  }
}