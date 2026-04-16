import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

// ==========================================
// 1. Konfigurimi i PWA
// ==========================================
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // Nuk të bezdis gjatë kohës që bën kod
});

// ==========================================
// 2. Konfigurimi i i18n
// ==========================================
const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  /* Opsionet për të anashkaluar gabimet gjatë Build-it */
  typescript: {
    ignoreBuildErrors: true,
  },
  
};

// ==========================================
// 3. Bashkimi (PWA mbështjell i18n mbështjell Config)
// ==========================================
export default withPWA(withNextIntl(nextConfig));