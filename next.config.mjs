import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from '@serwist/next';

// ==========================================
// 1. Konfigurimi i i18n (Shumëgjuhësia)
// ==========================================
const withNextIntl = createNextIntlPlugin('./i18n.ts');

// ==========================================
// 2. Konfigurimi i Serwist (PWA)
// ==========================================
const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // Çaktivizon PWA-në gjatë zhvillimit për të evituar bllokimin e portit 3000
  disable: process.env.NODE_ENV === 'development',
  // Shton mbështetje më të mirë për rifreskimin e aplikacionit kur rikthehet interneti
  reloadOnOnline: true, 
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Formati i pavarur i optimizuar për serverat VPS si Hostinger */
  output: 'standalone', 
  
  /* KUJDES: Kjo injoron gabimet e TypeScript gjatë kompilimit. */
  typescript: {
    ignoreBuildErrors: true,
  },
  
  /* Shtohet për të parandaluar bllokimet nga paralajmërimet e ESLint gjatë Build-it */
  eslint: {
    ignoreDuringBuilds: true,
  }
};

// ==========================================
// 3. Eksportimi përfundimtar
// ==========================================
export default withSerwist(withNextIntl(nextConfig));