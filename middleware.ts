import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Lista e gjuhëve tuaja
  locales: ['sq', 'en', 'mk', 'cg'],
  // Gjuha që hapet by default
  defaultLocale: 'sq'
});

export const config = {
  // Lejon middleware të kapë vetëm faqet vizuale dhe injoron API-të ose fotot
  matcher: ['/((?!api|_next|.*\\..*).*)']
};