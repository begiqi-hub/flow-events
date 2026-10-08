import createNextIntlPlugin from 'next-intl/plugin';
// 1. ÇAKTIVIZUAR: Importi i PWA është komentuar
// import withPWAInit from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

// ==========================================
// 1. Konfigurimi i PWA (I KOMENTUAR PËR TESTIM)
// ==========================================
/*
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
});
*/

// ==========================================
// 2. Konfigurimi i i18n
// ==========================================
const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  /* Opsionet për të anashkaluar gabimet gjatë Build-it */
  typescript: {
    ignoreBuildErrors: true,
  },
  
  /* 
    Shtimi thelbësor për Hostinger: 
    Krijon një version të pavarur të serverit që nuk varet nga Vercel 
  */
  output: 'standalone', 
};

// ==========================================
// 3. Bashkimi (Eksportojmë VETËM i18n + Config)
// ==========================================
// 2. ÇAKTIVIZUAR: Kemi hequr withPWA() nga mbështjellësi
export default withNextIntl(nextConfig);