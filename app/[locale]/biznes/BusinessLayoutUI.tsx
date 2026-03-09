"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, CalendarDays, ClipboardList, Users, BarChart3, 
  Building2, Utensils, Sparkles, UserCircle, ChevronLeft, ChevronRight,
  LogOut, Settings, Building, FileText, Menu, X, ShieldAlert, Calendar as CalendarIcon
} from "lucide-react";

export default function BusinessLayoutUI({ business, children }: { business: any, children: React.ReactNode }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const params = useParams();
  const locale = params.locale as string;
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: `/${locale}/biznes`, icon: LayoutDashboard },
    { name: "Kalendari", href: `/${locale}/biznes/kalendari`, icon: CalendarDays },
    { name: "Rezervimet", href: `/${locale}/biznes/rezervimet`, icon: ClipboardList },
    { name: "Klientët", href: `/${locale}/biznes/klientet`, icon: Users },
    { name: "Raportet", href: `/${locale}/biznes/raportet`, icon: BarChart3 },
  ];

  const configItems = [
    { name: "Sallat", href: `/${locale}/biznes/sallat`, icon: Building2 },
    { name: "Menutë", href: `/${locale}/biznes/menut`, icon: Utensils },
    { name: "Ekstrat", href: `/${locale}/biznes/ekstra`, icon: Sparkles },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-100 shadow-2xl md:shadow-sm transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 
        ${isMinimized ? 'md:w-20' : 'md:w-64'} 
        w-64
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

        <div className={`h-20 flex items-center ${isMinimized ? 'md:justify-center md:px-0' : ''} px-6 border-b border-gray-50 transition-all`}>
          <div className="bg-gray-900 text-white p-2 rounded-xl shadow-md shrink-0">
            <Sparkles size={24} className={isMinimized ? "md:w-5 md:h-5" : ""} />
          </div>
          <div className={`ml-3 overflow-hidden whitespace-nowrap ${isMinimized ? 'md:hidden block' : 'block'}`}>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">Flow Events</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">Menaxhimi i Eventeve</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1.5 px-3">
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
            <span className={isMinimized ? 'md:hidden block' : 'block'}>Konfigurimet</span>
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
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-colors"
            >
              <Menu size={22} />
            </button>
          </div>
          
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 p-1.5 md:p-2 rounded-xl transition-colors focus:outline-none"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{business.name}</p>
                <p className="text-xs text-gray-500 mt-1">Administrator</p>
              </div>
              <div className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                <UserCircle size={24} className="md:w-6 md:h-6" />
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in slide-in-from-top-2 z-50">
                <div className="px-4 py-3 border-b border-gray-50 mb-1 md:hidden">
                  <p className="text-sm font-bold text-gray-900 truncate">{business.name}</p>
                  <p className="text-xs text-gray-500 truncate">{business.email}</p>
                </div>
                
                <Link href={`/${locale}/biznes/konfigurimet/profili`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <Settings size={16} className="text-gray-400" /> Profili i Biznesit
                </Link>
                <Link href={`/${locale}/biznes/perdoruesit`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <Users size={16} className="text-gray-400" /> Përdoruesit
                </Link>
                <Link href={`/${locale}/biznes/banka`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <Building size={16} className="text-gray-400" /> Banka
                </Link>
                
                {/* JA KU ËSHTË SHTUAR POLITIKA E ANULIMIT */}
                <Link href={`/${locale}/biznes/konfigurimet/politika`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors border-b border-gray-100 pb-3 mb-1">
                  <ShieldAlert size={16} className="text-gray-400" /> Politika e Anulimit
                </Link>
                
                <Link href={`/${locale}/biznes/logfile`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <FileText size={16} className="text-gray-400" /> Logfile
                </Link>
                
                <div className="h-px bg-gray-100 my-1"></div>
                
                <button 
                  onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Dil nga sistemi
                </button>
              </div>
            )}
          </div>

        </header>

        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
        
      </div>
    </div>
  );
}