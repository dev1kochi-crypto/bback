import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { absoluteAssetUrl, defaultSitePayload } from '@/lib/api';
import { getSite } from '@/lib/api.server';
import { siteAssets } from '@/lib/assets';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Thank You | B.back',
  description: 'Thank you for contacting B.back.',
};

export default async function ThankYouPage() {
  const site = await getSite().catch(() => defaultSitePayload);
  const headerBg = absoluteAssetUrl(siteAssets.headerBackground) ?? siteAssets.headerBackground;
  const panelBg = absoluteAssetUrl(siteAssets.pageBannerBackground) ?? siteAssets.pageBannerBackground;
  const logo = absoluteAssetUrl(site.logo ?? '/app/images/logo.svg') ?? '/app/images/logo.svg';

  return (
    <>
      <SiteHeader site={site} hideDesktopLogo />
      <section className="relative h-[150px] overflow-hidden bg-[#070b0c] text-white sm:h-[160px] lg:h-[178px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${headerBg})` }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto flex h-full max-w-[1500px] justify-center px-5 sm:px-8 lg:px-12">
          <div
            className="flex h-full w-[260px] items-start justify-center bg-cover bg-center bg-no-repeat px-8 pt-5 sm:w-[300px] lg:w-[340px]"
            style={{ backgroundImage: `url(${panelBg})` }}
          >
            <Link href="/" className="inline-flex">
              <Image
                src={logo}
                alt={site.logo_alt ?? 'B.back'}
                width={220}
                height={95}
                priority
                className="h-[70px] w-auto object-contain sm:h-[80px]"
              />
            </Link>
          </div>
        </div>
      </section>

      <main className="relative overflow-hidden bg-black px-6 py-16 text-white sm:px-10 lg:px-16">
        <section className="relative mx-auto flex min-h-[390px] max-w-[1180px] flex-col items-center justify-center text-center sm:min-h-[455px]">
          <h1 aria-hidden className="pointer-events-none absolute left-1/2 top-[43%] w-full -translate-x-1/2 -translate-y-1/2 select-none font-display text-[86px] font-black uppercase leading-none text-white/[0.13] sm:text-[145px] lg:text-[170px]">
            Thank You
          </h1>
          <Image
            src="/app/images/Isolation_Mode.png"
            alt=""
            width={170}
            height={140}
            priority
            className="relative z-[2] h-[76px] w-auto object-contain sm:h-[94px]"
          />
          <p className="relative z-[2] mt-7 font-display text-[16px] font-normal leading-relaxed text-white/70 sm:text-[18px]">
            Your submission has been received.
            <br />
            We will be in touch and contact you soon!
          </p>
          <Link href="/" className="relative z-[2] mt-7 inline-flex h-9 items-center justify-center bg-ember px-5 font-display text-[12px] font-bold uppercase text-white transition hover:brightness-110">
            Back To Home Page
          </Link>
        </section>
      </main>
      <SiteFooter site={site} />
    </>
  );
}
