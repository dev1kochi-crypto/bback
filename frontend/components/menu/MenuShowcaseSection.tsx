'use client';

import type { MenuPayload, MenuItem } from '@/types/menu';
import { useCart } from '@/components/cart/CartProvider';
import { Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';

interface MenuShowcaseSectionProps {
  menu: MenuPayload;
  variant?: 'home' | 'listing';
}

export function MenuShowcaseSection({ menu, variant = 'home' }: MenuShowcaseSectionProps) {
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [homePage, setHomePage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(16);
  const sectionRef = useRef<HTMLElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const glowX = useSpring(cursorX, { stiffness: 90, damping: 28, mass: 0.35 });
  const glowY = useSpring(cursorY, { stiffness: 90, damping: 28, mass: 0.35 });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const backdropY = useTransform(scrollYProgress, [0, 1], [-46, 46]);
  const titleY = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const orbY = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const gridY = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const hasData = Boolean(menu.section && menu.categories.length && menu.items.length && (variant !== 'home' || menu.section.display_home));
  const pageSize = variant === 'home' ? 4 : 16;

  const filteredItems = useMemo(() => {
    return activeCategory === 'all' ? menu.items : menu.items.filter((item) => item.category_id === activeCategory);
  }, [activeCategory, menu.items]);

  const pagedItems = useMemo(() => {
    return variant === 'home' ? filteredItems.slice(0, 16) : filteredItems;
  }, [filteredItems, variant]);

  const totalPages = Math.max(1, Math.ceil(pagedItems.length / pageSize));

  const visibleItems = useMemo(() => {
    if (variant === 'home') {
      const start = homePage * pageSize;
      return pagedItems.slice(start, start + pageSize);
    }

    return pagedItems.slice(0, visibleCount);
  }, [homePage, pageSize, pagedItems, variant, visibleCount]);

  useEffect(() => {
    setHomePage(0);
    setVisibleCount(16);
  }, [activeCategory, variant]);

  useEffect(() => {
    if (variant !== 'listing' || visibleCount >= filteredItems.length) {
      return;
    }

    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) => Math.min(current + 16, filteredItems.length));
        }
      },
      { rootMargin: '260px 0px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [filteredItems.length, variant, visibleCount]);

  if (!hasData) {
    return null;
  }

  const title = variant === 'listing'
    ? menu.section?.listing_title || menu.section?.line_2 || 'Popular Dishes'
    : menu.section?.line_2 || 'Our Special Menu';
  const description = variant === 'listing'
    ? menu.section?.listing_description || menu.section?.short_description
    : menu.section?.short_description;

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    cursorX.set(event.clientX - rect.left);
    cursorY.set(event.clientY - rect.top);
  };

  return (
    <motion.section
      ref={sectionRef}
      id="menu"
      className={`relative overflow-hidden bg-[#050505] px-6 pb-[92px] text-white sm:px-10 lg:px-16 ${
        variant === 'home' ? 'pt-[170px] sm:pt-[190px] lg:pb-[120px] lg:pt-[245px]' : 'py-[92px] lg:py-[120px]'
      }`}
      onPointerMove={prefersReducedMotion ? undefined : handlePointerMove}
    >
      {variant === 'home' ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[150px] bg-[#080c0d] sm:h-[172px] lg:h-[220px]" />
          <div className="pointer-events-none absolute inset-x-0 top-[148px] z-[2] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent sm:top-[170px] lg:top-[218px]" />
          <div className="pointer-events-none absolute inset-x-0 top-[118px] z-[2] h-[90px] bg-gradient-to-b from-transparent via-black/35 to-[#050505] sm:top-[136px] lg:top-[174px] lg:h-[120px]" />
        </>
      ) : null}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[url('/app/images/Mask group (18).jpg')] bg-cover bg-center opacity-35"
        style={prefersReducedMotion ? undefined : { y: backdropY }}
      />
      <motion.div
        className="pointer-events-none absolute left-0 top-0 hidden h-[230px] w-[230px] -translate-x-1/3 opacity-25 lg:block"
        style={prefersReducedMotion ? undefined : { y: orbY }}
      >
        <div className="h-full w-full rounded-full bg-[#1a1a1a]" />
      </motion.div>
      {!prefersReducedMotion ? (
        <>
          <MenuThreeAmbient />
          <motion.div
            className="pointer-events-none absolute left-0 top-0 hidden h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(246,139,36,0.2),rgba(246,139,36,0.06)_38%,transparent_70%)] blur-[8px] lg:block"
            style={{ x: glowX, y: glowY }}
          />
          <motion.div
            className="pointer-events-none absolute left-[9%] top-[24%] h-1 w-1 rounded-full bg-ember shadow-[0_0_28px_rgba(246,139,36,0.9)]"
            animate={{ y: [0, -18, 0], opacity: [0.35, 1, 0.35], scale: [1, 1.45, 1] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute right-[14%] top-[31%] h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_24px_rgba(255,255,255,0.45)]"
            animate={{ y: [0, 22, 0], x: [0, -10, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-[18%] right-[7%] h-[190px] w-[190px] rounded-full bg-[radial-gradient(circle,rgba(246,139,36,0.11),transparent_68%)] blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.45, 0.2] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <FloatingBubbles />
        </>
      ) : null}

      {variant === 'home' ? (
        <motion.div
          className="pointer-events-none absolute right-[0px] top-[64px] z-20 hidden h-[250px] w-[470px] lg:block  xl:top-[68px] xl:h-[300px] xl:w-[560px]"
          initial={prefersReducedMotion ? false : { opacity: 0, x: 72, y: -18, rotate: -5, filter: 'blur(8px)' }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0, rotate: 0, filter: 'blur(0px)' }}
          animate={prefersReducedMotion ? undefined : { y: [0, -10, 0], rotate: [0, 1.2, 0] }}
          viewport={{ once: false, amount: 0.18 }}
          transition={{
            opacity: { duration: 0.78, ease: [0.22, 1, 0.36, 1] },
            x: { duration: 0.78, ease: [0.22, 1, 0.36, 1] },
            filter: { duration: 0.78, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 5.6, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 5.6, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <Image src={fajitaImage} alt="" fill sizes="560px" className="object-contain object-right drop-shadow-[0_26px_42px_rgba(0,0,0,0.42)]" unoptimized />
        </motion.div>
      ) : null}

      <div className="relative z-10 mx-auto max-w-[1480px]">
        <motion.div
          className="mx-auto max-w-[920px] text-center"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 34, filter: 'blur(8px)' }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={prefersReducedMotion ? undefined : { y: titleY }}
        >
          {menu.section?.line_1 ? <p className="font-display text-[14px] text-white/45">{menu.section.line_1}</p> : null}
          <h2 className="mt-2 font-display text-[clamp(3rem,4.4vw,5.1rem)] font-black uppercase leading-none text-white">
            {title}
          </h2>
          <div className="mx-auto mt-5 h-[10px] w-[170px] translate-x-[64px] bg-[url('/app/images/Vector-2.png')] bg-contain bg-center bg-no-repeat max-sm:translate-x-0" />
          {description ? (
            <p className="mx-auto mt-7 max-w-[860px] text-[15px] leading-[1.7] text-[#9b9b9b] sm:text-[17px]">
              {description}
            </p>
          ) : null}
          {variant === 'home' && menu.section?.button_text && menu.section?.button_url ? (
            <Link
              href={menuHref(menu.section.button_url)}
              className="mt-7 inline-flex h-10 items-center justify-center border border-white/50 px-5 font-display text-[14px] font-medium uppercase text-white transition hover:border-ember hover:bg-ember"
            >
              {menu.section.button_text}
            </Link>
          ) : null}
        </motion.div>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:gap-3"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          <motion.button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={activeCategory === 'all' ? categoryActiveClass : categoryClass}
            whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          >
            All
          </motion.button>
          {menu.categories.map((category) => (
            <motion.button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={activeCategory === category.id ? categoryActiveClass : categoryClass}
              whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            >
              {category.icon ? <Image src={category.icon} alt="" width={14} height={14} className="h-3.5 w-3.5 object-contain" /> : null}
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {visibleItems.length ? (
          <motion.div
            className={
              variant === 'home'
                ? 'mt-9 flex flex-wrap items-stretch justify-center gap-5 lg:mt-12 lg:gap-6'
                : 'mx-auto mt-10 grid max-w-[1280px] justify-items-center gap-x-7 gap-y-9 sm:grid-cols-2 lg:grid-cols-4'
            }
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
            viewport={{ once: false, amount: 0.12 }}
            transition={{ duration: 0.4 }}
            style={prefersReducedMotion ? undefined : { y: gridY }}
          >
            {visibleItems.map((item, index) => (
              <MenuCard key={item.id} item={item} variant={variant} index={index} />
            ))}
          </motion.div>
        ) : null}

        {variant === 'home' && totalPages > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-2">
            <motion.button
              type="button"
              onClick={() => setHomePage((page) => (page - 1 + totalPages) % totalPages)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#171b1d] font-display text-[20px] leading-none text-white/70 transition hover:bg-ember hover:text-white"
              aria-label="Previous menu items"
              whileHover={prefersReducedMotion ? undefined : { x: -2, scale: 1.08 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14" fill="none" className="scale-x-[-1]">
                <path d="M17.3644 5.93621C17.5519 6.12374 17.6572 6.37805 17.6572 6.64321C17.6572 6.90838 17.5519 7.16268 17.3644 7.35021L11.7074 13.0072C11.6152 13.1027 11.5048 13.1789 11.3828 13.2313C11.2608 13.2837 11.1296 13.3113 10.9968 13.3125C10.8641 13.3136 10.7324 13.2883 10.6095 13.238C10.4866 13.1878 10.3749 13.1135 10.281 13.0196C10.1872 12.9257 10.1129 12.8141 10.0626 12.6912C10.0123 12.5683 9.98704 12.4366 9.98819 12.3038C9.98934 12.171 10.0169 12.0398 10.0693 11.9178C10.1217 11.7958 10.1979 11.6855 10.2934 11.5932L14.2434 7.64321L1.00044 7.64321C0.735224 7.64321 0.480869 7.53785 0.293333 7.35032C0.105797 7.16278 0.000440598 6.90843 0.000440598 6.64321C0.000440598 6.378 0.105797 6.12364 0.293333 5.93611C0.480869 5.74857 0.735224 5.64321 1.00044 5.64321L14.2434 5.64321L10.2934 1.69321C10.1113 1.50461 10.0105 1.25201 10.0128 0.989811C10.015 0.727614 10.1202 0.476801 10.3056 0.291393C10.491 0.105986 10.7418 0.000815392 11.004 -0.00146294C11.2662 -0.00374126 11.5188 0.0970526 11.7074 0.279211L17.3644 5.93621Z" fill="white"/>
              </svg>
            </motion.button>
            {Array.from({ length: totalPages }).map((_, index) => (
              <motion.button
                key={index}
                type="button"
                onClick={() => setHomePage(index)}
                className={`h-[15px] w-[15px] rounded-full border-2 transition ${
                  homePage === index ? 'border-ember bg-ember shadow-[0_0_0_4px_rgba(246,139,36,0.15)]' : 'border-white/45 bg-[#171b1d] hover:border-ember'
                }`}
                aria-label={`Show menu page ${index + 1}`}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.18 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
              />
            ))}
            <motion.button
              type="button"
              onClick={() => setHomePage((page) => (page + 1) % totalPages)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#171b1d] font-display text-[20px] leading-none text-white/70 transition hover:bg-ember hover:text-white"
              aria-label="Next menu items"
              whileHover={prefersReducedMotion ? undefined : { x: 2, scale: 1.08 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path d="M17.3644 5.93621C17.5519 6.12374 17.6572 6.37805 17.6572 6.64321C17.6572 6.90838 17.5519 7.16268 17.3644 7.35021L11.7074 13.0072C11.6152 13.1027 11.5048 13.1789 11.3828 13.2313C11.2608 13.2837 11.1296 13.3113 10.9968 13.3125C10.8641 13.3136 10.7324 13.2883 10.6095 13.238C10.4866 13.1878 10.3749 13.1135 10.281 13.0196C10.1872 12.9257 10.1129 12.8141 10.0626 12.6912C10.0123 12.5683 9.98704 12.4366 9.98819 12.3038C9.98934 12.171 10.0169 12.0398 10.0693 11.9178C10.1217 11.7958 10.1979 11.6855 10.2934 11.5932L14.2434 7.64321L1.00044 7.64321C0.735224 7.64321 0.480869 7.53785 0.293333 7.35032C0.105797 7.16278 0.000440598 6.90843 0.000440598 6.64321C0.000440598 6.378 0.105797 6.12364 0.293333 5.93611C0.480869 5.74857 0.735224 5.64321 1.00044 5.64321L14.2434 5.64321L10.2934 1.69321C10.1113 1.50461 10.0105 1.25201 10.0128 0.989811C10.015 0.727614 10.1202 0.476801 10.3056 0.291393C10.491 0.105986 10.7418 0.000815392 11.004 -0.00146294C11.2662 -0.00374126 11.5188 0.0970526 11.7074 0.279211L17.3644 5.93621Z" fill="white"/>
              </svg>
            </motion.button>
          </div>
        ) : null}

        {variant === 'listing' && visibleItems.length < filteredItems.length ? (
          <div ref={loadMoreRef} className="mt-10 text-center font-display text-[14px] text-white/45">
            Loading...
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}

function menuHref(url: string): string {
  return url.startsWith('#') ? `/menu${url}` : url;
}

const categoryClass = 'inline-flex h-8 items-center gap-2 rounded-full bg-[#171b1d] px-3 font-display text-[12px] text-white/75 transition hover:bg-ember hover:text-white xl:px-4 xl:text-[13px]';
const categoryActiveClass = 'inline-flex h-8 items-center gap-2 rounded-full bg-ember px-3 font-display text-[12px] text-white shadow-[0_10px_24px_rgba(255,122,0,0.28)] xl:px-4 xl:text-[13px]';
const fajitaImage = '/app/images/Fajita.png';

function MenuCard({ item, index }: { item: MenuItem; variant: 'home' | 'listing'; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  const { addItem } = useCart();
  const router = useRouter();
  const floatDelay = (index % 4) * 0.35;

  return (
    <motion.article
      className="group relative flex min-h-[452px] w-full overflow-visible rounded-[12px] border border-dashed border-white/20 bg-[#101416] px-[22px] pb-[21px] pt-[15px] text-white outline-none transition duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-[#f68b24] focus-within:-translate-y-1 focus-within:border-transparent focus-within:bg-[#f68b24] sm:max-w-[280px]"
      initial={
        prefersReducedMotion
          ? false
          : {
              opacity: 0,
              y: 34,
              rotateX: 7,
              scale: 0.96,
              filter: 'blur(12px)',
            }
      }
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: [0, -5, 0], rotateX: 0, scale: 1, filter: 'blur(0px)' }}
      whileHover={prefersReducedMotion ? undefined : { y: -8, rotateX: 2.5, scale: 1.012 }}
      viewport={{ once: false, amount: 0.22 }}
      transition={{
        opacity: { duration: 0.72, delay: Math.min(index * 0.06, 0.24), ease: [0.22, 1, 0.36, 1] },
        y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: floatDelay },
        rotateX: { duration: 0.82, delay: Math.min(index * 0.06, 0.24), ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.82, delay: Math.min(index * 0.06, 0.24), ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.82, delay: Math.min(index * 0.06, 0.24), ease: [0.22, 1, 0.36, 1] },
      }}
      style={{ transformPerspective: 1100, transformStyle: 'preserve-3d' }}
    >
      <div className="pointer-events-none absolute -left-[16px] -right-[16px] -top-[24px] z-0 h-[64px] opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
        <Image src="/app/images/hover-bg.png" alt="" fill sizes="340px" className="object-fill" unoptimized />
      </div>
      <div className="relative z-10 flex w-full flex-col">
        <motion.div
          className="relative mx-auto -mt-[2px] h-[222px] w-full max-w-[246px]"
          animate={prefersReducedMotion ? undefined : { y: [0, -5, 0], rotate: [0, 0.45, 0] }}
          transition={prefersReducedMotion ? undefined : { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: (index % 4) * 0.35 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Image
            src="/app/images/menu-card-brush.png"
            alt=""
            fill
            sizes="246px"
            className="translate-y-[1px] scale-[1.08] object-contain opacity-70 transition group-hover:opacity-82 group-focus-within:opacity-82"
            aria-hidden="true"
            unoptimized
          />
          {item.image ? (
            <Image src={item.image} alt={item.image_alt || item.name || 'Menu item'} fill sizes="246px" className="-translate-y-[6px] scale-[1.1] object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.22)]" />
          ) : null}
        </motion.div>
        <div className="-mt-[2px]">
          <h3 className="font-display text-[27px] font-black leading-[0.95] tracking-normal">{item.name}</h3>
          {item.category_name ? <p className="mt-[6px] text-[13px] font-semibold leading-none text-white/65 transition group-hover:text-black group-focus-within:text-black">{item.category_name}</p> : null}
          {item.description ? <p className="mt-[17px] line-clamp-3 max-w-[222px] text-[12px] font-semibold leading-[1.42] text-white/60 transition group-hover:text-black/85 group-focus-within:text-black/85">{item.description}</p> : null}
        </div>
        <div className="mt-auto flex items-center gap-[8px] pt-[20px]">
          <button
            type="button"
            onClick={() => {
              addItem(item);
              router.push('/cart');
            }}
            className="inline-flex h-[38px] w-[126px] items-center justify-center gap-[8px] border border-white/75 bg-transparent font-display text-[12px] font-medium uppercase text-white transition group-hover:bg-white group-hover:text-[#f68b24] group-focus-within:bg-white group-focus-within:text-[#f68b24]"
          >
            <Image src="/app/images/menu-card-whatsapp.png" alt="" width={15} height={15} className="h-[15px] w-[15px] object-contain" unoptimized />
            Buy Now
          </button>
          <button type="button" onClick={() => addItem(item)} className="inline-flex h-[38px] w-[38px] items-center justify-center border border-white/75">
            <Image src="/app/images/menu-card-bag.png" alt="" width={15} height={15} className="h-[15px] w-[15px] object-contain" unoptimized />
          </button>
          <div className="ml-auto font-display text-[27px] font-medium leading-none text-white">{item.price}</div>
        </div>
      </div>
    </motion.article>
  );
}

function FloatingBubbles() {
  const bubbles = [
    { left: '7%', top: '42%', size: 42, delay: 0, duration: 8.8, opacity: 0.22 },
    { left: '18%', top: '74%', size: 16, delay: 1.2, duration: 7.4, opacity: 0.18 },
    { left: '31%', top: '30%', size: 10, delay: 0.6, duration: 6.6, opacity: 0.22 },
    { left: '64%', top: '36%', size: 18, delay: 1.8, duration: 9.2, opacity: 0.16 },
    { left: '79%', top: '68%', size: 52, delay: 0.3, duration: 10.4, opacity: 0.12 },
    { left: '91%', top: '48%', size: 13, delay: 2.1, duration: 7.8, opacity: 0.22 },
    { left: '43%', top: '83%', size: 26, delay: 1.5, duration: 8.6, opacity: 0.14 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block">
      {bubbles.map((bubble) => (
        <motion.span
          key={`${bubble.left}-${bubble.top}`}
          className="absolute rounded-full bg-white/20 blur-[1px]"
          style={{
            left: bubble.left,
            top: bubble.top,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
          }}
          animate={{
            y: [0, -34, 0],
            x: [0, 12, -6, 0],
            scale: [1, 1.08, 0.94, 1],
            opacity: [bubble.opacity * 0.55, bubble.opacity, bubble.opacity * 0.65],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: bubble.delay,
          }}
        />
      ))}
    </div>
  );
}

function MenuThreeAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden opacity-45 lg:block">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.35} />
        <AmbientStars />
      </Canvas>
    </div>
  );
}

function AmbientStars() {
  const groupRef = useRef<Group | null>(null);

  useFrame(({ clock, mouse }) => {
    if (!groupRef.current) {
      return;
    }

    const time = clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.035 + mouse.x * 0.08;
    groupRef.current.rotation.x = Math.sin(time * 0.28) * 0.035 + mouse.y * 0.05;
  });

  return (
    <group ref={groupRef}>
      <Stars radius={28} depth={16} count={360} factor={1.15} saturation={0} fade speed={0.22} />
      <mesh position={[-2.8, 1.2, -2]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#f68b24" transparent opacity={0.65} />
      </mesh>
      <mesh position={[3.1, -0.8, -1.5]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
