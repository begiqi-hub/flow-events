import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../../lib/prisma";
import KontrataClient from "./KontrataClient";

export const dynamic = "force-dynamic";

export default async function KontrataPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const booking: any = await prisma.bookings.findUnique({
    where: { id: id },
    include: {
      clients: true,
      halls: true,
      booking_extras: { include: { extras: true } },
      businesses: true,
      payments: true
    }
  });

  if (!booking) return <div className="p-8 text-center text-red-500 font-bold">Rezervimi nuk u gjet!</div>;

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

  return <KontrataClient booking={safeData} locale={locale} />;
}