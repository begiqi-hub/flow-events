"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function getClientAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return null;

    // Tërheqim klientin bashkë me historikun e rezervimeve të tij
    const client = await prisma.clients.findUnique({
      where: {
        id: id,
        business_id: business.id
      },
      include: {
        bookings: {
          include: {
            halls: true // Përfshijmë emrin e sallës për historikun
          },
          orderBy: {
            event_date: 'desc' // I renditim nga më i riu te më i vjetri
          }
        }
      }
    });

    if (!client) return null;

    // FORMULA MAGJIKE: Pastrojmë Decimal-et që të mos bllokohet frontend-i
    return JSON.parse(JSON.stringify(client));

  } catch (error) {
    console.error("Gabim në leximin e klientit:", error);
    return null;
  }
}

export async function updateClientAction(id: string, data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    if (!data.name || !data.phone) {
      return { error: "Ju lutem plotësoni Emrin dhe numrin e Telefonit." };
    }

    // Përditësojmë të dhënat e klientit
    await prisma.clients.update({
      where: { 
        id: id,
        business_id: business.id
      },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        personal_id: data.personal_id || null, 
        gender: data.gender || null,
        city: data.city || null,
      }
    });

    // Rifreskojmë cache-in e listës dhe profilit
    revalidatePath("/[locale]/biznes/klientet", "layout");
    revalidatePath(`/[locale]/biznes/klientet/ndrysho/${id}`, "page");
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM GJATË PËRDITËSIMIT TË KLIENTIT:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit." };
  }
}