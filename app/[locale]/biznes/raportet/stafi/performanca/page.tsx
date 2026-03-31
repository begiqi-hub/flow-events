import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BarChart3, CalendarCheck, XCircle, TrendingUp, DollarSign, Users, Activity } from "lucide-react";
import StaffSelect from "./StaffSelect";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function StaffPerformancePage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ locale: string }>,
  searchParams?: Promise<{ staffId?: string }> 
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const staffId = resolvedSearchParams?.staffId;
  
  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  // --- LOGJIKA E RE DHE E SAKTË PËR TË GJETUR BIZNESIN ---
  // 1. Kërkojmë nëse personi që po logohet është PRONARI
  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  // 2. Nëse nuk është pronari, kërkojmë nëse është STAF
  if (!business) {
    const dbUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    // Nëse është staf, gjejmë biznesin të cilit i përket
    if (dbUser) {
      business = await prisma.businesses.findUnique({
        where: { id: dbUser.business_id }
      });
    }
  }

  // 3. Nëse emaili nuk u gjet as si pronar, as si staf, atëherë e dëbojmë
  if (!business) redirect(`/${locale}/login`);
  // --------------------------------------------------------

  const t = await getTranslations("StaffPerformance");
  const tEntity = await getTranslations("Entities");

  const staffMembersRaw = await prisma.users.findMany({
    where: { business_id: business.id },
    select: { id: true, full_name: true, role: true } 
  });

  const staffMembers = staffMembersRaw.map(staff => ({
    id: staff.id,
    name: `${staff.full_name} (${staff.role})`
  }));

  let totalBookings = 0;
  let cancelledBookings = 0;
  let successRate = 0;
  let totalPaymentsCollected = 0;
  let recentActions: any[] = [];

  if (staffId) {
    const payments = await prisma.payments.aggregate({
      where: {
        bookings: { business_id: business.id }, 
        recorded_by: staffId 
      },
      _sum: { amount: true }
    });
    
    totalPaymentsCollected = Number(payments._sum.amount || 0);

    totalBookings = await prisma.audit_logs.count({
      where: {
        business_id: business.id,
        user_id: staffId,
        entity: "bookings",
        action: { contains: "Krijim" }
      }
    });

    cancelledBookings = await prisma.audit_logs.count({
      where: {
        business_id: business.id,
        user_id: staffId,
        entity: "bookings",
        action: { contains: "Anulim" }
      }
    });

    if (totalBookings > 0) {
      const successful = totalBookings - cancelledBookings;
      successRate = Math.round((successful / totalBookings) * 100);
      if (successRate < 0) successRate = 0; 
    }

    recentActions = await prisma.audit_logs.findMany({
      where: {
        business_id: business.id,
        user_id: staffId
      },
      orderBy: { created_at: 'desc' },
      take: 50
    });
  }

  // --- FUNKSIONI PËR PËRKTHIMIN E VEPRIMEVE NGA DB ---
  const translateAction = (rawAction: string) => {
    const actionLower = rawAction.toLowerCase();
    if (actionLower.includes("krijim")) return t("actionCreate");
    if (actionLower.includes("anulim")) return t("actionCancel");
    if (actionLower.includes("përditësim")) return t("actionUpdate");
    if (actionLower.includes("shtim")) return t("actionAdd");
    if (actionLower.includes("fshirje")) return t("actionDelete");
    return rawAction; // Fallback nëse nuk gjen përputhje
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <BarChart3 className="text-blue-500" size={32} />
          {t("title")}
        </h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">
          {t("subtitle")}
        </p>
      </div>

      <StaffSelect staffList={staffMembers} />

      {staffId ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <CalendarCheck size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t("cardCreations")}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{totalBookings}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <XCircle size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t("cardCancellations")}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{cancelledBookings}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t("cardSuccess")}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{successRate}%</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <DollarSign size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t("cardCollected")}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">
                  {totalPaymentsCollected.toLocaleString()} {business.currency}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Activity size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">{t("logTitle")}</h3>
                <p className="text-sm text-gray-500 font-medium">{t("logSubtitle")}</p>
              </div>
            </div>
            
            {recentActions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="p-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">{t("thDateTime")}</th>
                      <th className="p-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">{t("thAction")}</th>
                      <th className="p-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">{t("thModule")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentActions.map((log) => {
                      const translatedEntity = tEntity.has(log.entity as any) 
                        ? tEntity(log.entity as any) 
                        : log.entity.toUpperCase();

                      return (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-700">
                              {log.created_at ? new Date(log.created_at).toLocaleDateString(locale === 'sq' ? 'sq-AL' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              {log.created_at ? new Date(log.created_at).toLocaleTimeString(locale === 'sq' ? 'sq-AL' : 'en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold
                              ${log.action.includes('Krijim') || log.action.includes('Shtim') ? 'bg-green-50 text-green-700' : 
                                log.action.includes('Anulim') || log.action.includes('Fshirje') ? 'bg-red-50 text-red-700' : 
                                'bg-blue-50 text-blue-700'}`}
                            >
                              {translateAction(log.action)}
                            </span>
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-600 uppercase tracking-wider">
                            {translatedEntity}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <Activity size={24} className="text-gray-400 mx-auto mb-4" />
                <h4 className="text-gray-900 font-bold mb-1">{t("emptyStateTitle")}</h4>
                <p className="text-gray-500 text-sm">{t("emptyStateDesc")}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-500">{t("noStaffSelected")}</h3>
          <p className="text-gray-400 text-sm mt-2">{t("noStaffDesc")}</p>
        </div>
      )}
    </div>
  );
}