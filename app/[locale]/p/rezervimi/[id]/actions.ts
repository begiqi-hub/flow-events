"use server";

import { prisma } from "../../../../../lib/prisma";
import { revalidatePath } from "next/cache";

const serializeData = (data: any) => JSON.parse(JSON.stringify(data));

export async function getPublicBookingAction(id: string) {
  try {
    const booking = await prisma.bookings.findUnique({
      where: { id },
      include: {
        halls: { select: { name: true, id: true } },
        clients: { select: { name: true, phone: true } }
      }
    });

    if (!booking) return { error: "Rezervimi nuk u gjet." };

    let snapshot = booking.layout_snapshot;
    
    // Nëse rezervimi nuk ka plan të ruajtur, provojmë të tërheqim skicën LIVE nga salla
    if (!snapshot || (typeof snapshot === 'object' && Object.keys(snapshot).length === 0)) {
      try {
        const liveLayout = await prisma.venue_layouts.findFirst({
          where: { hall_id: booking.hall_id },
          include: { tables: true }
        });
        if (liveLayout) {
          snapshot = JSON.parse(JSON.stringify(liveLayout));
        }
      } catch (e) {
        console.error("Gabim gjatë tërheqjes së venue_layouts", e);
      }
    } 
    
    // Sigurohemi që nëse është double-stringified, ta kthejmë në objekt të pastër
    if (typeof snapshot === 'string') {
      try { snapshot = JSON.parse(snapshot); } catch (e) {}
    }
    if (typeof snapshot === 'string') {
      try { snapshot = JSON.parse(snapshot); } catch (e) {}
    }

    return serializeData({
      success: true,
      booking: {
        id: booking.id,
        event_type: booking.event_type,
        event_date: booking.event_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        participants: booking.participants,
        hall_name: booking.halls?.name || "Salla",
        client_name: booking.clients?.name || "Klient",
        layout_snapshot: snapshot || {},
        guest_list: booking.guest_list || {} 
      }
    });
  } catch (error) {
    console.error("Gabim në leximin e rezervimit:", error);
    return { error: "Gabim teknik në server." };
  }
}

export async function savePublicDataAction(id: string, guestList: Record<string, string[]>, layoutSnapshot: any) {
  try {
    await prisma.bookings.update({
      where: { id },
      data: { 
        guest_list: guestList,
        layout_snapshot: layoutSnapshot // Ruan edhe tavolinat ekstra që shton klienti
      }
    });

    revalidatePath(`/[locale]/p/rezervimi/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Gabim gjatë ruajtjes:", error);
    return { error: "Ruajtja dështoi." };
  }
}