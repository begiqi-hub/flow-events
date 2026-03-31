"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, Building2, LifeBuoy, Users, CreditCard, 
  Settings, LogOut, Menu, X, Bell, UserCircle, ShieldCheck, 
  FileText, Activity, BarChart3, Landmark, Megaphone, Banknote 
} from "lucide-react";

export default function SuperadminLayoutUI({ user, locale, notifications, children }: any) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const pathname = usePathname();

  // 1. Grupi i Menaxhimit (Shtuam Raportet)
  const navItems = [
    { name: "Mission Control", href: `/${locale}/superadmin`, icon: LayoutDashboard },
    { name: "Bizneset", href: `/${locale}/superadmin/bizneset`, icon: Building2 },
    { name: "Raportet Financiare", href: `/${locale}/superadmin/raportet`, icon: BarChart3 },
    { name: "Kërkesat (Tickets)", href: `/${locale}/superadmin/ndihma`, icon: LifeBuoy, badge: notifications.length },
    { name: "Paketat (Abonimet)", href: `/${locale}/superadmin/paketat`, icon: CreditCard },
    { name: "Aprovimi i Pagesave", href: `/${locale}/superadmin/pagesat`, icon: Banknote },
    
  ];

  // 2. Grupi i Sistemit (Shtuam Bankën)
  const systemItems = [
    { name: "Stafi i Platformës", href: `/${locale}/superadmin/perdoruesit`, icon: Users },
    { name: "Llogaritë Bankare", href: `/${locale}/superadmin/banka`, icon: Landmark },
    { name: "Audit Logs", href: `/${locale}/superadmin/logs`, icon: FileText },
    { name: "Konfigurimet", href: `/${locale}/superadmin/konfigurimet`, icon: Settings },
    { name: "Njoftimet Globale", href: `/${locale}/superadmin/njoftimet`, icon: Megaphone },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden font-sans">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[110] flex flex-col bg-[#0F172A] border-r border-slate-800 shadow-2xl transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 w-64
      `}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="ml-3 overflow-hidden whitespace-nowrap">
            <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">Flow Superadmin</h1>
            <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider mt-0.5">Sistemi Qendror</p>
          </div>
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
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={isActive ? "text-indigo-500" : "text-slate-500 group-hover:text-slate-300"} />
                  <span>{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{item.badge}</span>
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
                <item.icon size={20} className={isActive ? "text-indigo-500" : "text-slate-500 group-hover:text-slate-300 shrink-0"} />
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            )
          })}

        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* TOPBAR */}
        <header className="h-16 md:h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 z-[60] sticky top-0 w-full shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-600 p-2 bg-gray-100 rounded-xl">
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <Activity size={16} className="animate-pulse" /> Server Status: Optimal
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-200 text-gray-600 transition-all"
              >
                <Bell size={20} />
                {notifications.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 animate-in slide-in-from-top-2 z-[99]">
                  <h3 className="font-bold text-gray-900 mb-2">Kërkesa në pritje</h3>
                  {notifications.map((n: any) => (
                    <Link key={n.id} href={n.link} className="block p-3 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-100 mb-1 transition-all">
                      <p className="font-bold text-amber-700 text-sm">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                    </Link>
                  ))}
                  {notifications.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nuk ka asnjë kërkesë të re.</p>}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200"></div>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-xl border border-transparent hover:border-gray-100 transition-colors">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Superadmin</p>
                </div>
                <div className="bg-[#0F172A] p-2 rounded-full text-white shadow-md">
                  <UserCircle size={20} />
                </div>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 animate-in slide-in-from-top-2 z-[99]">
                  <button onClick={() => signOut({ callbackUrl: `/${locale}/login` })} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={16} /> Dil nga sistemi
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        
      </div>
    </div>
  );
}