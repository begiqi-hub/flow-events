import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Plus, Calendar as CalendarIcon, Building2, Wallet, ArrowRight, Clock 
} from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BusinessDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  // 1. STATISTIKAT KRYESORE
  // Numri i Sallave
  const activeHallsCount = await prisma.halls.count({
    where: { business_id: business.id }
  });

  // Të gjitha Rezervimet (Përjashto të anuluarat)
  const allBookings = await prisma.bookings.findMany({
    where: { 
      business_id: business.id,
      status: { notIn: ['cancelled', 'draft'] }
    }
  });

  const totalBookingsCount = allBookings.length;
  const totalRevenue = allBookings.reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);

  // 2. EVENTET NË VIJIM
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Fillo nga fillimi i ditës së sotme

  const upcomingBookings = await prisma.bookings.findMany({
    where: {
      business_id: business.id,
      event_date: { gte: today },
      status: { notIn: ['cancelled', 'draft'] }
    },
    include: {
      clients: true,
      halls: true,
    },
    orderBy: { event_date: 'asc' },
    take: 5 // Marrim vetëm 5 të parat për tabelën
  });

  // Funksion për ngjyrat e statusit
  const renderStatus = (status: string) => {
    switch(status) {
      case 'confirmed':
      case 'paid':
        return <span className="bg-[#E6F8F0] text-[#059669] px-3 py-1.5 rounded-full text-xs font-bold">Konfirmuar</span>;
      case 'pending':
        return <span className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold">Në Pritje</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      
      {/* BANERI I PROVËS (TRIAL) */}
      <div className="bg-[#FFF8E6] border border-[#FFE7B3] rounded-2xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-full shadow-sm text-amber-500">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Koha e Provës</h3>
            <p className="text-gray-600 text-sm mt-0.5">
              Ju kanë mbetur edhe <span className="font-bold text-gray-900">13 ditë</span> nga prova juaj falas.
            </p>
          </div>
        </div>
        <button className="bg-[#FFA000] hover:bg-[#FF8F00] text-white font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap shadow-sm">
          Abonohu Tani
        </button>
      </div>

      {/* 4 KARTAT E STATISTIKAVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* KARTA 1: SHTO REZERVIM */}
        <Link 
          href={`/${locale}/biznes/rezervimet/shto`}
          className="bg-[#0F172A] rounded-3xl p-6 flex flex-col justify-between group hover:scale-[1.02] transition-transform shadow-lg relative overflow-hidden h-[140px]"
        >
          <div className="absolute right-4 top-4 opacity-5 text-white">
            <CalendarIcon size={80} />
          </div>
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white mb-2">
            <Plus size={20} />
          </div>
          <div className="relative z-10">
            <h3 className="text-white font-bold text-lg leading-tight">Rezervim i Ri</h3>
            <p className="text-gray-400 text-xs mt-1 font-medium">Krijo një event të ri</p>
          </div>
        </Link>

        {/* KARTA 2: GJITHSEJ REZERVIME */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between h-[140px]">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gjithsej Rezervime</p>
            <p className="text-4xl font-black text-gray-900">{totalBookingsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <CalendarIcon size={24} />
          </div>
        </div>

        {/* KARTA 3: SALLA AKTIVE */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between h-[140px]">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Salla Aktive</p>
            <p className="text-4xl font-black text-gray-900">{activeHallsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
        </div>

        {/* KARTA 4: TË ARDHURA */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between h-[140px]">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Të Ardhura</p>
            <p className="text-3xl lg:text-4xl font-black text-gray-900 truncate max-w-[150px]" title={`${totalRevenue.toFixed(2)} €`}>
              {/* Formatojmë numrin që të duket si në foto: 27.486,15 */}
              {totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <Wallet size={24} />
          </div>
        </div>

      </div>

      {/* TABELA: EVENTET NË VIJIM */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 overflow-hidden">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Eventet në vijim</h2>
            <p className="text-sm text-gray-500 mt-1">Dasmat dhe ahengjet e radhës</p>
          </div>
          <Link href={`/${locale}/biznes/rezervimet`} className="text-[#FF5C39] hover:text-[#e84e2d] text-sm font-bold flex items-center gap-1 transition-colors">
            Shiko të gjitha <ArrowRight size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider w-[150px]">Data</th>
                <th className="py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Klienti</th>
                <th className="py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Salla</th>
                <th className="py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Statusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {upcomingBookings.length > 0 ? upcomingBookings.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-2 text-sm font-bold text-gray-900">
                    {/* Formati: 8.3.2026 */}
                    {format(new Date(booking.event_date), 'd.M.yyyy')}
                  </td>
                  <td className="py-4 px-2 text-sm font-medium text-gray-600">
                    {booking.clients?.name || "Klient i panjohur"}
                  </td>
                  <td className="py-4 px-2 text-sm font-medium text-gray-600">
                    {booking.halls?.name || "N/A"}
                  </td>
                  <td className="py-4 px-2 text-right">
                    {renderStatus(booking.status)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <p className="text-gray-500 font-medium">Nuk keni evente të planifikuara për të ardhmen.</p>
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