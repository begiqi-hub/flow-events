import DeleteExtraBtn from "./DeleteExtraBtn";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import Link from "next/link";
import { Sparkles, PlusCircle, Pencil, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// SHTUAR: `params` tani është Promise në Next.js 15
export default async function ExtrasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; // <--- SHTUAR `await`

  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  // Tërheqim ekstrat nga databaza
  const extras = await prisma.extras.findMany({
    where: { business_id: business.id },
    orderBy: { created_at: 'desc' } 
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      
      {/* KOKA E FAQES */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-gray-400" size={32} />
            Shërbimet Ekstra
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Menaxho shërbimet shtesë (DJ, Dekorime, Kameraman) që klientët mund t'i zgjedhin për eventin.
          </p>
        </div>
        
        <Link 
          href={`/${locale}/biznes/ekstra/shto`}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <PlusCircle size={20} />
          Shto Ekstra
        </Link>
      </div>

      {/* KARTAT E EKSTRAVE */}
      {extras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {extras.map((extra: any) => (
            <div key={extra.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative group hover:shadow-md transition-shadow flex flex-col">
              
              <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center text-gray-500 mb-4 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                <Sparkles size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{extra.name}</h3>
              <p className="text-3xl font-black text-emerald-500 mb-4">{Number(extra.price).toFixed(2)} €</p>
              
              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-2">
                
                {/* BUTONI I NDRYSHIMIT (EDIT) I PËRDITËSUAR */}
                <Link 
                  href={`/${locale}/biznes/ekstra/ndrysho/${extra.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  <Pencil size={16} />
                </Link>

                <DeleteExtraBtn id={extra.id} />
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* NËSE NUK KA EKSTRA */
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nuk keni asnjë Shërbim Ekstra</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            Shtoni DJ, Dekorime, Lojëra me drita ose shërbime të tjera shtesë për të rritur fitimet e eventit.
          </p>
          <Link 
            href={`/${locale}/biznes/ekstra/shto`} 
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md"
          >
            <PlusCircle size={20} />
            Krijo Shërbimin e Parë
          </Link>
        </div>
      )}
    </div>
  );
}