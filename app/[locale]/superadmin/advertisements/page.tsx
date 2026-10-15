import { prisma } from "@/lib/prisma";
import { Plus, Eye, MousePointerClick, Activity, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { sq } from "date-fns/locale";
// Importoni komponentin e ri
import AdActionsDropdown from "@/components/admin/AdActionsDropdown";

// Shënim: Funksioni juaj ekzistues nuk pranonte `params`, por për të kaluar `locale` te dropdown, na duhet ta marrim.
export default async function SuperadminAds({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const ads = await prisma.advertisement.findMany({
    include: { business: { select: { name: true, nui: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const activeAdsCount = ads.filter(ad => ad.status === 'ACTIVE').length;
  const totalClicks = ads.reduce((acc, ad) => acc + (ad.clicks || 0), 0);
  const totalViews = ads.reduce((acc, ad) => acc + (ad.views || 0), 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-900">Menaxhimi i Reklamave</h1>
        <Link href={`/${locale}/superadmin/advertisements/create`} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
          <Plus size={18}/> Shto Reklamë
        </Link>
      </div>

      {/* Kartat e Statistikave mbeten njësoj */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl"><Activity size={24}/></div>
          <div><p className="text-sm font-bold text-gray-400">Aktive</p><h3 className="text-2xl font-black">{activeAdsCount} / {ads.length}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl"><Eye size={24}/></div>
          <div><p className="text-sm font-bold text-gray-400">Shikime Totale</p><h3 className="text-2xl font-black">{totalViews}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 text-orange-600 p-4 rounded-xl"><MousePointerClick size={24}/></div>
          <div><p className="text-sm font-bold text-gray-400">Klikime Totale</p><h3 className="text-2xl font-black">{totalClicks}</h3></div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-visible shadow-sm"> {/* Ndryshuar overflow-hidden në overflow-visible që dropdown të mos pritet */}
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Klienti & Reklama</th>
              <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Kohëzgjatja</th>
              <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Statistikat</th>
              <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Statusi</th>
              <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ads.map(ad => {
              const isExpired = ad.endDate ? new Date() > new Date(ad.endDate) : false;

              return (
                <tr key={ad.id} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{ad.title || ad.name}</p>
                    <p className="text-xs text-gray-500">{ad.business?.name || 'Klient i Jashtëm'}</p>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Clock size={12} className="text-emerald-500"/> 
                        Nis: {ad.startDate ? format(new Date(ad.startDate), "dd MMM yyyy", { locale: sq }) : 'N/A'}
                      </span>
                      <span className={`text-xs font-medium flex items-center gap-1 ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>
                        <Clock size={12} className={isExpired ? 'text-red-500' : 'text-gray-400'}/> 
                        Mbaron: {ad.endDate ? format(new Date(ad.endDate), "dd MMM yyyy", { locale: sq }) : 'Pa afat'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <p className="text-xs font-bold text-gray-600"><Eye size={12} className="inline mr-1"/> {ad.views || 0}</p>
                    <p className="text-xs font-bold text-gray-600 mt-1"><MousePointerClick size={12} className="inline mr-1"/> {ad.clicks || 0}</p>
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      isExpired ? 'bg-red-50 text-red-600 border border-red-100' : 
                      ad.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {isExpired ? 'E SKADUAR' : ad.status === 'ACTIVE' ? 'AKTIVE' : 'PASIVE'}
                    </span>
                  </td>
                  
                  <td className="p-4 text-right">
                    {/* Përdorimi i komponentit të ri */}
                    <AdActionsDropdown adId={ad.id} locale={locale} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}