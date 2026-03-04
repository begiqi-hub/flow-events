export const dynamic = "force-dynamic";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { Building2, Layers, Users, Banknote } from "lucide-react";
import LogoutButton from "../components/LogoutButton";

export default async function Home() {
  // 1. Lexojmë statistikat
  const businessCount = await prisma.businesses.count();
  const hallCount = await prisma.halls.count();
  const clientCount = await prisma.clients.count();
  
  const revenueCalc = await prisma.bookings.aggregate({
    _sum: { total_amount: true }
  });
  const totalRevenue = revenueCalc._sum.total_amount || 0;

  // 2. Lexojmë bizneset
  const allBusinesses = await prisma.businesses.findMany({
    orderBy: { created_at: 'desc' }
  });

  // Funksionet
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
      console.log("Gabim gjatë ruajtjes");
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
    <div className="flex flex-col gap-8 p-4 md:p-8">
      
      {/* Pjesa e sipërme me Butonin e Daljes */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard-i i Pronarit</h1>
        <LogoutButton />
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Statistikat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-lg text-blue-600"><Building2 size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Biznese</p>
              <h3 className="text-2xl font-bold text-gray-900">{businessCount}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-lg text-purple-600"><Layers size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Salla</p>
              <h3 className="text-2xl font-bold text-gray-900">{hallCount}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-lg text-green-600"><Users size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Klientë</p>
              <h3 className="text-2xl font-bold text-gray-900">{clientCount}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200 flex items-center gap-4">
            <div className="bg-orange-100 p-4 rounded-lg text-orange-600"><Banknote size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Të Ardhura</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalRevenue.toString()} €</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">Shto Biznes</h2>
          <form action={createBusiness} className="flex flex-col gap-4">
            <input type="text" name="name" required className="border p-2.5 rounded-md text-sm" placeholder="Emri i Biznesit" />
            <input type="text" name="nui" required className="border p-2.5 rounded-md text-sm" placeholder="NUI" />
            <input type="email" name="email" required className="border p-2.5 rounded-md text-sm" placeholder="Email" />
            <input type="text" name="phone" required className="border p-2.5 rounded-md text-sm" placeholder="Telefoni" />
            <button type="submit" className="bg-gray-900 text-white font-medium py-2.5 rounded-md">Ruaj</button>
          </form>
        </div>

        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">Lista e Bizneseve</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-3">Emri</th>
                  <th className="pb-3">NUI</th>
                  <th className="pb-3">Emaili</th>
                  <th className="pb-3 text-right">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {allBusinesses.map((biznes) => (
                  <tr key={biznes.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 font-medium">{biznes.name}</td>
                    <td className="py-4 text-gray-600">{biznes.nui}</td>
                    <td className="py-4 text-gray-600">{biznes.email}</td>
                    <td className="py-4 text-right">
                      <form action={deleteBusiness}>
                        <input type="hidden" name="id" value={biznes.id} />
                        <button type="submit" className="text-red-500 bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 transition">Fshi</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}