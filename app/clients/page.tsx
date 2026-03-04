import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function ClientsPage() {
  // Lexojmë bizneset për dropdown-in
  const businesses = await prisma.businesses.findMany({ orderBy: { name: 'asc' } });
  
  // Lexojmë klientët dhe marrim edhe emrin e biznesit ku janë regjistruar
  const allClients = await prisma.clients.findMany({
    include: { businesses: true },
    orderBy: { created_at: 'desc' }
  });

  // Funksioni për SHTIMIN e klientit
  async function createClient(formData: FormData) {
    "use server";
    try {
      const business_id = formData.get("business_id") as string;
      const name = formData.get("name") as string;
      const phone = formData.get("phone") as string;
      const email = formData.get("email") as string;

      await prisma.clients.create({
        data: { 
          business_id, 
          name, 
          phone, 
          email: email || null // Emaili është opsional në databazën tënde
        },
      });
      revalidatePath("/clients");
    } catch (error) {
      console.log("Gabim: Ky klient me këtë numër telefoni ekziston tashmë për këtë biznes!");
    }
  }

  // Funksioni për FSHIRJEN e klientit
  async function deleteClient(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.clients.delete({ where: { id: id } });
    revalidatePath("/clients");
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-10 bg-gray-50">
      {/* Menuja e Navigimit e Përditësuar */}
      <nav className="w-full max-w-5xl flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h1 className="text-2xl font-black text-green-700 tracking-wider">FLOW EVENTS</h1>
        <div className="flex gap-4">
          <Link href="/" className="font-bold text-gray-500 hover:text-blue-600 px-2 py-1 transition">Bizneset</Link>
          <Link href="/halls" className="font-bold text-gray-500 hover:text-purple-600 px-2 py-1 transition">Sallat</Link>
          <Link href="/clients" className="font-bold text-green-600 border-b-2 border-green-600 px-2 py-1">Klientët</Link>
        </div>
      </nav>

      <p className="text-md font-semibold text-gray-600 mb-8 bg-green-100 px-5 py-2 rounded-full shadow-sm">
        Total Klientë në Sistem: <span className="text-green-700 text-lg">{allClients.length}</span>
      </p>

      {/* Forma e Regjistrimit të Klientit */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center border-b pb-4">Regjistro Klient të Ri</h2>
        <form action={createClient} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Zgjidh Biznesin</label>
            <select name="business_id" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-500 outline-none bg-white">
              <option value="">-- Zgjidh një nga bizneset --</option>
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.id}>{biz.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Emri i Klientit</label>
            <input type="text" name="name" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-500 outline-none" placeholder="psh. Agim Krasniqi" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Numri i Telefonit</label>
            <input type="text" name="phone" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-500 outline-none" placeholder="psh. 044 111 222" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Emaili (Opsional)</label>
            <input type="email" name="email" className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-500 outline-none" placeholder="psh. agimi@email.com" />
          </div>
          <button type="submit" className="mt-4 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-800 transition shadow-md">
            Ruaj Klientin
          </button>
        </form>
      </div>

      {/* Tabela e Klientëve */}
      <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Lista e Klientëve</h2>
        {allClients.length === 0 ? (
          <p className="text-gray-500 italic">Momentalisht nuk ka asnjë klient në sistem.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 rounded-tl-lg font-bold">Biznesi</th>
                  <th className="p-3 font-bold">Emri i Klientit</th>
                  <th className="p-3 font-bold">Telefoni</th>
                  <th className="p-3 font-bold">Emaili</th>
                  <th className="p-3 rounded-tr-lg font-bold text-center">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {allClients.map((klienti) => (
                  <tr key={klienti.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-green-700">{klienti.businesses.name}</td>
                    <td className="p-3 font-medium text-gray-800">{klienti.name}</td>
                    <td className="p-3 text-gray-600">{klienti.phone}</td>
                    <td className="p-3 text-gray-500 italic">{klienti.email || "Nuk ka email"}</td>
                    <td className="p-3 text-center">
                      <form action={deleteClient}>
                        <input type="hidden" name="id" value={klienti.id} />
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