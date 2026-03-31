import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Sparkles, PlusCircle, Pencil, Tag } from "lucide-react";
import DeleteExtraBtn from "./DeleteExtraBtn";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExtrasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Extras");
  
  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) {
    const staffUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });
    if (staffUser && staffUser.business_id) {
      business = await prisma.businesses.findUnique({
        where: { id: staffUser.business_id }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  const rawExtras = await prisma.extras.findMany({
    where: { business_id: business.id },
    orderBy: { created_at: 'desc' }
  });

  const extras = rawExtras.map(ex => ({
    ...ex,
    price: Number(ex.price)
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-gray-400" size={32} />
            {t("pageTitle")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {t("pageSubtitle")}
          </p>
        </div>
        <Link 
          href={`/${locale}/biznes/ekstra/shto`}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <PlusCircle size={20} /> {t("addBtn")}
        </Link>
      </div>

      {extras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {extras.map((extra: any) => (
            <div key={extra.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gray-900"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gray-50 p-3 rounded-2xl text-gray-700">
                  <Tag size={24} />
                </div>
                <span className="bg-emerald-50 text-emerald-600 font-black px-3 py-1.5 rounded-xl shadow-sm text-lg">
                  {extra.price.toFixed(2)} {t("currency")}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-6 flex-1">{extra.name}</h3>

              <div className="pt-4 border-t border-gray-50 flex items-center gap-2 mt-auto">
                <Link 
                  href={`/${locale}/biznes/ekstra/ndrysho/${extra.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  <Pencil size={16} /> {t("editBtn")}
                </Link>
                <DeleteExtraBtn id={extra.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t("noExtrasTitle")}</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            {t("noExtrasDesc")}
          </p>
          <Link 
            href={`/${locale}/biznes/ekstra/shto`} 
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md"
          >
            <PlusCircle size={20} />
            {t("createFirstBtn")}
          </Link>
        </div>
      )}

    </div>
  );
}