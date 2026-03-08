import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import Link from "next/link";
import { Users, Phone, Mail, Pencil, TrendingUp, CalendarCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  const clients = await prisma.clients.findMany({
    where: { business_id: business.id },
    include: {
      bookings: {
        select: {
          total_amount: true,
          status: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="text-gray-400" size={32} />
            Databaza e Klientëve
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Menaxho kontaktet dhe shiko historikun e shpenzimeve për secilin klient.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Të dhënat e Klientit</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Kontakti</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Historiku (CRM)</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {clients.length > 0 ? clients.map((client: any) => {
                
                const totalBookings = client.bookings.length;
                const totalSpent = client.bookings
                  .filter((b: any) => b.status !== 'cancelled')
                  .reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);

                return (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500 font-medium">ID: {client.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 space-y-1">
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" /> {client.phone}
                      </p>
                      {client.email && (
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" /> {client.email}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-max">
                          <TrendingUp size={12} /> {totalSpent.toFixed(2)} € shpenzuar
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md w-max">
                          <CalendarCheck size={12} /> {totalBookings} Evente
                        </span>
                      </div>
                    </td>

                    {/* VEPRIME - TANI GJITHMONË E DUKSHME DHE PA BUTON FSHIRJE */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center">
                        <Link 
                          href={`/${locale}/biznes/klientet/ndrysho/${client.id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition-colors text-sm font-bold"
                        >
                          <Pencil size={16} /> Ndrysho
                        </Link>
                      </div>
                    </td>

                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <Users className="mx-auto text-gray-300 mb-4" size={40} />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Nuk keni asnjë klient</h3>
                    <p className="text-gray-500 text-sm">Klientët do të shtohen automatikisht këtu kur të bëni rezervimin e parë.</p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}