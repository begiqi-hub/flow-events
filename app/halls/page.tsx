import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function HallsPage() {
  const businesses = await prisma.businesses.findMany({ orderBy: { name: 'asc' } });
  const allHalls = await prisma.halls.findMany({
    include: { businesses: true },
    orderBy: { created_at: 'desc' }
  });

  async function createHall(formData: FormData) {
    "use server";
    const business_id = formData.get("business_id") as string;
    const name = formData.get("name") as string;
    const capacity = formData.get("capacity") as string;

    await prisma.halls.create({
      data: { business_id, name, capacity: parseInt(capacity) },
    });
    revalidatePath("/halls");
  }

  async function deleteHall(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.halls.delete({ where: { id: id } });
    revalidatePath("/halls");
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-10 bg-gray-50">
      {/* Menuja e Navigimit */}
      <nav className="w-full max-w-5xl flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h1 className="text-2xl font-black text-purple-700 tracking-wider">HALLEVO</h1>
        <div className="flex gap-4">
          <Link href="/" className="font-bold text-gray-500 hover:text-blue-600 px-2 py-1 transition">Bizneset</Link>
          <Link href="/halls" className="font-bold text-purple-600 border-b-2 border-purple-600 px-2 py-1">Sallat</Link>
        </div>
      </nav>

      <p className="text-md font-semibold text-gray-600 mb-8 bg-purple-100 px-5 py-2 rounded-full shadow-sm">
        Total Salla në Sistem: <span className="text-purple-700 text-lg">{allHalls.length}</span>
      </p>

      {/* Forma e Regjistrimit të Sallës */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center border-b pb-4">Regjistro Sallë të Re</h2>
        <form action={createHall} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Zgjidh Biznesin</label>
            <select name="business_id" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none bg-white">
              <option value="">-- Zgjidh një nga bizneset --</option>
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.id}>{biz.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Emri i Sallës</label>
            <input type="text" name="name" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="psh. Salla e Kuqe" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kapaciteti (Numri i personave)</label>
            <input type="number" name="capacity" required min="1" className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="psh. 350" />
          </div>
          <button type="submit" className="mt-4 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-800 transition shadow-md">
            Ruaj Sallën
          </button>
        </form>
      </div>

      {/* Tabela e Sallave */}
      <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Lista e Sallave të Regjistruara</h2>
        {allHalls.length === 0 ? (
          <p className="text-gray-500 italic">Momentalisht nuk ka asnjë sallë në sistem.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 rounded-tl-lg font-bold">Emri i Biznesit</th>
                  <th className="p-3 font-bold">Emri i Sallës</th>
                  <th className="p-3 font-bold text-center">Kapaciteti</th>
                  <th className="p-3 rounded-tr-lg font-bold text-center">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {allHalls.map((salla) => (
                  <tr key={salla.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-purple-700">{salla.businesses.name}</td>
                    <td className="p-3 font-medium text-gray-800">{salla.name}</td>
                    <td className="p-3 text-gray-600 text-center">{salla.capacity} persona</td>
                    <td className="p-3 text-center">
                      <form action={deleteHall}>
                        <input type="hidden" name="id" value={salla.id} />
                        <button type="submit" className="bg-red-50 text-red-600 font-bold py-1 px-3 rounded hover:bg-red-600 hover:text-white transition">Fshi</button>
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