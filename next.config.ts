import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

// Konfigurimi i i18n
const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  /* Opsionet për të anashkaluar gabimet gjatë Build-it */
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Kjo komandë më poshtë heq vijën e kuqe në VS Code
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);