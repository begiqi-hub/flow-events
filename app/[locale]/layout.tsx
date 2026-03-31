import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

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

// Shtojmë 'async' dhe ndryshojmë mënyrën si pranohen params
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Presim (await) parametrat për të marrë gjuhën (locale)
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body 
        suppressHydrationWarning 
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {/* Trupi i pastër: Paneli i Biznesit */}
        {children}
      </body>
    </html>
  );
}