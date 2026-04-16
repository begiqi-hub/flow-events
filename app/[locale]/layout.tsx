import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// 1. IMPORTUAM PROVIDER-IN E GJUHËS DHE FUNKSIONIN PËR TË MARRË MESAZHET
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
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
  title: "HALLEVO | Menaxhimi i Eventeve",
  description: "Sistemi kryesor për menaxhimin e sallave dhe rezervimeve",
  manifest: "/manifest.json", 
};

export const viewport: Viewport = {
  themeColor: "#4f46e5", 
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 2. MARRIM TË GJITHA PËRKTHIMET (JSON) NGA SERVERI
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body 
        suppressHydrationWarning 
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {/* 3. MBËSHTJELLIM APLIKACIONIN QË TË GJITHË KOMPONENTËT TË KANË AKSES TE GJUHA */}
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}