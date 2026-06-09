import { defaultSitePayload } from '@/lib/api';
import { getSite } from '@/lib/api.server';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader, SiteHeaderSpacer } from '@/components/layout/SiteHeader';
import { PageBanner } from '@/components/layout/PageBanner';

export interface PageBannerConfig {
  title?: string;
  compact?: boolean;
  logoOnly?: boolean;
}

interface SiteShellProps {
  children: React.ReactNode;
  activeNavUrl?: string;
  /** Inner pages show the banner between header and content. Home uses `variant="home"`. */
  variant?: 'home' | 'inner';
  pageBanner?: PageBannerConfig;
}

export async function SiteShell({
  children,
  activeNavUrl,
  variant = 'inner',
  pageBanner,
}: SiteShellProps) {
  const site = await getSite().catch(() => defaultSitePayload);
  const isHome = variant === 'home';
  const showPageBanner = !isHome && pageBanner && (pageBanner.logoOnly || pageBanner.title);
  const bannerTitle = pageBanner?.title;

  return (
    <>
      <SiteHeader site={site} activeNavUrl={activeNavUrl} hideDesktopLogo={Boolean(showPageBanner)} />
      {showPageBanner ? (
        <PageBanner site={site} title={bannerTitle ?? ''} compact={pageBanner?.compact} logoOnly={pageBanner?.logoOnly} />
      ) : (
        <SiteHeaderSpacer variant={isHome ? 'home' : 'inner'} />
      )}
      {children}
      <SiteFooter site={site} />
    </>
  );
}
