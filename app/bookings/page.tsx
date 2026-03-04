import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function BookingsPage() {
  // Lexojmë të gjitha të dhënat që na duhen për të mbushur formën
  const businesses = await prisma.businesses.findMany({ orderBy: { name: 'asc' } });
  const halls = await prisma.halls.findMany({ include: { businesses: true }, orderBy: { name: 'asc' } });
  const clients = await prisma.clients.findMany({ include: { businesses: true }, orderBy: { name: 'asc' } });
  
  // Lexojmë rezervimet ekzistuese dhe tërheqim emrat e lidhur me to (Magjia e Relacioneve!)
  const allBookings = await prisma.bookings.findMany({
    include: {
      businesses: true,
      halls: true,
      clients: true
    },
    orderBy: { event_date: 'desc' }
  });

  // Funksioni për SHTIMIN e një rezervimi
  async function createBooking(formData: FormData) {
    "use server";
    try {
      const business_id = formData.get("business_id") as string;
      const hall_id = formData.get("hall_id") as string;
      const client_id = formData.get("client_id") as string;
      
      // Datat dhe Orët
      const dateString = formData.get("event_date") as string;
      const startTimeString = formData.get("start_time") as string;
      const endTimeString = formData.get("end_time") as string;
      
      // Numrat
      const participants = parseInt(formData.get("participants") as string);
      const totalAmount = parseFloat(formData.get("total_amount") as string);

      // Konvertimi i Datave për Databazën e Prisma-s
      const eventDate = new Date(dateString);
      const startTime = new Date(`${dateString}T${startTimeString}:00`);
      const endTime = new Date(`${dateString}T${endTimeString}:00`);

      await prisma.bookings.create({
        data: {
          business_id: business_id,
          hall_id: hall_id,
          client_id: client_id,
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime,
          participants: participants,
          total_amount: totalAmount,
          status: "confirmed" // Po e lëmë të konfirmuar automatikisht për tani
        },
      });
      revalidatePath("/bookings");
    } catch (error) {
      console.log("Gabim gjatë ruajtjes së rezervimit:", error);
    }
  }

  // Funksioni për FSHIRJEN e rezervimit
  async function deleteBooking(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.bookings.delete({ where: { id: id } });
    revalidatePath("/bookings");
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-10 bg-gray-50">
      
      {/* Menuja e Navigimit (Tani me 4 lidhje!) */}
      <nav className="w-full max-w-5xl flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h1 className="text-2xl font-black text-orange-600 tracking-wider">FLOW EVENTS</h1>
        <div className="flex gap-4">
          <Link href="/" className="font-bold text-gray-500 hover:text-blue-600 px-2 py-1 transition">Bizneset</Link>
          <Link href="/halls" className="font-bold text-gray-500 hover:text-purple-600 px-2 py-1 transition">Sallat</Link>
          <Link href="/clients" className="font-bold text-gray-500 hover:text-green-600 px-2 py-1 transition">Klientët</Link>
          <Link href="/bookings" className="font-bold text-orange-600 border-b-2 border-orange-600 px-2 py-1">Rezervimet</Link>
        </div>
      </nav>

      <p className="text-md font-semibold text-gray-600 mb-8 bg-orange-100 px-5 py-2 rounded-full shadow-sm">
        Total Rezervime/Evente: <span className="text-orange-700 text-lg">{allBookings.length}</span>
      </p>

      {/* Forma e Rezervimit */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl border border-gray-100 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center border-b pb-4">Krijo një Rezervim të Ri</h2>
        
        <form action={createBooking} className="grid grid-cols-2 gap-5">
          {/* Rreshti 1: Zgjedhjet (Dropdowns) */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Biznesi</label>
            <select name="business_id" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none bg-white">
              <option value="">-- Zgjidh Biznesin --</option>
              {businesses.map((biz) => <option key={biz.id} value={biz.id}>{biz.name}</option>)}
            </select>
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Salla</label>
            <select name="hall_id" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none bg-white">
              <option value="">-- Zgjidh Sallën --</option>
              {halls.map((hall) => <option key={hall.id} value={hall.id}>{hall.name} ({hall.businesses.name})</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Klienti</label>
            <select name="client_id" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none bg-white">
              <option value="">-- Zgjidh Klientin --</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name} - {client.phone}</option>)}
            </select>
          </div>

          {/* Rreshti 2: Data dhe Ora */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Data e Eventit</label>
            <input type="date" name="event_date" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div className="col-span-2 md:col-span-1 flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Fillon</label>
              <input type="time" name="start_time" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Mbaron</label>
              <input type="time" name="end_time" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          {/* Rreshti 3: Detajet e tjera */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Nr. i të Ftuarve</label>
            <input type="number" name="participants" required min="1" className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="psh. 300" />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Çmimi Total (€)</label>
            <input type="number" name="total_amount" required min="0" step="0.01" className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="psh. 4500" />
          </div>

          <button type="submit" className="col-span-2 mt-4 bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-800 transition shadow-md">
            Konfirmo Rezervimin
          </button>
        </form>
      </div>

      {/* Tabela e Rezervimeve */}
      <div className="w-full max-w-6xl bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Kalendari i Eventeve</h2>
        {allBookings.length === 0 ? (
          <p className="text-gray-500 italic">Momentalisht nuk ka asnjë rezervim në sistem.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 rounded-tl-lg font-bold">Data</th>
                  <th className="p-3 font-bold">Salla</th>
                  <th className="p-3 font-bold">Klienti</th>
                  <th className="p-3 font-bold">Orari</th>
                  <th className="p-3 font-bold">Të ftuar</th>
                  <th className="p-3 font-bold">Totali</th>
                  <th className="p-3 rounded-tr-lg font-bold text-center">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {/* Formatimi i datës që të duket bukur */}
                    <td className="p-3 font-medium text-orange-700">{booking.event_date.toLocaleDateString('sq-AL')}</td>
                    <td className="p-3 font-medium text-gray-800">{booking.halls.name}</td>
                    <td className="p-3 text-gray-600">{booking.clients.name}</td>
                    <td className="p-3 text-gray-600">
                      {booking.start_time.toLocaleTimeString('sq-AL', {hour: '2-digit', minute:'2-digit'})} - {booking.end_time.toLocaleTimeString('sq-AL', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-3 text-gray-600">{booking.participants}</td>
                    <td className="p-3 font-bold text-gray-800">{booking.total_amount.toString()} €</td>
                    <td className="p-3 text-center">
                      <form action={deleteBooking}>
                        <input type="hidden" name="id" value={booking.id} />
                        <button type="submit" className="bg-red-50 text-red-600 font-bold py-1 px-3 rounded hover:bg-red-600 hover:text-white transition">Anulo</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}