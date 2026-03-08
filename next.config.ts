import createNextIntlPlugin from 'next-intl/plugin';

// Këtu i tregojmë saktësisht se ku e kemi lënë skedarin i18n
const withNextIntl = createNextIntlPlugin('./i18n.ts');

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* opsionet e tjera të konfigurimit nëse do kemi në të ardhmen */
};

export default withNextIntl(nextConfig);