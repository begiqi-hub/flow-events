import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: "HALLEVO | Menaxhimi i Eventeve",
    description: "Sistemi kryesor për menaxhimin e sallave dhe rezervimeve",
    manifest: "/manifest.json",
    openGraph: {
      title: "HALLEVO",
      description: "Sistemi kryesor për menaxhimin e sallave dhe rezervimeve",
      url: `https://hallevo.com/${locale}`,
      siteName: "Hallevo",
      images: [
        {
          url: "https://hallevo.com/og-image.png",
          width: 1200,
          height: 630,
          alt: "HALLEVO - Menaxhimi i Eventeve",
        },
      ],
      locale: locale === 'sq' ? 'sq_AL' : 'en_US',
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "HALLEVO",
      description: "Sistemi kryesor për menaxhimin e sallave dhe rezervimeve",
      images: ["https://hallevo.com/og-image.png"],
    },
  };
}

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

  // 1. Aktivizimi i kërkuar nga next-intl për App Router (statike dhe dinamike)
  setRequestLocale(locale);

  // 2. Marrja e mesazheve duke kaluar specifikisht lokalin
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body 
        suppressHydrationWarning 
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}