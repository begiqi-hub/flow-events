import DeleteHallBtn from "./DeleteHallBtn";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import Link from "next/link";
import { Building2, PlusCircle, Pencil, Trash2, Users, ParkingCircle, Snowflake, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HallsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  // Tërheqim sallat dhe i rendisim që e reja të dalë e fundit
  const halls = await prisma.halls.findMany({
    where: { business_id: business.id },
    orderBy: { created_at: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      
      {/* KOKA E FAQES */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-gray-400" size={32} />
            Sallat e Eventeve
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Menaxho hapësirat tuaja, kapacitetet dhe fotografitë.
          </p>
        </div>
        <Link 
          href={`/${locale}/biznes/sallat/shto`}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <PlusCircle size={20} /> Shto Sallë
        </Link>
      </div>

      {/* LISTA E SALLAVE */}
      {halls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall: any) => (
            <div key={hall.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
              
              {/* IMAZHI I SALLËS */}
              <div className="h-48 bg-gray-50 relative border-b border-gray-100">
                {hall.image ? (
                  <img src={hall.image} alt={hall.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={40} className="mb-2 opacity-30" />
                    <span className="text-sm font-medium">S'ka foto</span>
                  </div>
                )}
                {/* KAPACITETI MBI FOTO */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Users size={16} className="text-blue-500" /> {hall.capacity} pax
                </div>
              </div>

              {/* TË DHËNAT E SALLËS */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{hall.name}</h3>
                {hall.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{hall.description}</p>
                )}
                
                {/* SPECIFIKAT (Kondicioner, Parking) */}
                <div className="flex items-center gap-3 mb-6 mt-auto">
                  {hall.parking && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                      <ParkingCircle size={14} /> Parking
                    </span>
                  )}
                  {hall.ac && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                      <Snowflake size={14} /> Kondicioner
                    </span>
                  )}
                </div>

                {/* BUTONAT E VEPRIMEVE */}
                <div className="pt-4 border-t border-gray-50 flex items-center gap-2">
                  <Link 
                    href={`/${locale}/biznes/sallat/ndrysho/${hall.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Pencil size={16} /> Ndrysho
                  </Link>
                  <button className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition-colors">
                    <DeleteHallBtn id={hall.id} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nuk keni asnjë Sallë</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            Shtoni hapësirat tuaja të eventeve për t'i bërë ato të disponueshme gjatë rezervimeve.
          </p>
          <Link 
            href={`/${locale}/biznes/sallat/shto`} 
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md"
          >
            <PlusCircle size={20} />
            Krijo Sallën e Parë
          </Link>
        </div>
      )}
    </div>
  );
}