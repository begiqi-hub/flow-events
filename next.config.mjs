import createNextIntlPlugin from 'next-intl/plugin';

// ==========================================
// 1. Konfigurimi i i18n
// ==========================================
const withNextIntl = createNextIntlPlugin('./i18n.ts');

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
// 2. Eksportimi përfundimtar (Pa PWA)
// ==========================================
export default withNextIntl(nextConfig);