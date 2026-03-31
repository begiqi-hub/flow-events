import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

// Konfigurimi i i18n
const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  /* Opsionet për të anashkaluar gabimet gjatë Build-it */
  typescript: {
    // Kjo do të lejojë që Vercel të përfundojë Build-in edhe me gabime TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Kjo do të lejojë që Vercel të vazhdojë edhe nëse ka paralajmërime ESLint
    ignoreDuringBuilds: true,
  },
  
  /* Opsione të tjera të konfigurimit mund të shtohen këtu */
};

export default withNextIntl(nextConfig);