import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { Building2, Layers, Users, Banknote } from "lucide-react";

export default async function Home() {
  // 1. Lexojmë statistikat nga të gjitha tabelat për Dashboard-in
  const businessCount = await prisma.businesses.count();
  const hallCount = await prisma.halls.count();
  const clientCount = await prisma.clients.count();
  
  // Magjia e Prisma-s: Mbledhim totalin e parave nga të gjitha rezervimet
  const revenueCalc = await prisma.bookings.aggregate({
    _sum: { total_amount: true }
  });
  const totalRevenue = revenueCalc._sum.total_amount || 0;

  // 2. Lexojmë bizneset për tabelën poshtë
  const allBusinesses = await prisma.businesses.findMany({
    orderBy: { created_at: 'desc' }
  });

  // Funksionet e databazës
  async function createBusiness(formData: FormData) {
    "use server";
    try {
      const name = formData.get("name") as string;
      const nui = formData.get("nui") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;

      await prisma.businesses.create({ data: { name, nui, email, phone } });
      revalidatePath("/");
    } catch (error) {
      console.log("Gabim: Ky biznes ekziston tashmë!");
    }
  }

  async function deleteBusiness(formData: FormData) {
    "use server";
    try {
      const id = formData.get("id") as string;
      await prisma.businesses.delete({ where: { id: id } });
      revalidatePath("/");
    } catch (error) {
      console.log("Gabim gjatë fshirjes");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* PJESA 1: DASHBOARD - Kartat e Statistikave */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Përmbledhja e Sistemit</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Karta 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-blue-100 p-4 rounded-lg text-blue-600">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Biznese</p>
              <h3 className="text-2xl font-bold text-gray-900">{businessCount}</h3>
            </div>
          </div>

          {/* Karta 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-purple-100 p-4 rounded-lg text-purple-600">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Salla</p>
              <h3 className="text-2xl font-bold text-gray-900">{hallCount}</h3>
            </div>
          </div>

          {/* Karta 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-green-100 p-4 rounded-lg text-green-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Klientë</p>
              <h3 className="text-2xl font-bold text-gray-900">{clientCount}</h3>
            </div>
          </div>

          {/* Karta 4 (E veçantë për të ardhurat) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200 flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-orange-100 p-4 rounded-lg text-orange-600">
              <Banknote size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Të Ardhura</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalRevenue.toString()} €</h3>
            </div>
          </div>

        </div>
      </div>

      {/* PJESA 2: Menaxhimi i Bizneseve (Forma dhe Tabela) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        
        {/* Forma */}
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">Shto Biznes të Ri</h2>
          <form action={createBusiness} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emri i Biznesit</label>
              <input type="text" name="name" required className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="psh. Salla Iliria" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NUI (Numri Unik)</label>
              <input type="text" name="nui" required className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="psh. 812345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" required className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="info@iliria.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefoni</label>
              <input type="text" name="phone" required className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="044 123 456" />
            </div>
            <button type="submit" className="mt-2 bg-gray-900 text-white font-medium py-2.5 rounded-md hover:bg-gray-800 transition">
              Ruaj Biznesin
            </button>
          </form>
        </div>

        {/* Tabela */}
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">Lista e Bizneseve</h2>
          {allBusinesses.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Nuk ka asnjë biznes të regjistruar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="pb-3 font-medium">Emri</th>
                    <th className="pb-3 font-medium">NUI</th>
                    <th className="pb-3 font-medium">Emaili</th>
                    <th className="pb-3 font-medium text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {allBusinesses.map((biznes) => (
                    <tr key={biznes.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-medium text-gray-900">{biznes.name}</td>
                      <td className="py-4 text-gray-600">{biznes.nui}</td>
                      <td className="py-4 text-gray-600">{biznes.email}</td>
                      <td className="py-4 text-right">
                        <form action={deleteBusiness}>
                          <input type="hidden" name="id" value={biznes.id} />
                          <button type="submit" className="text-red-500 hover:text-red-700 font-medium bg-red-50 px-3 py-1.5 rounded-md transition">Fshi</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}