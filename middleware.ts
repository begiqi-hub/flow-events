import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Shtuam 'el' (Greqisht)
  locales: ['sq', 'en', 'mk', 'cg', 'el'],
  defaultLocale: 'sq'
});

export const config = {
  // Lejon middleware të kapë vetëm faqet vizuale dhe injoron API-të ose fotot
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
