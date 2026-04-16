import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';

// 1. Gjuhët që mbështesim
const supportedLocales = ['sq', 'en', 'mk', 'cg', 'el'];
const defaultLocale = 'sq';

const handleI18nRouting = createMiddleware({
  locales: supportedLocales,
  defaultLocale: defaultLocale,
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ==========================================
  // HAPI 1: DETEKTIMI I GJUHËS PËR LANDING PAGE
  // ==========================================
  if (pathname === '/') {
    // Kapim shtetin nga IP (Funksionon kur hostohet në Vercel)
    const country = request.geo?.country || ''; 
    let targetLocale = defaultLocale; // Baza: Shqip

    // Zgjedhim gjuhën sipas shtetit (mund t'i shtosh/heqësh si të duash)
    if (['GR', 'CY'].includes(country)) {
      targetLocale = 'el'; // Greqi, Qipro -> Greqisht
    } else if (['US', 'GB', 'CA', 'AU'].includes(country)) {
      targetLocale = 'en'; // Anglisht
    } else if (['MK'].includes(country)) {
      targetLocale = 'mk'; // Maqedoni -> Maqedonisht
    } else if (['ME'].includes(country)) {
      targetLocale = 'cg'; // Mali i Zi -> Malazezisht
    } 
    // Për AL (Shqipëri) dhe XK (Kosovë) ngel 'sq' automatikisht.

    // E dërgojmë te gjuha e tij
    return NextResponse.redirect(new URL(`/${targetLocale}`, request.url));
  }


  // ==========================================
  // HAPI 2: KONTROLLI I SIGURISË & ROLEVE (Kodi yt)
  // ==========================================
  const isProtectedPath = pathname.includes('/biznes') || pathname.includes('/recepsioni');

  if (isProtectedPath) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    let currentLocale = pathname.split('/')[1];
    if (!supportedLocales.includes(currentLocale)) {
      currentLocale = defaultLocale;
    }

    // Nëse nuk është i loguar, e çojmë te logini
    if (!token) {
      return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
    }

    const role = token.role as string;

    // RREGULLI I RECEPSIONIT
    if (role === 'reception') {
      if (pathname.includes('/recepsioni') || pathname.includes('/biznes/konfigurimet/profili')) {
        return handleI18nRouting(request); 
      }
      return NextResponse.redirect(new URL(`/${currentLocale}/recepsioni`, request.url));
    }

    // RREGULLI I MENAXHERIT
    if (role === 'manager') {
      const isForbidden = pathname.includes('/financa') || 
                          pathname.includes('/perdoruesit') || 
                          pathname.includes('/stafi') || 
                          pathname.includes('/banka') || 
                          pathname.includes('/abonimi') || 
                          pathname.includes('/logfile') || 
                          (pathname.includes('/konfigurime') && !pathname.includes('/konfigurimet/profili'));
      
      if (isForbidden) {
        if (pathname !== `/${currentLocale}/biznes`) {
          return NextResponse.redirect(new URL(`/${currentLocale}/biznes`, request.url));
        }
      }
    }
  }

  // Për gjithçka tjetër (Admin, vizitor i thjeshtë), vazhdo normalisht me next-intl
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};