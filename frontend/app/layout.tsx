import type { Metadata } from 'next';
import { Bebas_Neue, Oswald } from 'next/font/google';
import { Suspense } from 'react';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import { getSite } from '@/lib/api.server';
import '@/styles/css/app.css';

const oswald = Oswald({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-title',
});

export const metadata: Metadata = {
  title: 'B.back',
  description: 'B.back restaurant website.',
};

export const revalidate = 120;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <DeferredSiteScripts />
        </Suspense>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}

async function DeferredSiteScripts() {
  const site = await getSite().catch(() => null);
  const gtmIds = site?.seo?.gtm_container_ids ?? [];
  const customHeadHtml = site?.seo?.custom_head_script ?? null;
  const customBodyHtml = site?.seo?.custom_body_script ?? null;

  return (
    <>
      {gtmIds.map((id) => (
        <script
          key={id}
          id={`gtm-head-${id}`}
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${escapeJavaScriptString(id)}');`,
          }}
        />
      ))}
      {customHeadHtml ? <HtmlInjector id="custom-head-html" target="head" html={customHeadHtml} /> : null}
      {gtmIds.map((id) => (
        <noscript key={id}>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      ))}
      {customBodyHtml ? <HtmlInjector id="custom-body-html" target="body" html={customBodyHtml} /> : null}
    </>
  );
}

function HtmlInjector({ id, target, html }: { id: string; target: 'head' | 'body'; html: string }) {
  return (
    <script
      id={id}
      dangerouslySetInnerHTML={{
        __html: `document.${target}.insertAdjacentHTML('beforeend', ${safeHtmlForScript(html)});`,
      }}
    />
  );
}

function safeHtmlForScript(html: string): string {
  return JSON.stringify(html).replace(/<\/script/gi, '<\\/script');
}

function escapeJavaScriptString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
