"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, Building2, LifeBuoy, Users, CreditCard, 
  Settings, LogOut, Menu, X, Bell, Activity, BarChart3, Landmark, Megaphone, Banknote, FileText, ShieldCheck
} from "lucide-react";

export default function SuperadminLayoutUI({ user, locale, notifications, children }: any) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const pathname = usePathname();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
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

  // ZGJIDHJA BULLETPROOF: Konvertojmë ID-në në String gjithmonë para se të përdorim startsWith
  const ticketBadgeCount = notifications?.filter((n: any) => String(n.id).startsWith('ticket_')).length || 0;
  const paymentBadgeCount = notifications?.filter((n: any) => String(n.id).startsWith('pay_')).length || 0;

  const navItems = [
    { name: "Mission Control", href: `/${locale}/superadmin`, icon: LayoutDashboard },
    { name: "Bizneset", href: `/${locale}/superadmin/bizneset`, icon: Building2 },
    { name: "Raportet Financiare", href: `/${locale}/superadmin/raportet`, icon: BarChart3 },
    { name: "Kërkesat (Tickets)", href: `/${locale}/superadmin/ndihma`, icon: LifeBuoy, badge: ticketBadgeCount },
    { name: "Paketat (Abonimet)", href: `/${locale}/superadmin/paketat`, icon: CreditCard },
    { name: "Aprovimi i Pagesave", href: `/${locale}/superadmin/pagesat`, icon: Banknote, badge: paymentBadgeCount },
  ];

  const systemItems = [
    { name: "Stafi i Platformës", href: `/${locale}/superadmin/perdoruesit`, icon: Users },
    { name: "Llogaritë Bankare", href: `/${locale}/superadmin/banka`, icon: Landmark },
    { name: "Audit Logs", href: `/${locale}/superadmin/logs`, icon: FileText }, 
    { name: "Konfigurimet", href: `/${locale}/superadmin/konfigurimet`, icon: Settings },
    { name: "Njoftimet Globale", href: `/${locale}/superadmin/njoftimet`, icon: Megaphone },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden font-sans w-full relative">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[110] flex flex-col bg-[#0F172A] border-r border-slate-800 shadow-2xl transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 w-64 shrink-0
      `}>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute right-4 top-6 text-slate-400 hover:text-white bg-slate-800 rounded-full p-2"
        >
          <X size={20} />
        </button>

        <div className="h-16 md:h-20 flex items-center px-6 border-b border-slate-800/50 shrink-0">
          <Link href={`/${locale}/superadmin`} className="flex items-center">
             <img src="/logo.svg" alt="Logo" className="h-7 w-auto object-contain block md:hidden" />
             <img src="/logo.svg" alt="Logo" className="h-8 w-auto object-contain hidden md:block filter invert brightness-0" />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1.5 px-3 custom-scrollbar">
          
          <div className="mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider px-3">Menaxhimi</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex justify-between items-center rounded-xl px-3 py-2.5 transition-all font-medium group
                  ${isActive ? 'bg-indigo-600/10 text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                `}
              >
                <div className="flex items-center gap-3 truncate">
                  <item.icon size={20} className={isActive ? "text-indigo-500 shrink-0" : "text-slate-500 group-hover:text-slate-300 shrink-0"} />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ml-2">{item.badge}</span>
                )}
              </Link>
            )
          })}
          
          <div className="mt-8 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider px-3">Sistemi</div>
          {systemItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center rounded-xl px-3 py-2.5 gap-3 transition-all font-medium group
                  ${isActive ? 'bg-indigo-600/10 text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                `}
              >
                <item.icon size={20} className={isActive ? "text-indigo-500 shrink-0" : "text-slate-500 group-hover:text-slate-300 shrink-0"} />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}

        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-full relative min-w-0">
        
        <header className="h-16 md:h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 z-[60] sticky top-0 w-full shadow-sm shrink-0">
          
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-600 p-2 bg-gray-100 rounded-xl shrink-0">
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shrink-0">
              <Activity size={16} className="animate-pulse" /> <span className="hidden md:block">Server Status: Optimal</span>
            </div>
            <div className="md:hidden truncate min-w-0 flex items-center gap-2">
               <img src="/icon-512x512.png" alt="Icon" className="w-6 h-6 object-contain rounded" />
               <h1 className="text-sm font-bold text-gray-900 truncate">Sistemi Qendror</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            <div className="relative shrink-0" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-200 text-gray-600 transition-all"
              >
                <Bell size={18} className="sm:w-5 sm:h-5" />
                {notifications?.length > 0 && <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>}
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-[300px] max-w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 animate-in slide-in-from-top-2 z-[99] origin-top-right">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Kërkesa në pritje</h3>
                  <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {notifications?.map((n: any) => (
                      <Link key={n.id} href={n.link} onClick={() => setIsNotifOpen(false)} className="block p-3 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-100 mb-1 transition-all">
                        <p className="font-bold text-amber-700 text-xs sm:text-sm truncate">{n.title}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                      </Link>
                    ))}
                    {(!notifications || notifications.length === 0) && <p className="text-xs sm:text-sm text-gray-400 text-center py-4">Nuk ka asnjë kërkesë të re.</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            <div className="relative shrink-0" ref={profileRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 p-1 sm:p-1.5 rounded-xl border border-transparent hover:border-gray-100 transition-colors">
                <div className="text-right hidden sm:block max-w-[120px]">
                  <p className="text-sm font-bold text-gray-900 truncate leading-none">{user?.full_name || "Superadmin"}</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-1 truncate">{user?.role === 'support' ? 'Support' : 'Admin'}</p>
                </div>
                <div className="bg-[#0F172A] w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md overflow-hidden border-2 border-[#0F172A]">
                  <img src="/icon-512x512.png" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 sm:w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 animate-in slide-in-from-top-2 z-[99] origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1 sm:hidden">
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.full_name || "Superadmin"}</p>
                  </div>
                  <button onClick={() => signOut({ callbackUrl: `/${locale}/login` })} className="w-full flex items-center gap-3 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={16} className="shrink-0" /> <span className="truncate">Dil nga sistemi</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-4 md:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}