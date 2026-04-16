import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../../lib/prisma";
import OfertaPrintClient from "./OfertaPrintClient";

export const dynamic = "force-dynamic";

export default async function OfertaPrintPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const booking: any = await prisma.bookings.findUnique({
    where: { id: id },
    include: {
      clients: true,
      halls: true,
      booking_extras: { include: { extras: true } },
      businesses: true
    }
  });

  // Sigurohemi që ekziston dhe që NUK është konfirmuar apo anuluar. (Pra lejojmë 'pending' dhe 'quotation')
  if (!booking || ['confirmed', 'completed', 'cancelled'].includes(booking.status)) {
    return <div className="p-8 text-center text-red-500 font-bold">Oferta nuk u gjet ose është konfirmuar tashmë!</div>;
  }

  let menuData = null;
  if (booking.menu_id) {
    menuData = await prisma.menus.findUnique({
      where: { id: booking.menu_id }
    });
  }

  const finalBooking = {
    ...booking,
    menus: menuData
  };

  const safeData = JSON.parse(JSON.stringify(finalBooking));

  return <OfertaPrintClient booking={safeData} locale={locale} />;
}