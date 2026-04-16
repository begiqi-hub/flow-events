"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, CalendarDays, ClipboardList, Users, BarChart3, 
  Building2, Utensils, Sparkles, UserCircle, ChevronLeft, ChevronRight,
  LogOut, Settings, Building, FileText, Menu, X, ShieldAlert, Landmark, AlertCircle, Globe,
  TrendingUp, Bell, Clock, Wallet, PenTool,
  LifeBuoy, Monitor, Lock, AlertTriangle, CreditCard
} from "lucide-react";

const GJUHET = [
  { code: "sq", name: "Shqip", flag: "al" },
  { code: "en", name: "English", flag: "gb" },
  { code: "mk", name: "Македонски", flag: "mk" },
  { code: "cg", name: "Crnogorski", flag: "me" },
  { code: "el", name: "Ελληνικά", flag: "gr" }
];

export default function BusinessLayoutUI({ business, notifications = [], userRole = "admin", uiTranslations, children }: any) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const params = useParams();
  const locale = (params?.locale as string) || "sq";
  const pathname = usePathname();
  const router = useRouter();
  
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null); 

  const logoPath = "/logo-register.svg";
  const iconPath = "/apple-touch-icon.png"; // <--- IKONA PËR MENUNË E MBYLLUR

  const currentLang = GJUHET.find(g => g.code === locale) || GJUHET[0];

  const trialEndDate = business.trialEndsAt ? new Date(business.trialEndsAt) : null;
  const today = new Date();
  let daysRemaining = 0;
  if (trialEndDate) {
    const diffTime = trialEndDate.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  const isTrial = business.status !== 'active';
  const isGracePeriod = isTrial && daysRemaining <= 0 && daysRemaining >= -3; 
  const isHardLocked = (business.status === 'inactive') || (isTrial && daysRemaining < -3); 

  const isAbonimiPage = pathname.includes('/biznes/abonimi');
  const isNdihmaPage = pathname.includes('/biznes/ndihma');
  const isProfilePage = pathname.includes('/biznes/konfigurimet/profili'); 
  const isSafePage = isAbonimiPage || isNdihmaPage || isProfilePage;

  const showGlobalBlocker = isHardLocked && !isSafePage;

  const pendingCount = business?.bookings?.filter((b: any) => {
      const isPending = b.status === 'pending';
      const isFromReception = b.creator?.role === 'reception' || (b.staff_notes && b.staff_notes.includes('[SHTUAR NGA RECEPSIONI]'));
      return isPending && isFromReception;
  }).length || 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const changeLanguage = (newLocale: string) => {
    setIsLangOpen(false);
    if (newLocale === locale) return;
    
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const navItems = [
    { name: uiTranslations.dashboard || "Ballina", href: `/${locale}/biznes`, icon: LayoutDashboard },
    { name: uiTranslations.calendar || "Kalendari", href: `/${locale}/biznes/kalendari`, icon: CalendarDays },
    { name: uiTranslations.bookings || "Rezervimet", href: `/${locale}/biznes/rezervimet`, icon: ClipboardList },
    { name: "Ofertat", href: `/${locale}/biznes/ofertat`, icon: FileText }, 
    { name: uiTranslations.clients || "Klientët", href: `/${locale}/biznes/klientet`, icon: Users },
  ];

  const reportItems = [
    { name: uiTranslations.reports || "Raportet", href: `/${locale}/biznes/raportet`, icon: BarChart3 },
    { name: uiTranslations.performanca || "Performanca", href: `/${locale}/biznes/raportet/stafi/performanca`, icon: TrendingUp }, 
  ];

  const configItems = [
    { name: uiTranslations.halls || "Sallat", href: `/${locale}/biznes/sallat`, icon: Building2 },
    { name: uiTranslations.menus || "Menutë", href: `/${locale}/biznes/menut`, icon: Utensils },
    { name: uiTranslations.extras || "Ekstrat", href: `/${locale}/biznes/ekstra`, icon: Sparkles },
  ];

  const supportItems = [
    { name: "Ndihma", href: `/${locale}/biznes/ndihma`, icon: LifeBuoy }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden w-full relative">
      
      {showGlobalBlocker && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="bg-white max-w-md w-full rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
              <Lock className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Qasja e Bllokuar!</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed text-sm md:text-base">
              Abonimi juaj ka skaduar dhe periudha e mirëkuptimit ka përfunduar. Për të rikthyer qasjen në funksionet e platformës dhe për të hapur rezervimet tuaja, ju lutem rinovoni planin. 
              <br/><span className="block mt-2 font-bold text-gray-700">Të dhënat tuaja janë të sigurta!</span>
            </p>
            <button onClick={() => router.push(`/${locale}/biznes/abonimi`)} className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white py-4 md:py-5 rounded-2xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-2 group">
              <CreditCard size={20} className="text-amber-400 group-hover:scale-110 transition-transform" /> 
              Rinovo Abonimin Tani
            </button>
            <button onClick={() => signOut({ callbackUrl: `/${locale}/login` })} className="mt-6 text-sm font-bold text-gray-400 hover:text-red-600 transition-colors">
              Dil nga llogaria
            </button>
          </div>
        </div>
      )}
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[100] flex flex-col bg-white border-r border-gray-100 shadow-2xl md:shadow-sm transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 
        ${isMinimized ? 'md:w-20' : 'md:w-64'} 
        w-64 shrink-0
      `}>
        
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden absolute right-4 top-6 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full p-2">
          <X size={20} />
        </button>

        <button onClick={() => setIsMinimized(!isMinimized)} className="hidden md:flex absolute -right-3 top-8 bg-white border border-gray-200 text-gray-500 rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors z-30">
          {isMinimized ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* LOGJIKA E RE PËR LOGON / IKONËN */}
        <div className={`h-16 md:h-20 flex items-center justify-center border-b border-gray-50 transition-all shrink-0 w-full`}>
          <Link href={`/${locale}/biznes`} className="flex items-center justify-center w-full">
             {isMinimized ? (
               <img src={iconPath} alt="H" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
             ) : (
               <img src={logoPath} alt="HALLEVO" className="h-9 w-auto object-contain px-4" />
             )}
          </Link>
        </div>

        <nav className={`flex-1 overflow-y-auto py-6 flex flex-col gap-1.5 px-3 custom-scrollbar ${showGlobalBlocker ? 'opacity-30 pointer-events-none' : ''}`}>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center rounded-xl transition-all font-medium group
                  ${isActive ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                  ${isMinimized ? 'md:justify-center p-3 gap-3 md:gap-0' : 'px-3 py-2.5 gap-3'}
                `}
                title={isMinimized ? item.name : ""}
              >
                <item.icon size={20} className={isActive ? "text-white" : "text-gray-500 group-hover:text-gray-900 shrink-0"} />
                <span className={`whitespace-nowrap ${isMinimized ? 'md:hidden block' : 'block'}`}>{item.name}</span>
              </Link>
            )
          })}
          
          {userRole !== 'manager' ? (
            <>
              <div className={`mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider ${isMinimized ? 'md:text-center px-3' : 'px-3'}`}>
                <span className={isMinimized ? 'md:hidden block' : 'block'}>{uiTranslations.reports || "Raportet"}</span>
                <span className={`hidden ${isMinimized ? 'md:block' : ''}`}>•••</span>
              </div>

              {reportItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    className={`flex items-center rounded-xl transition-all font-medium group
                      ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                      ${isMinimized ? 'md:justify-center p-3 gap-3 md:gap-0' : 'px-3 py-2.5 gap-3'}
                    `}
                    title={isMinimized ? item.name : ""}
                  >
                    <item.icon size={20} className={isActive ? "text-indigo-600" : "text-gray-500 group-hover:text-gray-900 shrink-0"} />
                    <span className={`whitespace-nowrap ${isMinimized ? 'md:hidden block' : 'block'}`}>{item.name}</span>
                  </Link>
                )
              })}
            </>
          ) : (
            <>
              <div className={`mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider ${isMinimized ? 'md:text-center px-3' : 'px-3'}`}>
                <span className={isMinimized ? 'md:hidden block' : 'block'}>Financat</span>
                <span className={`hidden ${isMinimized ? 'md:block' : ''}`}>•••</span>
              </div>
              <Link 
                href={`/${locale}/biznes/rezervimet?filter=debt`} 
                className={`flex items-center rounded-xl transition-all font-medium group text-gray-600 hover:text-red-700 hover:bg-red-50
                  ${isMinimized ? 'md:justify-center p-3 gap-3 md:gap-0' : 'px-3 py-2.5 gap-3'}
                `}
                title={isMinimized ? "Borxhet e Klientëve" : ""}
              >
                <Wallet size={20} className="text-red-500 shrink-0" />
                <span className={`whitespace-nowrap ${isMinimized ? 'md:hidden block' : 'block'}`}>Borxhet e Klientëve</span>
              </Link>
            </>
          )}

          <div className={`mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider ${isMinimized ? 'md:text-center px-3' : 'px-3'}`}>
            <span className={isMinimized ? 'md:hidden block' : 'block'}>{uiTranslations.settings || "Cilësimet"}</span>
            <span className={`hidden ${isMinimized ? 'md:block' : ''}`}>•••</span>
          </div>
          
          {configItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center rounded-xl transition-all font-medium group
                  ${isActive ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                  ${isMinimized ? 'md:justify-center p-3 gap-3 md:gap-0' : 'px-3 py-2.5 gap-3'}
                `}
                title={isMinimized ? item.name : ""}
              >
                <item.icon size={20} className={isActive ? "text-white" : "text-gray-500 group-hover:text-gray-900 shrink-0"} />
                <span className={`whitespace-nowrap ${isMinimized ? 'md:hidden block' : 'block'}`}>{item.name}</span>
              </Link>
            )
          })}

          <div className={`mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider ${isMinimized ? 'md:text-center px-3' : 'px-3'}`}>
            <span className={isMinimized ? 'md:hidden block' : 'block'}>Mbështetja</span>
            <span className={`hidden ${isMinimized ? 'md:block' : ''}`}>•••</span>
          </div>

          {supportItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center rounded-xl transition-all font-medium group
                  ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}
                  ${isMinimized ? 'md:justify-center p-3 gap-3 md:gap-0' : 'px-3 py-2.5 gap-3'}
                `}
                title={isMinimized ? item.name : ""}
              >
                <item.icon size={20} className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500 shrink-0"} />
                <span className={`whitespace-nowrap ${isMinimized ? 'md:hidden block' : 'block'}`}>{item.name}</span>
              </Link>
            )
          })}
          
        </nav>
      </aside>

      <div className={`flex-1 flex flex-col h-full relative min-w-0 ${showGlobalBlocker ? 'pointer-events-none filter blur-sm transition-all' : ''}`}>
        
        <header className="h-16 md:h-20 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 z-[60] sticky top-0 w-full shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-colors shrink-0">
              <Menu size={22} />
            </button>
            <div className="md:hidden truncate min-w-0">
               <h1 className="text-sm font-bold text-gray-900 truncate">{business.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 pointer-events-auto">
            {isTrial && userRole !== 'manager' && !showGlobalBlocker && (
              <Link href={`/${locale}/biznes/abonimi`} className={`hidden sm:flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-all group shadow-sm shrink-0 ${isGracePeriod ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 animate-pulse' : 'bg-amber-50 hover:bg-amber-100 border-amber-200'} border`}>
                {isGracePeriod ? <AlertTriangle size={16} className="text-red-500 group-hover:scale-110 transition-transform" /> : <AlertCircle size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] md:text-xs font-bold whitespace-nowrap hidden md:block ${isGracePeriod ? 'text-red-700' : 'text-amber-700'}`}>
                    {daysRemaining > 0 ? `${daysRemaining} ${uiTranslations.trialDays || "ditë provë"}` : (daysRemaining === 0 ? "Skadon Sot" : "I Skaduar")}
                  </span>
                  <span className={`text-[10px] md:text-xs font-black uppercase tracking-tight whitespace-nowrap ${isGracePeriod ? 'text-red-600' : 'text-amber-600'}`}>Rinovo Abonimin</span>
                </div>
              </Link>
            )}
            {userRole !== 'manager' && (
              <Link href={`/${locale}/recepsioni`} className="hidden sm:flex items-center gap-2 text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-colors shadow-sm shrink-0" title="Hap pamjen e Recepsionit">
                <Monitor size={18} /> <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Recepsioni</span>
              </Link>
            )}
            {userRole !== 'manager' && <div className="h-6 w-px bg-gray-200 hidden sm:block shrink-0"></div>}
            
            {pendingCount > 0 && !showGlobalBlocker && (
              <Link href={`/${locale}/biznes/rezervimet?filter=pending`} className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 px-3 py-1.5 md:px-3 md:py-1.5 rounded-xl transition-all shadow-sm shrink-0 group animate-in fade-in" title="Kërkesa në pritje nga recepsioni">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider hidden sm:block">{pendingCount} Në Pritje</span>
              </Link>
            )}

            <div className="relative shrink-0" ref={notifRef}>
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} disabled={showGlobalBlocker} className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-colors border ${isNotifOpen ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-100 text-gray-600'} disabled:opacity-50`}>
                <Bell size={18} className={`sm:w-5 sm:h-5 ${notifications.length > 0 && !isNotifOpen ? 'animate-bounce' : ''}`} />
                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-[300px] max-w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-3 animate-in slide-in-from-top-2 z-[9999] origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center mb-1">
                    <p className="text-sm sm:text-base font-extrabold text-gray-900">{uiTranslations.notifTitle || "Njoftime"} ({notifications.length})</p>
                  </div>
                  <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto custom-scrollbar relative">
                    {notifications.length > 0 ? (
                      notifications.map((notif: any, idx: number) => {
                        let icon = <Clock size={16} />;
                        let colorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
                        if (notif.type === "WARNING") { icon = <PenTool size={16} />; colorClass = "text-amber-600 bg-amber-50 border-amber-100"; } 
                        else if (notif.type === "DANGER") { icon = <Wallet size={16} />; colorClass = "text-red-600 bg-red-50 border-red-100"; } 
                        else if (notif.type === "TOMORROW") { icon = <CalendarDays size={16} />; colorClass = "text-blue-600 bg-blue-50 border-blue-100"; }
                        return (
                          <Link key={idx} href={`/${locale}${notif.link}`} onClick={() => setIsNotifOpen(false)} className="flex gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0 group">
                            <div className={`mt-1 shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center ${colorClass}`}>{icon}</div>
                            <div className="min-w-0">
                              <div className="flex items-start sm:items-center justify-between gap-2 mb-1">
                                <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{notif.title}</p>
                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 whitespace-nowrap bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 mt-0.5 sm:mt-0">{notif.time}</span>
                              </div>
                              <p className="text-[11px] sm:text-xs font-medium text-gray-500 leading-relaxed line-clamp-2">{notif.message}</p>
                            </div>
                          </Link>
                        )
                      })
                    ) : (
                      <div className="px-4 py-8 text-center flex flex-col items-center">
                        <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-inner"><Bell size={20} className="text-gray-300" /></div>
                        <p className="text-sm text-gray-500 font-medium">{uiTranslations.notifAllGood || "Gjithçka është në rregull!"}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{uiTranslations.notifNoNotifs || "Nuk keni asnjë njoftim për momentin."}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative shrink-0" ref={langRef}>
              <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-2 sm:py-1.5 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                <Globe size={18} className="text-gray-500 sm:w-4 sm:h-4" />
                <span className="text-xs font-bold text-gray-700 hidden sm:block uppercase ml-1.5">{currentLang.code}</span>
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-3 w-36 sm:w-40 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in slide-in-from-top-2 z-[9999]">
                  <p className="px-4 py-1.5 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{uiTranslations.langSystem || "Sistemi"}</p>
                  {GJUHET.map((g) => (
                    <button key={g.code} onClick={() => changeLanguage(g.code)} className={`w-full flex items-center gap-2 sm:gap-3 px-4 py-2 text-xs sm:text-sm transition-colors ${locale === g.code ? 'bg-indigo-50/50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'}`}>
                      <img src={`https://flagcdn.com/w20/${g.flag}.png`} alt={g.name} className="w-4 shadow-sm rounded-sm" />{g.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 hidden sm:block shrink-0"></div>

            <div className="relative shrink-0" ref={profileRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 p-1 sm:p-1.5 md:p-2 rounded-xl transition-colors focus:outline-none border border-transparent hover:border-gray-100">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-gray-900 leading-none truncate max-w-[120px]">{business.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{userRole === "manager" ? "Menaxher" : (uiTranslations.roleAdmin || "Administrator")}</p>
                </div>
                <div className="bg-white w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-sm hover:border-gray-300 transition-all shrink-0">
                  {business?.logo_url ? <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain p-1.5" /> : <span className="font-black text-gray-500 text-xs sm:text-sm tracking-widest uppercase">{business?.name?.substring(0, 2) || "B"}</span>}
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 sm:w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in slide-in-from-top-2 z-[9999]">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1 lg:hidden">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{business.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">{business.email}</p>
                  </div>
                  {userRole === 'manager' ? (
                    <Link href={`/${locale}/biznes/konfigurimet/profili`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"><Lock size={16} className="text-gray-400 shrink-0" /> <span className="truncate">Ndërro Fjalëkalimin</span></Link>
                  ) : (
                    <>
                      <Link href={`/${locale}/biznes/konfigurimet/profili`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"><Settings size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{uiTranslations.menuProfile || "Profili im"}</span></Link>
                      <Link href={`/${locale}/biznes/perdoruesit`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"><Users size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{uiTranslations.menuStaff || "Përdoruesit"}</span></Link>
                      <Link href={`/${locale}/biznes/banka`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"><Landmark size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{uiTranslations.menuBank || "Të dhënat bankare"}</span></Link>
                      <Link href={`/${locale}/biznes/abonimi`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"><Sparkles size={16} className="text-indigo-400 shrink-0" /> <span className="truncate">{uiTranslations.menuSub || "Abonimi im"}</span></Link>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <Link href={`/${locale}/biznes/konfigurimet/politika`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"><ShieldAlert size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{uiTranslations.menuPolicy || "Politika e anulimit"}</span></Link>
                      <Link href={`/${locale}/biznes/logfile`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"><FileText size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{uiTranslations.menuLogfile || "Historiku i sistemit"}</span></Link>
                    </>
                  )}
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button onClick={() => signOut({ callbackUrl: `/${locale}/login` })} className="w-full flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"><LogOut size={16} className="shrink-0" /> <span className="truncate">{uiTranslations.menuLogout || "Shkyçu"}</span></button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto w-full"> 
            {isGracePeriod && !isSafePage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
                 <div>
                    <h3 className="text-red-800 font-bold flex items-center gap-2"><AlertTriangle size={18} /> Kujdes: Abonimi juaj ka skaduar!</h3>
                    <p className="text-red-600 text-sm mt-1 font-medium">Sistemi juaj do të bllokohet plotësisht pas {3 + daysRemaining} ditësh. Ju lutem rinovoni për të mos humbur qasjen.</p>
                 </div>
                 <Link href={`/${locale}/biznes/abonimi`} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap shadow-sm">Rinovo Tani</Link>
              </div>
            )}
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}