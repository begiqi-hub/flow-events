export const dynamic = "force-dynamic";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export default async function BookingsPage() {
  const allBookings = await prisma.bookings.findMany({
    orderBy: { created_at: "desc" },
  });

  async function deleteBooking(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.bookings.delete({ where: { id } });
    revalidatePath("/bookings");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Lista e Rezervimeve</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {allBookings.length === 0 ? (
          <p className="text-gray-500 text-sm">Nuk ka asnjë rezervim në sistem.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-3 font-medium">Data e Eventit</th>
                <th className="pb-3 font-medium">Shuma Total</th>
                <th className="pb-3 font-medium text-right">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {allBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 font-medium text-gray-900">
                    {booking.event_date ? String(booking.event_date).substring(0, 15) : "Pa datë"}
                  </td>
                  <td className="py-4 text-gray-600">{String(booking.total_amount)} €</td>
                  <td className="py-4 text-right">
                    <form action={deleteBooking}>
                      <input type="hidden" name="id" value={booking.id} />
                      <button type="submit" className="text-red-500 font-medium bg-red-50 px-3 py-1.5 rounded-md">
                        Fshi
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}