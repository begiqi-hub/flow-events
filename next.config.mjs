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
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: true, 
});

// ==========================================
// 3. Konfigurimi Kryesor i Next.js
// ==========================================
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Formati i pavarur i optimizuar për serverat VPS si Hostinger */
  output: 'standalone', 
  
  /* KUJDES: Kjo injoron gabimet e TypeScript gjatë kompilimit. */
  typescript: {
    ignoreBuildErrors: true,
  },
  
  /* Lejimi i imazheve të jashtme për komponentin <Image /> */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

// ==========================================
// 4. Eksportimi përfundimtar
// ==========================================
export default withSerwist(withNextIntl(nextConfig));