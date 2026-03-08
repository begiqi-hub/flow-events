import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, addMonths, subMonths, 
  isSameMonth, isSameDay, isToday, parseISO 
} from "date-fns";
import { sq } from "date-fns/locale";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CalendarPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { locale } = await params;
  const { date } = await searchParams;

  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  // Përcaktojmë muajin aktual bazuar në URL, ose marrim muajin e sotëm
  const currentDate = date ? parseISO(date) : new Date();
  
  // Llogaritjet për Grid-in e Kalendarit
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 }); // E Hëna fillon java
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });

  const daysInGrid = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonthDate = format(subMonths(currentDate, 1), 'yyyy-MM-dd');
  const nextMonthDate = format(addMonths(currentDate, 1), 'yyyy-MM-dd');

  // Tërheqim rezervimet që ndodhin Gjatë këtij muaji
  const bookings = await prisma.bookings.findMany({
    where: { 
      business_id: business.id,
      event_date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      halls: true,
      clients: true,
    }
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      
      {/* KOKA E FAQES & KONTROLLET E MUAJIT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-gray-400" size={32} />
            Kalendari i Eventeve
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Planifiko dhe shiko të gjitha rezervimet e tua të organizuara sipas datave.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
          <Link 
            href={`/${locale}/biznes/kalendari?date=${prevMonthDate}`}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
          >
            <ChevronLeft size={24} />
          </Link>
          
          <h2 className="text-lg font-bold text-gray-900 min-w-[140px] text-center capitalize">
            {format(currentDate, "MMMM yyyy", { locale: sq })}
          </h2>
          
          <Link 
            href={`/${locale}/biznes/kalendari?date=${nextMonthDate}`}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
          >
            <ChevronRight size={24} />
          </Link>
        </div>
      </div>

      {/* KALENDARI VISUAL */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Ditët e Javës */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'].map((day) => (
            <div key={day} className="py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Grid-i i Datave */}
        <div className="grid grid-cols-7 auto-rows-[140px]">
          {daysInGrid.map((day, dayIdx) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            
            // Gjejmë nëse ka rezervime për këtë ditë
            const daysBookings = bookings.filter(b => isSameDay(new Date(b.event_date), day));

            return (
              <div 
                key={day.toString()} 
                className={`border-r border-b border-gray-100 p-2 relative transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                    isTodayDate 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Shfaqja e Rezervimeve në këtë ditë */}
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[85px] no-scrollbar">
                  {daysBookings.map((booking) => (
                    <Link 
                      href={`/${locale}/biznes/rezervimet`} // Të çon te lista e rezervimeve kur e klikon
                      key={booking.id} 
                      className={`block px-2 py-1.5 rounded-lg text-xs font-bold truncate border transition-all hover:scale-[1.02] ${
                        booking.status === 'confirmed' || booking.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <Clock size={10} /> {format(new Date(booking.start_time), "HH:mm")}
                      </div>
                      <span className="truncate">{booking.clients?.name}</span>
                    </Link>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}