import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
// Importojmë ikonat e pastra nga lucide-react
import { Building2, Layers, Users, CalendarDays, UserCircle } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flow Events | Menaxhimi i Eventeve",
  description: "Sistemi kryesor për menaxhimin e sallave dhe rezervimeve",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}
      >
        {/* MENUJA GLOBALE PROFESIONALE */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-gray-900 text-white p-1.5 rounded-lg">
                <CalendarDays size={22} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">FLOW</span>
              <span className="text-2xl font-medium text-gray-500 tracking-tight">EVENTS</span>
            </div>
            
            {/* Navigimi Qendror me Ikona */}
            <nav className="hidden md:flex gap-2">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Building2 size={18} strokeWidth={2} />
                Bizneset
              </Link>
              
              <Link 
                href="/halls" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Layers size={18} strokeWidth={2} />
                Sallat
              </Link>
              
              <Link 
                href="/clients" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Users size={18} strokeWidth={2} />
                Klientët
              </Link>
              
              <Link 
                href="/bookings" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <CalendarDays size={18} strokeWidth={2} />
                Rezervimet
              </Link>
            </nav>
            
            {/* Profili i Përdoruesit */}
            <div className="flex items-center gap-3">
              <button className="text-gray-400 hover:text-gray-700 transition-colors">
                <UserCircle size={30} strokeWidth={1.5} />
              </button>
            </div>

          </div>
        </header>

        {/* PJESA KU SHFAQEN FAQET */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
          {children}
        </main>

      </body>
    </html>
  );
}