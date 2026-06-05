'use client';

import { absoluteAssetUrl, logoutCustomer } from '@/lib/api';
import { useCart } from '@/components/cart/CartProvider';
import { siteAssets } from '@/lib/assets';
import type { SitePayload } from '@/types/site';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

interface SiteHeaderProps {
  site: SitePayload;
  activeNavUrl?: string;
  fixed?: boolean;
  hideDesktopLogo?: boolean;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" aria-hidden>
      <path d="M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 4h5a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function HeaderIconButton({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white shadow-[0_16px_32px_rgba(0,0,0,0.24)] transition hover:border-ember hover:bg-ember hover:text-white"
    >
      {children}
    </Link>
  );
}

function HamburgerIcon({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  const hotdogIcon = absoluteAssetUrl('/app/images/gg_menu-hotdog.png') ?? '/app/images/gg_menu-hotdog.png';

  return (
    <button type="button" onClick={onClick} className="flex h-11 w-11 items-center justify-center p-1" aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen}>
      <Image src={hotdogIcon} alt="" width={36} height={28} className="h-7 w-9 object-contain" />
    </button>
  );
}

function menuHref(url: string): string {
  return url.startsWith('#') ? `/menu${url}` : url;
}

export function SiteHeader({ site, activeNavUrl, fixed = true, hideDesktopLogo = false }: SiteHeaderProps) {
  const router = useRouter();
  const headerBg = absoluteAssetUrl(siteAssets.headerBackground) ?? siteAssets.headerBackground;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { openCart, cart } = useCart();
  const bagIcon = absoluteAssetUrl('/app/images/solar_bag-linear.png') ?? '/app/images/solar_bag-linear.png';
  const userIcon = absoluteAssetUrl('/app/images/lucide_user-round.png') ?? '/app/images/lucide_user-round.png';
  const navLinks = useMemo(() => {
    return site.nav_items.length ? site.nav_items : [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Our Menu', url: '/menu' },
      { label: 'Offers', url: '/offers' },
      { label: 'Contact', url: '/contact' },
    ];
  }, [site.nav_items]);
  const overlayLinks = navLinks;
  const menuLinks = site.footer.menu_links.length ? site.footer.menu_links : [
    { label: 'Sandwich', url: '/menu' },
    { label: 'Burger', url: '/menu' },
    { label: 'Pizza', url: '/menu' },
    { label: 'Snacks', url: '/menu' },
  ];
  const socialLinks = Object.entries(site.footer.social).filter(([, url]) => Boolean(url)).slice(0, 6);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const detectLoggedIn = () => {
      setIsLoggedIn(Boolean(
        window.localStorage.getItem('auth_token')
        || window.localStorage.getItem('token')
        || window.localStorage.getItem('user')
      ));
    };

    detectLoggedIn();
    window.addEventListener('storage', detectLoggedIn);

    return () => window.removeEventListener('storage', detectLoggedIn);
  }, []);

  useEffect(() => {
    if (!isAccountOpen) {
      return;
    }

    const closeAccount = (event: MouseEvent) => {
      if (accountMenuRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsAccountOpen(false);
    };

    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', closeAccount);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', closeAccount);
    };
  }, [isAccountOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  async function handleLogout() {
    const token = window.localStorage.getItem('auth_token');

    if (token) {
      await logoutCustomer(token).catch(() => null);
    }

    window.localStorage.removeItem('auth_token');
    window.localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    setIsLoggedIn(false);
    setIsAccountOpen(false);
    setIsMenuOpen(false);
    router.push('/login');
  }

  return (
    <>
      <header
        className={[
          fixed ? 'fixed inset-x-0 top-0 z-[120]' : 'relative z-30',
          'pointer-events-none transition-all duration-500',
          isScrolled ? 'scrolled' : '',
        ].join(' ')}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 transition-opacity duration-500"
          style={{ backgroundImage: `url(${headerBg})` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-500" />

        <div className="pointer-events-auto relative mx-auto container-ctn">
          <div className="flex  items-center justify-between gap-6">
            <nav className="hidden items-center  font-display text-[17px] font-medium tracking-normal lg:flex">
              {navLinks.map((item) => {
                const isActive = activeNavUrl ? item.url === activeNavUrl : item.url === '/';

                return (
                  <Link
                    key={`${item.label}-${item.url}`}
                    href={item.url}
                    className={isActive ? 'text-ember' : 'transition hover:text-ember'}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link href="/" className="inline-flex items-center lg:hidden site-logo-mobile">
              <Image
                src={absoluteAssetUrl(site.logo ?? '/app/images/logo.svg') ?? '/app/images/logo.svg'}
                alt={site.logo_alt ?? 'B.back'}
                width={150}
                height={64}
                priority
                className="h-14 w-auto object-contain"
              />
            </Link>

            {!hideDesktopLogo ? (
              <Link href="/" className="site-logo absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center lg:inline-flex">
                <Image
                  src={absoluteAssetUrl(site.logo ?? '/app/images/logo.svg') ?? '/app/images/logo.svg'}
                  alt={site.logo_alt ?? 'B.back'}
                  width={250}
                  height={113}
                  priority
                  className="w-auto object-contain"
                />
              </Link>
            ) : null}

            <div className="hidden items-center justify-end gap-5 lg:flex">
              <div className="right">
                <div className="font-display text-[12px] font-medium tracking-[0.08em] text-white/45">Call Us Now</div>
                {site.phone ? (
                  <a
                    href={`tel:${site.phone.replace(/\s/g, '')}`}
                    className="font-display text-[18px] font-medium leading-tight transition hover:text-ember"
                  >
                    {site.phone}
                  </a>
                ) : null}
              </div>
              <div className="right">
                <div className="font-display text-[12px] font-medium tracking-[0.08em] text-white/45">Email Us</div>
                {site.email ? (
                  <a href={`mailto:${site.email}`} className="font-display text-[18px] font-medium leading-tight transition hover:text-ember">
                    {site.email}
                  </a>
                ) : null}
              </div>
              <button type="button" onClick={openCart} aria-label="Cart" title="Cart" className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white shadow-[0_16px_32px_rgba(0,0,0,0.24)] transition hover:border-ember hover:bg-ember">
                <Image src={bagIcon} alt="" width={22} height={22} className="h-[22px] w-[22px] object-contain brightness-0 invert" />
                {cart.items.length ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 font-body text-[10px] font-bold text-white">{cart.items.length}</span> : null}
              </button>
              {isLoggedIn ? (
                <div ref={accountMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccountOpen((current) => !current)}
                    aria-label="Account menu"
                    aria-expanded={isAccountOpen}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ember text-white shadow-[0_16px_32px_rgba(0,0,0,0.24)] transition hover:bg-[#ff8e22]"
                  >
                    <Image src={userIcon} alt="" width={22} height={22} className="h-[22px] w-[22px] object-contain brightness-0 invert" />
                  </button>
                  <div className={['absolute right-0 top-[calc(100%+12px)] w-44 overflow-hidden rounded-[8px] border border-white/10 bg-[#080d0e] py-2 shadow-[0_22px_48px_rgba(0,0,0,0.42)] transition', isAccountOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'].join(' ')}>
                    <Link href="/orders" onClick={() => setIsAccountOpen(false)} className="block px-4 py-3 font-body text-[13px] font-bold uppercase text-white/74 transition hover:bg-ember hover:text-white">
                      Your Order
                    </Link>
                    <button type="button" onClick={handleLogout} className="block w-full px-4 py-3 text-left font-body text-[13px] font-bold uppercase text-white/74 transition hover:bg-ember hover:text-white">
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <HeaderIconButton href="/login" label="Login">
                  <LoginIcon />
                </HeaderIconButton>
              )}
              <HamburgerIcon onClick={() => setIsMenuOpen((current) => !current)} isOpen={isMenuOpen} />
            </div>
            <div className="relative z-10 flex items-center gap-2 lg:hidden">
              <button type="button" onClick={openCart} aria-label="Cart" title="Cart" className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white shadow-[0_16px_32px_rgba(0,0,0,0.24)] transition hover:border-ember hover:bg-ember">
                <Image src={bagIcon} alt="" width={21} height={21} className="h-[21px] w-[21px] object-contain brightness-0 invert" />
                {cart.items.length ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 font-body text-[10px] font-bold text-white">{cart.items.length}</span> : null}
              </button>
              <HamburgerIcon onClick={() => setIsMenuOpen((current) => !current)} isOpen={isMenuOpen} />
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen ? (
      <div className="fixed inset-0 z-[220] bg-[#020405] text-white transition duration-500 opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_28%,rgba(255,122,0,0.16),transparent_30%),radial-gradient(circle_at_80%_60%,rgba(255,122,0,0.11),transparent_32%)]" />
        <div className="absolute inset-0 bg-[url('/app/images/Mask group (18).jpg')] bg-cover bg-center opacity-[0.13]" />
        <div className="relative z-[2] flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="inline-flex items-center">
              <Image
                src={absoluteAssetUrl(site.logo ?? '/app/images/logo.svg') ?? '/app/images/logo.svg'}
                alt={site.logo_alt ?? 'B.back'}
                width={178}
                height={76}
                className="h-[64px] w-auto object-contain"
              />
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex h-12 items-center gap-3 rounded-full bg-white/10 px-5 font-body text-[13px] font-bold uppercase tracking-[0.02em] text-white transition hover:bg-ember"
            >
              Close
              <CloseIcon />
            </button>
          </div>

          <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-0">
            <nav className="space-y-3">
              {overlayLinks.map((item) => {
                const isActive = activeNavUrl ? item.url === activeNavUrl : item.url === '/';

                return (
                  <Link
                    key={`overlay-${item.label}-${item.url}`}
                    href={item.url}
                    onClick={() => setIsMenuOpen(false)}
                    className={['group flex items-center gap-5 font-display text-[46px] font-medium leading-[1.08] transition sm:text-[58px] lg:text-[68px]', isActive ? 'text-white' : 'text-white/48 hover:text-white'].join(' ')}
                  >
                    <span className={['h-3 w-3 rounded-full transition group-hover:bg-ember', isActive ? 'bg-ember' : 'bg-white/0'].join(' ')} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="max-w-[700px]">
              <p className="font-display text-[15px] text-ember">B.back Restaurant</p>
              <h2 className="mt-4 font-display text-[54px] font-black uppercase leading-[0.95] text-white sm:text-[72px] lg:text-[86px]">
                Bite Your
                <span className="block text-ember">Cravings Away</span>
              </h2>
              {site.footer.description ? (
                <p className="mt-7 max-w-[560px] font-body text-[15px] font-semibold leading-[1.7] text-white/62">{site.footer.description}</p>
              ) : (
                <p className="mt-7 max-w-[560px] font-body text-[15px] font-semibold leading-[1.7] text-white/62">
                  Fresh food, signature burgers, loaded wraps, and bold flavors served with the B.back attitude.
                </p>
              )}

              <div className="mt-9 grid gap-6 sm:grid-cols-2">
                {site.phone ? (
                  <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="group border-t border-white/12 pt-5">
                    <span className="font-display text-[12px] uppercase tracking-[0.08em] text-white/42">Call Us Now</span>
                    <span className="mt-2 block font-display text-[26px] text-white transition group-hover:text-ember">{site.phone}</span>
                  </a>
                ) : null}
                {site.email ? (
                  <a href={`mailto:${site.email}`} className="group border-t border-white/12 pt-5">
                    <span className="font-display text-[12px] uppercase tracking-[0.08em] text-white/42">Email Us</span>
                    <span className="mt-2 block font-display text-[26px] text-white transition group-hover:text-ember">{site.email}</span>
                  </a>
                ) : null}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <button type="button" onClick={() => { setIsMenuOpen(false); openCart(); }} className="inline-flex h-12 items-center gap-3 rounded-full bg-ember px-6 font-body text-[14px] font-bold text-white shadow-glow">
                  <Image src={bagIcon} alt="" width={19} height={19} className="h-[19px] w-[19px] brightness-0 invert" />
                  Cart
                </button>
                <Link href={isLoggedIn ? '/orders' : '/login'} onClick={() => setIsMenuOpen(false)} className="inline-flex h-12 items-center gap-3 rounded-full border border-white/18 px-6 font-body text-[14px] font-bold text-white transition hover:border-ember hover:bg-ember">
                  {isLoggedIn ? (
                    <Image src={userIcon} alt="" width={19} height={19} className="h-[19px] w-[19px] brightness-0 invert" />
                  ) : (
                    <LoginIcon />
                  )}
                  {isLoggedIn ? 'Your Order' : 'Login'}
                </Link>
                {isLoggedIn ? (
                  <button type="button" onClick={handleLogout} className="inline-flex h-12 items-center rounded-full border border-white/18 px-6 font-body text-[14px] font-bold text-white transition hover:border-ember hover:bg-ember">
                    Logout
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="border-t border-white/12 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap gap-x-8 gap-y-3 font-body text-[14px] font-semibold text-white/58">
                {menuLinks.map((item) => (
                  <Link key={`overlay-menu-${item.label}-${item.url}`} href={menuHref(item.url)} onClick={() => setIsMenuOpen(false)} className="transition hover:text-ember">
                    {item.label}
                  </Link>
                ))}
              </div>
              {socialLinks.length ? (
                <div className="flex flex-wrap gap-x-6 gap-y-2 font-body text-[14px] font-semibold text-white/58">
                  {socialLinks.map(([label, url]) => (
                    <a key={label} href={url ?? '#'} target="_blank" rel="noreferrer" className="transition hover:text-ember">
                      {label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      ) : null}
    </>
  );
}

/**
 * Spacer matching fixed header height so content is not hidden underneath.
 */
export function SiteHeaderSpacer({ variant }: { variant: 'home' | 'inner' }) {
  return (
    <div
      aria-hidden
      className="h-0"
    />
  );
}
