import { absoluteAssetUrl } from '@/lib/api';
import { siteAssets } from '@/lib/assets';
import type { SitePayload } from '@/types/site';
import { AnimatedPageTitle } from '@/components/layout/AnimatedPageTitle';
import Image from 'next/image';
import Link from 'next/link';

interface PageBannerProps {
  site: SitePayload;
  title: string;
}

export function PageBanner({ site, title }: PageBannerProps) {
  const headerBg = absoluteAssetUrl(siteAssets.headerBackground) ?? siteAssets.headerBackground;
  const panelBg = absoluteAssetUrl(siteAssets.pageBannerBackground) ?? siteAssets.pageBannerBackground;
  const logo = absoluteAssetUrl(site.logo ?? '/app/images/logo.svg') ?? '/app/images/logo.svg';

  return (
    <section className="page-banner">
      <div
        className="page-banner__background"
        style={{ backgroundImage: `url(${headerBg})` }}
      />
      <div className="page-banner__shade" />

      <div className="page-banner__inner">
        <div
          className="page-banner__panel"
          style={{ backgroundImage: `url(${panelBg})` }}
        >
          <Link href="/" className="page-banner__logo">
            <Image
              src={logo}
              alt={site.logo_alt ?? 'B.back'}
              width={280}
              height={120}
              priority
              className="page-banner__logo-image"
            />
          </Link>

          <div className="page-banner__content">
            <AnimatedPageTitle title={title} />
            <p className="page-banner__breadcrumb">
              <Link href="/" className="page-banner__breadcrumb-home">
                Home
              </Link>
              <span className="page-banner__breadcrumb-separator">/</span>
              <span className="page-banner__breadcrumb-current">{title}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
