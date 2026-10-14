import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from '@serwist/next';

// ==========================================
// 1. Konfigurimi i i18n
// ==========================================
const withNextIntl = createNextIntlPlugin('./i18n.ts');

// ==========================================
// 2. Konfigurimi i Serwist (PWA)
// ==========================================
const withSerwist = withSerwistInit({
  // Sigurohu që ky skedar ekziston (ndrysho në 'src/app/sw.ts' nëse përdor src/)
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // Çaktivizon PWA-në gjatë zhvillimit lokal për të mos ndërhyrë me cache-in
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Opsionet për të anashkaluar gabimet gjatë Build-it */
  typescript: {
    ignoreBuildErrors: true,
  },
  
  /* Formati i pavarur për Hostinger */
  output: 'standalone', 
};

// ==========================================
// 3. Eksportimi përfundimtar (PWA + i18n)
// ==========================================
export default withSerwist(withNextIntl(nextConfig));