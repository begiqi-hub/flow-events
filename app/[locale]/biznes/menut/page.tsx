import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import Link from "next/link";
import { Utensils, PlusCircle, Pencil, Image as ImageIcon } from "lucide-react";
import DeleteMenuBtn from "./DeleteMenuBtn";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MenusPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  // Tërheqim menutë me renditje kronologjike (e para e para, e fundit e fundit)
  const menus = await prisma.menus.findMany({
    where: { business_id: business.id },
    orderBy: { created_at: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      
      {/* KOKA E FAQES */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Utensils className="text-gray-400" size={32} />
            Pakot e Menusë
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Menaxho ushqimet, pakot dhe çmimet për person.
          </p>
        </div>
        <Link 
          href={`/${locale}/biznes/menut/shto`}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <PlusCircle size={20} /> Shto Menu
        </Link>
      </div>

      {/* LISTA E MENUVE (KARTAT) */}
      {menus.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu: any) => (
            <div key={menu.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
              
              {/* IMAZHI DHE ÇMIMI */}
              <div className="h-48 bg-gray-50 relative border-b border-gray-100 shrink-0">
                {menu.image ? (
                  <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Utensils size={40} className="mb-2 opacity-30" />
                    <span className="text-sm font-medium">S'ka foto</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1">
                  <span className="text-emerald-600 font-black">{Number(menu.price_per_person).toFixed(2)} €</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">/ person</span>
                </div>
              </div>

              {/* TË DHËNAT E MENUSË */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{menu.name}</h3>
                
                <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                  {menu.description || "Nuk ka përshkrim për këtë menu."}
                </p>

                {/* BUTONAT E VEPRIMEVE */}
                <div className="pt-4 border-t border-gray-50 flex items-center gap-2 mt-auto">
                  <Link 
                    href={`/${locale}/biznes/menut/ndrysho/${menu.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Pencil size={16} /> Ndrysho
                  </Link>
                  <DeleteMenuBtn id={menu.id} />
                </div>
              </div>
              
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Utensils size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nuk keni asnjë Menu</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            Shtoni pakot e ushqimit për t'u dhënë klientëve tuaj mundësi zgjedhjeje gjatë rezervimit.
          </p>
          <Link 
            href={`/${locale}/biznes/menut/shto`} 
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md"
          >
            <PlusCircle size={20} />
            Krijo Menunë e Parë
          </Link>
        </div>
      )}

    </div>
  );
}