import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma"; // <--- Viza e kuqe u rregullua
import Link from "next/link";
import { PlusCircle, Search, Calendar, Clock, MapPin, CheckCircle2, Clock4 } from "lucide-react";
import { format } from "date-fns";
import DownloadInvoiceBtn from "./DownloadInvoiceBtn"; // <--- Viza e kuqe u rregullua

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReservationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  const bookings = await prisma.bookings.findMany({
    where: { business_id: business.id },
    include: {
      clients: true,
      halls: true,
    },
    orderBy: { created_at: 'desc' }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200"><CheckCircle2 size={12}/> E Konfirmuar</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200"><Clock4 size={12}/> Në Pritje</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Calendar className="text-gray-400" size={32} />
            Lista e Rezervimeve
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Menaxho të gjitha eventet e tua, shkarko faturat dhe kontrollo pagesat.
          </p>
        </div>
        
        <Link 
          href={`/${locale}/biznes/rezervimet/shto`}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <PlusCircle size={20} />
          Rezervim i Ri
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Klienti & Eventi</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Data & Ora</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Statusi</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Totali</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {bookings.length > 0 ? bookings.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-gray-900 mb-1">{booking.clients?.name || "Klient i panjohur"}</p>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <MapPin size={12} /> {booking.halls?.name || "Salla nuk është zgjedhur"} 
                      <span className="mx-1">•</span> 
                      {booking.participants} pax
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      {format(new Date(booking.event_date), 'dd MMM yyyy')}
                    </p>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Clock size={12} /> 
                      {format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-black text-emerald-600">
                      {Number(booking.total_amount).toFixed(2)} €
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <DownloadInvoiceBtn booking={booking} business={business} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Calendar className="mx-auto text-gray-300 mb-4" size={40} />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Nuk keni asnjë rezervim</h3>
                    <p className="text-gray-500 text-sm">Krijoni rezervimin tuaj të parë për të parë listën këtu.</p>
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