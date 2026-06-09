import { absoluteAssetUrl } from '@/lib/api';
import { siteAssets } from '@/lib/assets';
import type { SitePayload } from '@/types/site';
import { AnimatedPageTitle } from '@/components/layout/AnimatedPageTitle';
import Image from 'next/image';
import Link from 'next/link';

interface PageBannerProps {
  site: SitePayload;
  title: string;
  compact?: boolean;
  logoOnly?: boolean;
}

export function PageBanner({ site, title, compact = false, logoOnly = false }: PageBannerProps) {
  const bannerBg = absoluteAssetUrl(siteAssets.pageBannerBackground) ?? siteAssets.pageBannerBackground;
  const logo = absoluteAssetUrl(site.logo ?? '/app/images/logo.svg') ?? '/app/images/logo.svg';

  return (
    <section
      className={[
        'page-banner',
        compact ? 'page-banner--compact' : '',
        logoOnly ? 'page-banner--logo-only' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="page-banner__background"
        style={{ backgroundImage: `url(${bannerBg})` }}
      />
      <div className="page-banner__shade" />

      <div className="page-banner__inner">
        <div className="page-banner__panel">
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

          {!logoOnly ? (
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
          ) : null}
        </div>
      </div>
    </section>
  );
}
