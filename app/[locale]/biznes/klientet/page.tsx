import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Users, PlusCircle, Pencil, Building2, User } from "lucide-react"; 
import SearchInput from "./SearchInput"; 

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClientsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ locale: string }>,
  searchParams?: Promise<{ search?: string }> 
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || ''; 
  
  const t = await getTranslations("Clients");
  
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

  const clients = await prisma.clients.findMany({
    where: { 
      business_id: business.id,
      ...(search ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
        ]
      } : {})
    },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="text-gray-400" size={32} />
            {t("pageTitle")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {t("pageSubtitle")}
          </p>
        </div>
        <Link 
          href={`/${locale}/biznes/klientet/shto`}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <PlusCircle size={20} /> {t("addBtn")}
        </Link>
      </div>

      {(clients.length > 0 || search !== '') && (
        <SearchInput />
      )}

      {clients.length > 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-4 text-sm font-bold text-gray-500 uppercase tracking-wider">{t("tableHeaderName")}</th>
                  <th className="p-4 text-sm font-bold text-gray-500 uppercase tracking-wider">{t("tableHeaderContact")}</th>
                  <th className="p-4 text-sm font-bold text-gray-500 uppercase tracking-wider">{t("tableHeaderDetails")}</th>
                  <th className="p-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">{t("tableHeaderActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                          {client.client_type === 'business' ? <Building2 size={20} /> : <User size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{client.name}</p>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {client.client_type === 'business' ? t("business") : t("individual")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900">{client.phone}</p>
                      {client.email && <p className="text-xs text-gray-500 mt-0.5">{client.email}</p>}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-700">{client.city || '-'}</p>
                      {client.personal_id && <p className="text-xs text-gray-500 mt-0.5">ID: {client.personal_id}</p>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/${locale}/biznes/klientet/ndrysho/${client.id}`}
                          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                          title={t("editBtn")}
                        >
                          <Pencil size={16} />
                        </Link>
                        {/* Butoni i fshirjes u hoq nga këtu */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
             {search !== '' ? "Nuk u gjet asnjë klient me këtë kërkim" : t("noClientsTitle")}
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            {search !== '' ? "Provo të kërkosh me një emër ose numër tjetër." : t("noClientsDesc")}
          </p>
          {search === '' && (
            <Link 
              href={`/${locale}/biznes/klientet/shto`} 
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md"
            >
              <PlusCircle size={20} />
              {t("createFirstBtn")}
            </Link>
          )}
        </div>
      )}

    </div>
  );
}