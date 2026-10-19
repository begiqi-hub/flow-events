'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, Suspense } from 'react';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Funksioni për të dërguar eventin bazë
const pageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

function PixelEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ekzekutohet në ngarkimin e parë dhe sa herë që ndryshon URL (Routimi i brendshëm)
    pageview();
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  if (!FB_PIXEL_ID) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
          `,
        }}
      />
      {/* Përdorimi i Suspense është i detyrueshëm për të mos bllokuar Static Generation (SSG) nga useSearchParams */}
      <Suspense fallback={null}>
        <PixelEvents />
      </Suspense>
    </>
  );
}