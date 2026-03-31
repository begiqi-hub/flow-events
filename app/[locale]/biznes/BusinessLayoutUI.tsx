"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl"; 
import { 
  LayoutDashboard, CalendarDays, ClipboardList, Users, BarChart3, 
  Building2, Utensils, Sparkles, UserCircle, ChevronLeft, ChevronRight,
  LogOut, Settings, Building, FileText, Menu, X, ShieldAlert, Landmark, AlertCircle, Globe,
  TrendingUp, Bell, Clock, Wallet, PenTool,
  LifeBuoy, Monitor 
} from "lucide-react";

const GJUHET = [
  { code: "sq", name: "Shqip", flag: "al" },
  { code: "en", name: "English", flag: "gb" },
  { code: "mk", name: "Македонски", flag: "mk" },
  { code: "cg", name: "Crnogorski", flag: "me" },
  { code: "el", name: "Ελληνικά", flag: "gr" }
];

export default function BusinessLayoutUI({ business, notifications = [], children }: { business: any, notifications?: any[], children: React.ReactNode }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const params = useParams();
  const locale = (params?.locale as string) || "sq";
  const pathname = usePathname();
  const router = useRouter();

  const t = useTranslations("Sidebar");
  const tNotif = useTranslations("Notifications"); 
  
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null); 

  const currentLang = GJUHET.find(g => g.code === locale) || GJUHET[0];

  const trialEndDate = business.trialEndsAt ? new Date(business.trialEndsAt) : null;
  const today = new Date();
  let daysRemaining = 0;
  if (trialEndDate) {
    const diffTime = trialEndDate.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  const isTrial = business.status !== 'active';

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
    { name: t("dashboard"), href: `/${locale}/biznes`, icon: LayoutDashboard },
    { name: t("calendar"), href: `/${locale}/biznes/kalendari`, icon: CalendarDays },
    { name: t("bookings"), href: `/${locale}/biznes/rezervimet`, icon: ClipboardList },
    { name: "Ofertat", href: `/${locale}/biznes/ofertat`, icon: FileText }, 
    { name: t("clients"), href: `/${locale}/biznes/klientet`, icon: Users },
  ];

  const reportItems = [
    { name: t("reports"), href: `/${locale}/biznes/raportet`, icon: BarChart3 },
    { name: t("performanca"), href: `/${locale}/biznes/raportet/stafi/performanca`, icon: TrendingUp }, 
  ];

  const configItems = [
    { name: t("halls"), href: `/${locale}/biznes/sallat`, icon: Building2 },
    { name: t("menus"), href: `/${locale}/biznes/menut`, icon: Utensils },
    { name: t("extras"), href: `/${locale}/biznes/ekstra`, icon: Sparkles },
  ];

  const supportItems = [
    { name: "Ndihma", href: `/${locale}/biznes/ndihma`, icon: LifeBuoy }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden w-full relative">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] flex flex-col bg-white border-r border-gray-100 shadow-2xl md:shadow-sm transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 
        ${isMinimized ? 'md:w-20' : 'md:w-64'} 
        w-64 shrink-0
      `}>
        
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute right-4 top-6 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full p-2"
        >
          <X size={20} />
        </button>

        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="hidden md:flex absolute -right-3 top-8 bg-white border border-gray-200 text-gray-500 rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors z-30"
        >
          {isMinimized ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`h-16 md:h-20 flex items-center ${isMinimized ? 'md:justify-center md:px-0' : ''} px-6 border-b border-gray-50 transition-all shrink-0`}>
          <div className="bg-gray-900 text-white p-2 rounded-xl shadow-md shrink-0">
            <Sparkles size={24} className={isMinimized ? "md:w-5 md:h-5" : ""} />
          </div>
          <div className={`ml-3 overflow-hidden ${isMinimized ? 'md:hidden block' : 'block'}`}>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none truncate">{t("brandName")}</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5 truncate">{t("brandDesc")}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1.5 px-3 custom-scrollbar">
          
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center rounded-xl transition-all font-medium group
                  ${isActive ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
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
            <span className={isMinimized ? 'md:hidden block' : 'block'}>{t("reports")}</span>
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

          <div className={`mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider ${isMinimized ? 'md:text-center px-3' : 'px-3'}`}>
            <span className={isMinimized ? 'md:hidden block' : 'block'}>{t("settings")}</span>
            <span className={`hidden ${isMinimized ? 'md:block' : ''}`}>•••</span>
          </div>
          
          {configItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center rounded-xl transition-all font-medium group
                  ${isActive ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
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

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
        
        {/* HEADER */}
        <header className="h-16 md:h-20 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 z-[60] sticky top-0 w-full shadow-sm shrink-0">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-colors shrink-0"
            >
              <Menu size={22} />
            </button>
            
            {/* Shfaqja e emrit në mobile kur sidebar është mbyllur, opcionale por e bukur */}
            <div className="md:hidden truncate min-w-0">
               <h1 className="text-sm font-bold text-gray-900 truncate">{business.name}</h1>
            </div>
          </div>
          
          {/* KONTROLLET E DJATHTA */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            
            {isTrial && (
              <Link 
                href={`/${locale}/biznes/abonimi`}
                className="hidden sm:flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-all group shadow-sm shrink-0"
              >
                <AlertCircle size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] md:text-xs font-bold text-amber-700 whitespace-nowrap hidden md:block">
                    {daysRemaining} {t("trialDays")}
                  </span>
                  <span className="text-[10px] md:text-xs font-black text-amber-600 uppercase tracking-tight whitespace-nowrap">
                    {t("subscribeBtn")}
                  </span>
                </div>
              </Link>
            )}

            <Link 
              href={`/${locale}/recepsioni`}
              className="hidden sm:flex items-center gap-2 text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-colors shadow-sm shrink-0"
              title="Hap pamjen e Recepsionit"
            >
              <Monitor size={18} />
              <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Recepsioni</span>
            </Link>

            <div className="h-6 w-px bg-gray-200 hidden sm:block shrink-0"></div>

            {/* NOTIFIKIMET */}
            <div className="relative shrink-0" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-colors border ${isNotifOpen ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-100 text-gray-600'}`}
              >
                <Bell size={18} className={`sm:w-5 sm:h-5 ${notifications.length > 0 && !isNotifOpen ? 'animate-bounce' : ''}`} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-[300px] max-w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-3 animate-in slide-in-from-top-2 z-[9999] origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center mb-1">
                    <p className="text-sm sm:text-base font-extrabold text-gray-900">{tNotif("title")} ({notifications.length})</p>
                  </div>
                  
                  <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto custom-scrollbar relative">
                    {notifications.length > 0 ? (
                      notifications.map((notif: any, idx: number) => {
                        let icon = <Clock size={16} />;
                        let colorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
                        
                        if (notif.type === "WARNING") {
                          icon = <PenTool size={16} />;
                          colorClass = "text-amber-600 bg-amber-50 border-amber-100";
                        } else if (notif.type === "DANGER") {
                          icon = <Wallet size={16} />;
                          colorClass = "text-red-600 bg-red-50 border-red-100";
                        } else if (notif.type === "TOMORROW") {
                          icon = <CalendarDays size={16} />;
                          colorClass = "text-blue-600 bg-blue-50 border-blue-100";
                        }

                        const finalHref = `/${locale}${notif.link}`;

                        return (
                          <Link 
                            key={idx}
                            href={finalHref} 
                            onClick={() => setIsNotifOpen(false)}
                            className="flex gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0 group"
                          >
                            <div className={`mt-1 shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center ${colorClass}`}>
                              {icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start sm:items-center justify-between gap-2 mb-1">
                                <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                                  {notif.title}
                                </p>
                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 whitespace-nowrap bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 mt-0.5 sm:mt-0">
                                  {notif.time}
                                </span>
                              </div>
                              <p className="text-[11px] sm:text-xs font-medium text-gray-500 leading-relaxed line-clamp-2">
                                {notif.message}
                              </p>
                            </div>
                          </Link>
                        )
                      })
                    ) : (
                      <div className="px-4 py-8 text-center flex flex-col items-center">
                        <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-inner">
                          <Bell size={20} className="text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{tNotif("allGood")}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{tNotif("noNotifs")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* GJUHA */}
            <div className="relative shrink-0" ref={langRef}>
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-2 sm:py-1.5 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
              >
                <Globe size={18} className="text-gray-500 sm:w-4 sm:h-4" />
                <span className="text-xs font-bold text-gray-700 hidden sm:block uppercase ml-1.5">{currentLang.code}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-3 w-36 sm:w-40 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in slide-in-from-top-2 z-[9999]">
                  <p className="px-4 py-1.5 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t("langSystem")}</p>
                  {GJUHET.map((g) => (
                    <button
                      key={g.code}
                      onClick={() => changeLanguage(g.code)}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-4 py-2 text-xs sm:text-sm transition-colors
                        ${locale === g.code ? 'bg-indigo-50/50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'}
                      `}
                    >
                      <img src={`https://flagcdn.com/w20/${g.flag}.png`} alt={g.name} className="w-4 shadow-sm rounded-sm" />
                      {g.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 hidden sm:block shrink-0"></div>

            {/* PROFILI */}
            <div className="relative shrink-0" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 p-1 sm:p-1.5 md:p-2 rounded-xl transition-colors focus:outline-none border border-transparent hover:border-gray-100"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-gray-900 leading-none truncate max-w-[120px]">{business.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{t("roleAdmin")}</p>
                </div>
                <div className="bg-gray-100 p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                  <UserCircle size={20} className="sm:w-5 sm:h-5" />
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 sm:w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in slide-in-from-top-2 z-[9999]">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1 lg:hidden">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{business.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">{business.email}</p>
                  </div>
                  
                  <Link href={`/${locale}/biznes/konfigurimet/profili`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <Settings size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{t("menuProfile")}</span>
                  </Link>
                  <Link href={`/${locale}/biznes/perdoruesit`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <Users size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{t("menuStaff")}</span>
                  </Link>
                  <Link href={`/${locale}/biznes/banka`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <Landmark size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{t("menuBank")}</span>
                  </Link>
                  <Link href={`/${locale}/biznes/abonimi`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <Sparkles size={16} className="text-indigo-400 shrink-0" /> <span className="truncate">{t("menuSub")}</span>
                  </Link>
                  
                  <div className="h-px bg-gray-100 my-1"></div>

                  <Link href={`/${locale}/biznes/konfigurimet/politika`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <ShieldAlert size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{t("menuPolicy")}</span>
                  </Link>
                  
                  <Link href={`/${locale}/biznes/logfile`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <FileText size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{t("menuLogfile")}</span>
                  </Link>
                  
                  <div className="h-px bg-gray-100 my-1"></div>
                  
                  <button 
                    onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                    className="w-full flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} className="shrink-0" /> <span className="truncate">{t("menuLogout")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto relative p-4 md:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}