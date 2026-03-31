import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma"; 
import Link from "next/link";
import { 
  Plus, Calendar as CalendarIcon, Building2, Wallet, ArrowRight, 
  Clock, CheckCircle2, Sparkles, Utensils, Landmark, ShieldAlert 
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

  // LLOGARITJA E DITËVE TË PROVËS (Për Banerin)
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

  // RADHITJA DHE IKONAT E REJA
  const tasks = [
    { 
      id: 'hall', 
      title: "Shto Sallën e Parë", 
      icon: Building2,
      isCompleted: realHalls > 0, 
      link: `/${locale}/biznes/sallat` 
    },
    { 
      id: 'menu', 
      title: "Krijo një Menu", 
      icon: Utensils,
      isCompleted: realMenus > 0, 
      link: `/${locale}/biznes/menut` 
    },
    { 
      id: 'extra', 
      title: "Shto Shërbime Ekstra", 
      icon: Sparkles,
      isCompleted: realExtras > 0, 
      link: `/${locale}/biznes/ekstra` 
    },
    { 
      id: 'bank', 
      title: "Llogaria Bankare (IBAN)", 
      icon: Landmark,
      isCompleted: !!business.iban || !!business.bank_name, 
      link: `/${locale}/biznes/banka` 
    },
    { 
      id: 'policy', 
      title: "Politika e Anulimit", 
      icon: ShieldAlert,
      isCompleted: (business.cancel_penalty ?? 0) > 0, 
      link: `/${locale}/biznes/konfigurimet/politika` 
    },
  ];

  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const progressPercent = Math.round((completedTasks / tasks.length) * 100);

  // =======================================================================
  // 2. STATISTIKAT KRYESORE TË DASHBOARD-IT
  // =======================================================================
  
  const activeHallsCount = await prisma.halls.count({
    where: { business_id: business.id }
  });

  const allBookings = await prisma.bookings.findMany({
    where: { 
      business_id: business.id,
      status: { notIn: ['cancelled', 'draft'] }
    }
  });

  const totalBookingsCount = allBookings.length;
  const totalRevenue = allBookings.reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0); 

  const upcomingBookings = await prisma.bookings.findMany({
    where: {
      business_id: business.id,
      event_date: { gte: todayMidnight },
      status: { notIn: ['cancelled', 'draft'] }
    },
    include: {
      clients: true,
      halls: true,
    },
    orderBy: { event_date: 'asc' },
    take: 5 
  });

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
      
      

      {/* ========================================================= */}
      {/* WIZARD-I I KONFIGURIMIT (Me Ikona) */}
      {/* ========================================================= */}
      {progressPercent < 100 && (
        <div className="bg-white border border-indigo-100 rounded-[2rem] p-6 md:p-8 mb-8 shadow-sm">
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

      {/* 4 KARTAT E STATISTIKAVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
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

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between h-[140px]">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gjithsej Rezervime</p>
            <p className="text-4xl font-black text-gray-900">{totalBookingsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <CalendarIcon size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between h-[140px]">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Salla Aktive</p>
            <p className="text-4xl font-black text-gray-900">{activeHallsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between h-[140px]">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Të Ardhura</p>
            <p className="text-3xl lg:text-4xl font-black text-gray-900 truncate max-w-[150px]" title={`${totalRevenue.toFixed(2)} €`}>
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