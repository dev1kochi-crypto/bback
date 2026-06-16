'use client';

import { absoluteAssetUrl, submitNewsletterSignup } from '@/lib/api';
import { siteAssets } from '@/lib/assets';
import type { SitePayload } from '@/types/site';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

interface SiteFooterProps {
  site: SitePayload;
}

function ContactRow({
  icon,
  href,
  children,
}: {
  icon: string;
  href?: string;
  children: React.ReactNode;
}) {
  const iconSrc = absoluteAssetUrl(icon) ?? icon;
  const content = (
    <>
      <Image src={iconSrc} alt="" width={22} height={22} className="site-footer__contact-icon" />
      <span className="site-footer__contact-text">{children}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="site-footer__contact-row">
        {content}
      </a>
    );
  }

  return <div className="site-footer__contact-row">{content}</div>;
}

function FooterNewsletter() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage(null);

    try {
      const response = await submitNewsletterSignup({ email });

      setStatus('success');
      setMessage(response.message);
      setEmail('');
      router.push('/thank-you');
    } catch {
      setStatus('error');
      setMessage('Could not subscribe right now. Please try again.');
    }
  }

  const mailIcon = absoluteAssetUrl(siteAssets.contactMailIcon) ?? siteAssets.contactMailIcon;

  return (
    <form onSubmit={handleSubmit} className="footer-newsletter">
      <div className="footer-newsletter__field">
        <span className="footer-newsletter__icon">
          <Image src={mailIcon} alt="" width={20} height={20} className="h-5 w-5 object-contain opacity-70" />
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email address"
          className="footer-newsletter__input"
        />
        <button type="submit" disabled={status === 'loading'} className="footer-newsletter__button" aria-label="Subscribe">
          {status === 'loading' ? (
            <span aria-hidden className="footer-newsletter__spinner" />
          ) : (
            <span aria-hidden className="footer-newsletter__arrow"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4.9997 12.001L4.3957 6.56397C4.2227 5.00797 5.8247 3.86497 7.2397 4.53597L19.1837 10.194C20.7087 10.916 20.7087 13.086 19.1837 13.808L7.2397 19.467C5.8247 20.137 4.2227 18.995 4.3957 17.439L4.9997 12.001ZM4.9997 12.001H11.9997" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg></span>
          )}
        </button>
      </div>
      {message ? <p className={`footer-newsletter__message ${status === 'error' ? 'footer-newsletter__message--error' : ''}`}>{message}</p> : null}
    </form>
  );
}

const socialLabels: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
};

const socialIcons: Record<string, string> = {
  facebook: '/app/images/basil_facebook-outline.png',
  instagram: '/app/images/proicons_instagram.png',
  twitter: '/app/images/basil_twitter-outline.png',
  linkedin: '/app/images/basil_linkedin-outline.png',
  youtube: '/app/images/ant-design_youtube-outlined.png',
};

function SocialLink({ name, url }: { name: string; url: string }) {
  const icon = socialIcons[name];
  if (!icon) {
    return null;
  }

  const iconSrc = absoluteAssetUrl(icon) ?? icon;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={socialLabels[name] ?? name}
      className="site-footer__social-link"
    >
      <Image src={iconSrc} alt="" width={22} height={22} className="site-footer__social-icon" />
    </a>
  );
}

function menuHref(url: string): string {
  return url.startsWith('#') ? `/menu${url}` : url;
}

function hasText(value: string | null | undefined): value is string {
  return Boolean(value && value.replace(/<[^>]*>/g, '').trim());
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = /^https?:\/\//i.test(href);

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="site-footer__link">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className="site-footer__link">
      {children}
    </Link>
  );
}

export function SiteFooter({ site }: SiteFooterProps) {
  const logo = absoluteAssetUrl(site.logo ?? '/app/images/logo.svg') ?? '/app/images/logo.svg';
  const year = new Date().getFullYear();
  const footerMenuLinks = site.footer.menu_links.slice(0, 6);
  const usefulLinks = [
    hasText(site.privacy_policy)
      ? { label: 'Privacy Policy', href: site.footer.privacy_policy_url || '/privacy-policy' }
      : null,
    hasText(site.terms_and_conditions)
      ? { label: 'Terms and Conditions', href: site.footer.terms_url || '/terms-and-conditions' }
      : null,
  ].filter((item): item is { label: string; href: string } => Boolean(item));
  const mapHref =
    site.google_map_link ??
    (site.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}` : undefined);

  return (
    <footer className="site-footer">
      <div className="site-footer__top-border" />

      <div className="site-footer__inner">
        <div className="flex flex-col items-center">
          <div className="site-footer__brand-row">
            <span className="site-footer__brand-line" />
            <Link href="/">
              <Image src={logo} alt={site.logo_alt ?? 'B.back'} width={190} height={86} className="site-footer__logo" />
            </Link>
            <span className="site-footer__brand-line" />
          </div>

          <div className="site-footer__grid">
            <div>
              <h3 className="site-footer__heading">Our Nav</h3>
              <ul className="site-footer__list">
                {site.nav_items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.url} className="site-footer__link">
                      {item.label === 'About' ? 'About Us' : item.label === 'Our Menu' ? 'Our Menu' : item.label === 'Offers' ? 'Our Offer' : item.label === 'Contact' ? 'Contact Us' : item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {footerMenuLinks.length ? (
              <div>
                <h3 className="site-footer__heading">Our Menu</h3>
                <ul className="site-footer__list">
                  {footerMenuLinks.map((item) => (
                    <li key={`${item.label}-${item.url}`}>
                      <FooterLink href={menuHref(item.url)}>
                        {item.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              {usefulLinks.length ? (
                <>
                  <h3 className="site-footer__heading">Useful Links</h3>
                  <ul className="site-footer__list">
                    {usefulLinks.map((item) => (
                      <li key={item.label}>
                        <FooterLink href={item.href}>
                          {item.label}
                        </FooterLink>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <h3 className={`site-footer__heading ${usefulLinks.length ? 'site-footer__heading--spaced' : ''}`}>Contact Info</h3>
              <div className="site-footer__contact-list">
                {site.address ? (
                  <ContactRow icon={siteAssets.contactDirectionsIcon} href={mapHref}>
                    {site.address}
                  </ContactRow>
                ) : null}
                {site.phone ? (
                  <ContactRow icon={siteAssets.contactPhoneIcon} href={`tel:${site.phone.replace(/\s/g, '')}`}>
                    {site.phone}
                  </ContactRow>
                ) : null}
                {site.email ? (
                  <ContactRow icon={siteAssets.contactMailIcon} href={`mailto:${site.email}`}>
                    {site.email}
                  </ContactRow>
                ) : null}
              </div>
            </div>

            <div>
              <h3 className="site-footer__heading">Subscribe Newsletter</h3>
              <p className="site-footer__newsletter-copy">
                {site.footer.description ??
                  'Subscribe for exclusive offers, new menu drops, and updates from B.back.'}
              </p>
              <FooterNewsletter />

              <h3 className="site-footer__heading site-footer__heading--spaced">Follow Us</h3>
              <div className="site-footer__socials">
                {Object.entries(site.footer.social).map(([key, url]) =>
                  url ? (
                    <SocialLink key={key} name={key} url={url} />
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="site-footer__divider">
        <div className="site-footer__bottom-border" />
      </div>
      <div>
        <div className="site-footer__bottom-inner">
          <p>
            Copyright &copy; {year} All Rights Reserved. {site.company_name ?? 'B.back'}
          </p>
          <p>
            Designed by :{' '}
            <a
              href="https://mightywarner.ae/"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__link"
            >
              MightyWarners Technologies LLC
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
