import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma"; 
import Link from "next/link";
import { Building2, Landmark, ShieldAlert, Sparkles, Utensils, CheckCircle2, Clock } from "lucide-react";
import DashboardClient from "./DashboardClient";
import { getTranslations } from "next-intl/server"; // <--- Shtuar

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BusinessDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession();

  if (!session?.user?.email) redirect(`/${locale}/login`);

  // =====================================
  // LEXIMI I PËRKTHIMEVE NGA SERVERI
  // =====================================
  const t = await getTranslations("DashboardClient");
  
  const uiTranslations = {
    totalBookings: t("totalBookings"),
    totalBookingsDesc: t("totalBookingsDesc"),
    thisMonthBookings: t("thisMonthBookings"),
    thisMonthBookingsDesc: t("thisMonthBookingsDesc"),
    expectedRevenue: t("expectedRevenue"),
    expectedRevenueDesc: t("expectedRevenueDesc"),
    pendingRevenue: t("pendingRevenue"),
    pendingRevenueDesc: t("pendingRevenueDesc"),
    quickActions: t("quickActions"),
    newBookingBtn: t("newBookingBtn"),
    calendarBtn: t("calendarBtn"),
    salesChartTitle: t("salesChartTitle"),
    eventsThisMonthTitle: t("eventsThisMonthTitle"),
    eventConfirmed: t("eventConfirmed"),
    eventPending: t("eventPending"),
    eventPostponed: t("eventPostponed"),
    noEventsMsg: t("noEventsMsg")
  };

  // =======================================================================
  // LOGJIKA E RE PËR TË GJETUR BIZNESIN APO STAFIN
  // =======================================================================
  let userRole = "admin"; // <--- Deklarojmë rolin
  let business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) {
    const staffUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });
    if (staffUser && staffUser.business_id) {
      userRole = staffUser.role; // <--- Kapim rolin e stafit (psh. manager)
      business = await prisma.businesses.findUnique({
        where: { id: staffUser.business_id }
      });
    }
  }

  if (!business) redirect(`/${locale}/login`);

  // LLOGARITJA E DITËVE TË PROVËS
  const trialEndDate = business.trialEndsAt ? new Date(business.trialEndsAt) : null;
  const today = new Date();
  let daysRemaining = 0;
  if (trialEndDate) {
    const diffTime = trialEndDate.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  const isTrial = business.status === 'trial';

  // =======================================================================
  // 1. LOGJIKA E WIZARD-IT TË KONFIGURIMIT (ONBOARDING)
  // =======================================================================
  
  const realHalls = await prisma.halls.count({
    where: { business_id: business.id, name: { not: "Salla VIP (Demo)" } }
  });
  
  const realMenus = await prisma.menus.count({
    where: { business_id: business.id, name: { not: "Menu Tradicionale (Demo)" } }
  });

  const realExtras = await prisma.extras.count({
    where: { business_id: business.id, name: { not: "Dekorim Lulesh (Demo)" } }
  });

  const tasks = [
    { id: 'hall', title: "Shto Sallën e Parë", icon: Building2, isCompleted: realHalls > 0, link: `/${locale}/biznes/sallat/shto?onboarding=true` },
    { id: 'menu', title: "Krijo një Menu", icon: Utensils, isCompleted: realMenus > 0, link: `/${locale}/biznes/menut/shto?onboarding=true` },
    { id: 'extra', title: "Shto Shërbime Ekstra", icon: Sparkles, isCompleted: realExtras > 0, link: `/${locale}/biznes/ekstra/shto?onboarding=true` },
    { id: 'bank', title: "Llogaria Bankare", icon: Landmark, isCompleted: !!business.iban || !!business.bank_name, link: `/${locale}/biznes/banka?onboarding=true` },
    { id: 'policy', title: "Politika & Kontrata", icon: ShieldAlert, isCompleted: (business.cancel_penalty ?? 0) > 0, link: `/${locale}/biznes/konfigurimet/politika?onboarding=true` },
  ];

  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const progressPercent = Math.round((completedTasks / tasks.length) * 100);

  // =======================================================================
  // 2. DATA FETCHING PËR DASHBOARD CLIENT
  // =======================================================================
  
  const allBookingsRaw = await prisma.bookings.findMany({
    where: { business_id: business.id, status: { notIn: ['cancelled', 'draft'] } },
    include: { clients: true, halls: true, payments: true, booking_extras: { include: { extras: true } } }
  });

  const bizMenus = await prisma.menus.findMany({ where: { business_id: business.id } });
  
  const allBookings = allBookingsRaw.map((b: any) => ({
    ...b,
    menus: b.menu_id ? bizMenus.find((m: any) => m.id === b.menu_id) || null : null
  }));

  const totalCount = allBookings.length;
  const now = new Date();
  const sMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const eMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthBookings = allBookings
    .filter((b: any) => new Date(b.event_date) >= sMonth && new Date(b.event_date) <= eMonth)
    .sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  let monthRevenue = 0;
  let monthPending = 0;

  monthBookings.forEach((b: any) => {
    const total = Number(b.total_amount) || 0;
    const paid = b.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    monthRevenue += total;
    monthPending += (total - paid);
  });

  const safeBusiness = JSON.parse(JSON.stringify(business));
  const serializedMonthBookings = JSON.parse(JSON.stringify(monthBookings));

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-8">
      
        {/* WIZARD-I I KONFIGURIMIT */}
        {progressPercent < 100 && (
          <div className="bg-white border border-indigo-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Sparkles className="text-indigo-500" size={24} /> 
                  Mirësevini! Konfiguroni biznesin tuaj
                </h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">Plotësoni këto hapa për të nisur punën me kapacitet të plotë.</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-1/3">
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="text-indigo-600 font-black text-sm">{progressPercent}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              {tasks.map(task => {
                const Icon = task.icon;
                return (
                  <Link 
                    key={task.id} 
                    href={task.link} 
                    className={`flex flex-col items-start p-4 rounded-2xl border transition-all group ${
                      task.isCompleted 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-white hover:border-indigo-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className={`p-2 rounded-xl ${task.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-400 group-hover:text-indigo-500 shadow-sm'}`}>
                        <Icon size={18} />
                      </div>
                      {task.isCompleted ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-indigo-200 transition-colors"></div>
                      )}
                    </div>
                    <span className={`text-xs font-bold leading-tight ${task.isCompleted ? 'text-emerald-700' : 'text-gray-700'}`}>
                      {task.title}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* KLIENTI I DASHBOARD-IT QË MBAN KALENDARIN DHE KARTAT */}
      <DashboardClient 
        business={safeBusiness} 
        locale={locale} 
        stats={{ 
          total: totalCount, 
          month: monthBookings.length,
          revenue: monthRevenue,
          pending: monthPending 
        }}
        monthBookings={serializedMonthBookings}
        notifications={[]}
        userRole={userRole}
        uiTranslations={uiTranslations} // <--- Shtuar kjo!
      />
    </>
  );
}