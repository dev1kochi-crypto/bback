'use client';

import type { MenuPayload, MenuItem } from '@/types/menu';
import { useCart } from '@/components/cart/CartProvider';
import { menuCategoryMatches } from '@/lib/api';
import { safeBreakHtml } from '@/lib/cmsText';
import { Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Group } from 'three';

function isSelectedCategory(categoryId: number, activeCategory: number | 'all'): boolean {
  return activeCategory !== 'all' && Number(categoryId) === Number(activeCategory);
}

const CategoryIcon = ({ name }: { name: string }) => {
  const n = name.toLowerCase();
  if (n === 'all') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px] xl:h-[15px] xl:w-[15px]">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (n.includes('sandwich')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px] xl:h-[15px] xl:w-[15px]">
        <path d="m2 12 10-5 10 5-10 5Z" />
        <path d="m2 16 10 5 10-5" />
      </svg>
    );
  }
  if (n.includes('burger')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px] xl:h-[15px] xl:w-[15px]">
        <path d="M4 10a8 8 0 0 1 16 0" />
        <path d="M4 14h16" />
        <path d="M4 14c0 2 2 4 8 4s8-2 8-4" />
        <path d="M3 12h18" />
      </svg>
    );
  }
  if (n.includes('plate') || n.includes('fries')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px] xl:h-[15px] xl:w-[15px]">
        <path d="M4 10h16l-1 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 10Z"/>
        <path d="M8 10V5a2 2 0 0 1 4 0v5"/>
        <path d="M12 10V4a2 2 0 0 1 4 0v6"/>
      </svg>
    );
  }
  if (n.includes('pizza')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px] xl:h-[15px] xl:w-[15px]">
        <path d="M15.4 2.8a2 2 0 0 0-3.3 0L3 15.8a2 2 0 0 0 1.6 3.1h14.8a2 2 0 0 0 1.6-3.1L15.4 2.8Z" />
        <path d="M12 7.5v.01" />
        <path d="M10 11.5v.01" />
        <path d="M14 12.5v.01" />
        <path d="M12 16.5v.01" />
      </svg>
    );
  }
  if (n.includes('snack')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px] xl:h-[15px] xl:w-[15px]">
        <path d="M4.5 4h15"/>
        <path d="M5.5 4l2 16a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2l2-16"/>
        <path d="M8.5 8v8"/>
        <path d="M15.5 8v8"/>
      </svg>
    );
  }
  if (n.includes('appetizer') || n.includes('salad')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px] xl:h-[15px] xl:w-[15px]">
        <path d="M12 10a4 4 0 0 0-4-4 4 4 0 0 1-4-4c0 3 2 4 4 4 0 4 0 4 4 4Z"/>
        <path d="M12 10a4 4 0 0 1 4-4 4 4 0 0 0 4-4c0 3-2 4-4 4 0 4 0 4-4 4Z"/>
        <path d="M4 12h16a8 8 0 0 1-16 0Z"/>
      </svg>
    );
  }
  if (n.includes('sauce')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px] xl:h-[15px] xl:w-[15px]">
        <path d="M10 2h4"/>
        <path d="M12 2v4"/>
        <path d="M9 6h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/>
        <path d="M10 12h4"/>
      </svg>
    );
  }
  return null;
};

interface MenuShowcaseSectionProps {
  menu: MenuPayload;
  variant?: 'home' | 'listing';
}

export function MenuShowcaseSection({ menu, variant = 'home' }: MenuShowcaseSectionProps) {
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [foodFilter, setFoodFilter] = useState<'all' | MenuItem['food_type']>('all');
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [homePageSize, setHomePageSize] = useState(4);
  const [homePage, setHomePage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(16);
  const sectionRef = useRef<HTMLElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const homeSliderTouchStartX = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const disableCardRevealMotion = Boolean(prefersReducedMotion || isMobileViewport);
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
  const pageSize = variant === 'home' ? homePageSize : 16;
  const isHomeSingleSlide = variant === 'home' && homePageSize === 1;
  const visibleCategories = useMemo(() => menu.categories.slice(0, 5), [menu.categories]);
  const activeCategoryLabel = activeCategory === 'all'
    ? 'All Categories'
    : menu.categories.find((category) => isSelectedCategory(category.id, activeCategory))?.name || 'All Categories';
  const activeExtraFilterCount = (foodFilter === 'all' ? 0 : 1) + (spicyOnly ? 1 : 0) + (activeCategory !== 'all' && !visibleCategories.some((category) => isSelectedCategory(category.id, activeCategory)) ? 1 : 0);

  const filteredItems = useMemo(() => {
    return menu.items.filter((item) => {
      const matchesCategory = menuCategoryMatches(item.category_id, activeCategory);
      const matchesFoodType = foodFilter === 'all' || item.food_type === foodFilter;
      const matchesSpicy = !spicyOnly || item.spicy;

      return matchesCategory && matchesFoodType && matchesSpicy;
    });
  }, [activeCategory, foodFilter, menu.items, spicyOnly]);

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
  }, [activeCategory, foodFilter, spicyOnly, variant, homePageSize]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)');
    const syncMobileViewport = () => setIsMobileViewport(query.matches);

    syncMobileViewport();
    query.addEventListener('change', syncMobileViewport);

    return () => query.removeEventListener('change', syncMobileViewport);
  }, []);

  useEffect(() => {
    const syncHomePageSize = () => {
      const width = window.innerWidth;

      if (width >= 1024) {
        setHomePageSize(4);
      } else if (width >= 768) {
        setHomePageSize(2);
      } else {
        setHomePageSize(1);
      }
    };

    syncHomePageSize();
    window.addEventListener('resize', syncHomePageSize);

    return () => window.removeEventListener('resize', syncHomePageSize);
  }, []);

  const goToHomePage = (page: number) => {
    setHomePage((page + totalPages) % totalPages);
  };

  const handleHomeSliderTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    homeSliderTouchStartX.current = event.touches[0]?.clientX ?? 0;
  };

  const handleHomeSliderTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isHomeSingleSlide || totalPages <= 1) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? 0;
    const deltaX = homeSliderTouchStartX.current - touchEndX;

    if (Math.abs(deltaX) < 48) {
      return;
    }

    if (deltaX > 0) {
      goToHomePage(homePage + 1);
      return;
    }

    goToHomePage(homePage - 1);
  };

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
      className={`special-menu relative overflow-x-clip bg-[#050505] px-5 pb-[92px] text-white sm:px-10 lg:overflow-x-visible lg:px-16 ${variant === 'home' ? 'pt-12 sm:pt-[190px] lg:pb-[120px] lg:pt-[245px]' : 'py-[56px] sm:py-[76px] lg:py-[120px]'
        }`}
      onPointerMove={prefersReducedMotion ? undefined : handlePointerMove}
    >
      {variant === 'home' ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[150px] bg-[#080c0d] sm:h-[172px] lg:h-[220px]" />
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
          className="special-menu__fajita pointer-events-none absolute right-[0px] top-[64px] z-20 hidden h-[250px] w-[470px] lg:block xl:top-[68px] xl:h-[300px] xl:w-[560px]"
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
          <h2 className="mt-2 font-display text-[clamp(2.45rem,4.4vw,5.1rem)] font-black uppercase leading-none text-white">
            {title}
          </h2>
          <div className="mx-auto mt-5 h-[10px] w-[170px] translate-x-[64px] bg-[url('/app/images/Vector-2.png')] bg-contain bg-center bg-no-repeat max-sm:translate-x-0" />
          {description ? (
            <p
              className="mx-auto mt-5 max-w-[860px] text-[14px] leading-[1.65] text-[#9b9b9b] sm:mt-7 sm:text-[17px]"
              dangerouslySetInnerHTML={{ __html: safeBreakHtml(description) }}
            />
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
          className="food-menu sticky top-[70px] z-[100] mt-8 w-full bg-[#050505] py-4 lg:top-[80px]"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          {/* Mobile Dropdown Toggle */}
          <div className="mx-auto flex max-w-[460px] items-center gap-3 lg:hidden">
            <div className="relative min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex w-full items-center justify-between rounded-full bg-[#1b1b1b] px-5 py-3.5 font-display text-[15px] text-white shadow-[0_4px_14px_rgba(0,0,0,0.3)] transition hover:bg-[#2b2b2b]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <CategoryIcon name={activeCategory === 'all' ? 'All' : activeCategoryLabel} />
                  <span className="truncate">{activeCategoryLabel}</span>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              <div className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 flex max-h-[60vh] origin-top flex-col gap-1 overflow-y-auto rounded-[16px] border border-white/10 bg-[#111] p-2 shadow-[0_14px_34px_rgba(0,0,0,0.6)] transition-all duration-300 ${isDropdownOpen ? 'scale-y-100 opacity-100' : 'pointer-events-none scale-y-95 opacity-0'}`}>
                <button
                  type="button"
                  onClick={() => { setActiveCategory('all'); setIsDropdownOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-full px-4 py-3 font-display text-[14px] transition ${activeCategory === 'all' ? 'bg-ember text-white' : 'text-white/70 hover:bg-[#222] hover:text-white'}`}
                >
                  <CategoryIcon name="All" />
                  All Categories
                </button>
                {visibleCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => { setActiveCategory(category.id); setIsDropdownOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-full px-4 py-3 font-display text-[14px] transition ${isSelectedCategory(category.id, activeCategory) ? 'bg-ember text-white' : 'text-white/70 hover:bg-[#222] hover:text-white'}`}
                  >
                    <CategoryIcon name={category.name || ''} />
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`relative inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full font-display text-white transition ${activeExtraFilterCount ? 'bg-ember shadow-[0_10px_24px_rgba(255,122,0,0.28)]' : 'bg-[#1b1b1b] hover:bg-[#2b2b2b]'}`}
              aria-label="Open filters"
            >
              <FilterIcon />
              {activeExtraFilterCount ? <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-black">{activeExtraFilterCount}</span> : null}
            </button>
          </div>

          {/* Desktop Inline Buttons */}
          <div className="hidden flex-wrap items-center justify-center gap-3 lg:flex">
            <motion.button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={activeCategory === 'all' ? categoryActiveClass : categoryClass}
              whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            >
              <CategoryIcon name="All" />
              All
            </motion.button>
            {visibleCategories.map((category) => (
              <motion.button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={isSelectedCategory(category.id, activeCategory) ? categoryActiveClass : categoryClass}
                whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
              >
                <CategoryIcon name={category.name || ''} />
                {category.name}
              </motion.button>
            ))}
            <motion.button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition ${activeExtraFilterCount ? 'bg-ember shadow-[0_10px_24px_rgba(255,122,0,0.28)]' : 'bg-[#171b1d] hover:bg-ember'}`}
              whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
              aria-label="Open filters"
            >
              <FilterIcon />
              {activeExtraFilterCount ? <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-black">{activeExtraFilterCount}</span> : null}
            </motion.button>
          </div>
        </motion.div>

        {isFilterDrawerOpen && typeof document !== 'undefined' ? createPortal(
          <div className="fixed inset-0 z-[9999]">
            <button
              type="button"
              className="absolute inset-0 bg-black/75"
              aria-label="Close filters"
              onClick={() => setIsFilterDrawerOpen(false)}
            />
            <motion.aside
              className="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col overflow-hidden border-l border-white/10 bg-[#050707] bg-[url('/app/images/Mask group (18).jpg')] bg-cover bg-center text-white shadow-[-22px_0_60px_rgba(0,0,0,0.72)]"
              initial={prefersReducedMotion ? false : { x: 420 }}
              animate={prefersReducedMotion ? undefined : { x: 0 }}
              exit={prefersReducedMotion ? undefined : { x: 420 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[#050707]/92" />
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-5">
                <h3 className="font-display text-[24px] font-black uppercase leading-none">Filters</h3>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-ember"
                  aria-label="Close filters"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6">
                <div>
                  <p className="font-display text-[13px] uppercase text-white/45">Categories</p>
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveCategory('all')}
                      className={`flex h-11 items-center gap-3 rounded-full px-4 font-display text-[14px] transition ${activeCategory === 'all' ? 'bg-ember text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
                    >
                      <CategoryIcon name="All" />
                      All Categories
                    </button>
                    {menu.categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex h-11 items-center gap-3 rounded-full px-4 font-display text-[14px] transition ${isSelectedCategory(category.id, activeCategory) ? 'bg-ember text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
                      >
                        <CategoryIcon name={category.name || ''} />
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <p className="font-display text-[13px] uppercase text-white/45">Food Type</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { label: 'All', value: 'all' as const },
                      { label: 'Veg', value: 'veg' as const },
                      { label: 'Non Veg', value: 'non_veg' as const },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFoodFilter(option.value)}
                        className={`h-11 rounded-full font-display text-[13px] transition ${foodFilter === option.value ? 'bg-ember text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <p className="font-display text-[13px] uppercase text-white/45">Spicy</p>
                  <button
                    type="button"
                    onClick={() => setSpicyOnly((current) => !current)}
                    className={`mt-4 flex h-11 w-full items-center justify-between rounded-full px-4 font-display text-[14px] transition ${spicyOnly ? 'bg-ember text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
                  >
                    <span className="flex items-center gap-2">
                      <Image src="/app/images/chilli.svg" alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" unoptimized />
                      Spicy items only
                    </span>
                    <span className={`h-5 w-5 rounded-full border ${spicyOnly ? 'border-white bg-white' : 'border-white/35'}`} />
                  </button>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-3 border-t border-white/10 bg-[#050707]/82 p-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setFoodFilter('all');
                    setSpicyOnly(false);
                  }}
                  className="h-11 border border-white/20 font-display text-[13px] uppercase text-white transition hover:border-white hover:bg-white hover:text-black"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="h-11 bg-ember font-display text-[13px] uppercase text-white transition hover:bg-white hover:text-black"
                >
                  Apply
                </button>
              </div>
            </motion.aside>
          </div>,
          document.body,
        ) : null}

        {visibleItems.length ? (
          isHomeSingleSlide ? (
            <div
              className="home-menu-slider mx-auto mt-9 w-full max-w-[320px] touch-pan-y lg:mt-12"
              onTouchStart={handleHomeSliderTouchStart}
              onTouchEnd={handleHomeSliderTouchEnd}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${homePage}-${visibleItems[0]?.id}`}
                  className="flex justify-center"
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 36 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: -36 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <MenuCard
                    item={visibleItems[0]}
                    variant={variant}
                    index={0}
                    disableRevealMotion={disableCardRevealMotion}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              className={
                variant === 'home'
                  ? 'mx-auto mt-9 md:grid md:max-w-[min(100%,640px)] md:grid-cols-2 md:justify-items-stretch md:gap-x-3 md:gap-y-5 md:px-1 lg:mt-12 lg:flex lg:max-w-none lg:flex-wrap lg:items-stretch lg:justify-center lg:gap-6'
                  : 'mx-auto mt-10 grid max-w-[1280px] justify-items-center gap-x-7 gap-y-9 max-sm:mt-6 max-sm:gap-y-3 max-sm:px-4 sm:grid-cols-2 lg:grid-cols-4'
              }
              initial={false}
              animate={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.12 }}
              transition={{ duration: 0.4 }}
              style={prefersReducedMotion || variant === 'listing' ? undefined : { y: gridY }}
            >
              {visibleItems.map((item, index) => (
                variant === 'listing' ? (
                  <div key={item.id} className="w-full">
                    <div className="sm:hidden">
                      <MenuListingMobileCard item={item} />
                    </div>
                    <div className="hidden sm:block">
                      <MenuCard item={item} variant={variant} index={index} disableRevealMotion={disableCardRevealMotion} />
                    </div>
                  </div>
                ) : (
                  <MenuCard key={item.id} item={item} variant={variant} index={index} disableRevealMotion={disableCardRevealMotion} />
                )
              ))}
            </motion.div>
          )
        ) : null}

        {variant === 'home' && totalPages > 1 ? (
          <div className={`flex items-center justify-center ${isHomeSingleSlide ? 'mt-8 gap-10' : 'mt-12 gap-[28px]'}`}>
            <motion.button
              type="button"
              onClick={() => goToHomePage(homePage - 1)}
              className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#1c1c1c] text-white transition hover:bg-ember"
              aria-label="Previous menu items"
              whileHover={prefersReducedMotion ? undefined : { x: -2, scale: 1.05 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14" fill="none" className="scale-x-[-1]">
                <path d="M17.3644 5.93621C17.5519 6.12374 17.6572 6.37805 17.6572 6.64321C17.6572 6.90838 17.5519 7.16268 17.3644 7.35021L11.7074 13.0072C11.6152 13.1027 11.5048 13.1789 11.3828 13.2313C11.2608 13.2837 11.1296 13.3113 10.9968 13.3125C10.8641 13.3136 10.7324 13.2883 10.6095 13.238C10.4866 13.1878 10.3749 13.1135 10.281 13.0196C10.1872 12.9257 10.1129 12.8141 10.0626 12.6912C10.0123 12.5683 9.98704 12.4366 9.98819 12.3038C9.98934 12.171 10.0169 12.0398 10.0693 11.9178C10.1217 11.7958 10.1979 11.6855 10.2934 11.5932L14.2434 7.64321L1.00044 7.64321C0.735224 7.64321 0.480869 7.53785 0.293333 7.35032C0.105797 7.16278 0.000440598 6.90843 0.000440598 6.64321C0.000440598 6.378 0.105797 6.12364 0.293333 5.93611C0.480869 5.74857 0.735224 5.64321 1.00044 5.64321L14.2434 5.64321L10.2934 1.69321C10.1113 1.50461 10.0105 1.25201 10.0128 0.989811C10.015 0.727614 10.1202 0.476801 10.3056 0.291393C10.491 0.105986 10.7418 0.000815392 11.004 -0.00146294C11.2662 -0.00374126 11.5188 0.0970526 11.7074 0.279211L17.3644 5.93621Z" fill="currentColor" />
              </svg>
            </motion.button>
            {!isHomeSingleSlide ? (
              <div className="flex items-center gap-[14px]">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => setHomePage(index)}
                    className={`flex h-[24px] w-[24px] items-center justify-center rounded-full border transition-colors ${homePage === index ? 'border-ember' : 'border-white/20 hover:border-white/40'
                      }`}
                    aria-label={`Show menu page ${index + 1}`}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                  >
                    <span className={`block h-[12px] w-[12px] rounded-full transition-colors ${homePage === index ? 'bg-ember' : 'bg-[#8a8a8a]'}`} />
                  </motion.button>
                ))}
              </div>
            ) : null}
            <motion.button
              type="button"
              onClick={() => goToHomePage(homePage + 1)}
              className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#1c1c1c] text-white transition hover:bg-ember"
              aria-label="Next menu items"
              whileHover={prefersReducedMotion ? undefined : { x: 2, scale: 1.05 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path d="M17.3644 5.93621C17.5519 6.12374 17.6572 6.37805 17.6572 6.64321C17.6572 6.90838 17.5519 7.16268 17.3644 7.35021L11.7074 13.0072C11.6152 13.1027 11.5048 13.1789 11.3828 13.2313C11.2608 13.2837 11.1296 13.3113 10.9968 13.3125C10.8641 13.3136 10.7324 13.2883 10.6095 13.238C10.4866 13.1878 10.3749 13.1135 10.281 13.0196C10.1872 12.9257 10.1129 12.8141 10.0626 12.6912C10.0123 12.5683 9.98704 12.4366 9.98819 12.3038C9.98934 12.171 10.0169 12.0398 10.0693 11.9178C10.1217 11.7958 10.1979 11.6855 10.2934 11.5932L14.2434 7.64321L1.00044 7.64321C0.735224 7.64321 0.480869 7.53785 0.293333 7.35032C0.105797 7.16278 0.000440598 6.90843 0.000440598 6.64321C0.000440598 6.378 0.105797 6.12364 0.293333 5.93611C0.480869 5.74857 0.735224 5.64321 1.00044 5.64321L14.2434 5.64321L10.2934 1.69321C10.1113 1.50461 10.0105 1.25201 10.0128 0.989811C10.015 0.727614 10.1202 0.476801 10.3056 0.291393C10.491 0.105986 10.7418 0.000815392 11.004 -0.00146294C11.2662 -0.00374126 11.5188 0.0970526 11.7074 0.279211L17.3644 5.93621Z" fill="currentColor" />
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

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[15px] w-[15px]">
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function MenuCard({ item, variant, index, disableRevealMotion = false }: { item: MenuItem; variant: 'home' | 'listing'; index: number; disableRevealMotion?: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion || disableRevealMotion;
  const { addItem } = useCart();
  const router = useRouter();
  const floatDelay = (index % 4) * 0.35;
  const hasOfferPrice = Boolean(item.offer_price);

  return (
    <motion.article
      className="group relative flex min-h-[452px] w-full overflow-visible rounded-[12px] border border-dashed border-white/20 bg-[#0A0D0F] px-[22px] pb-[21px] pt-[15px] text-white outline-none transition-transform duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-[#f68b24] focus-within:-translate-y-1 focus-within:border-transparent focus-within:bg-[#f68b24] sm:max-w-[280px]"
      initial={
        shouldReduceMotion
          ? false
          : {
            opacity: 0,
            y: 34,
            rotateX: 7,
            scale: 0.96,
            filter: 'blur(12px)',
          }
      }
      animate={shouldReduceMotion ? { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: 'blur(0px)' } : undefined}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: [0, -5, 0], rotateX: 0, scale: 1, filter: 'blur(0px)' }}
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
      <div className="pointer-events-none absolute -left-[0] -right-[0] -top-[30px] z-0 h-[53px] hidden group-hover:block group-focus-within:block">
        <Image src="/app/images/hover-bg.png" alt="" fill sizes="340px" className="object-fill" unoptimized priority />
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
          <div className="mt-[8px] flex flex-wrap items-center gap-2">
            {item.category_name ? <p className="text-[13px] font-semibold leading-none text-white/65 transition group-hover:text-black group-focus-within:text-black">{item.category_name}</p> : null}
            <MenuAttributeBadge type={item.food_type} />
            {item.spicy ? <SpicyBadge /> : null}
          </div>
          {item.description ? (
            <p
              className="mt-[17px] line-clamp-3 max-w-[222px] text-[12px] font-semibold leading-[1.42] text-white/60 transition group-hover:text-black/85 group-focus-within:text-black/85"
              dangerouslySetInnerHTML={{ __html: safeBreakHtml(item.description) }}
            />
          ) : null}
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
          <div className="ml-auto flex flex-col items-end gap-1 font-display leading-none text-white">
            {hasOfferPrice ? (
              <span className="text-[14px] font-medium text-white/45 line-through transition group-hover:text-black/55 group-focus-within:text-black/55">
                {formatMenuPrice(item.price)}
              </span>
            ) : null}
            <span className="text-[27px] font-medium">
              {formatMenuPrice(item.offer_price || item.price)}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function MenuListingMobileCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();
  const router = useRouter();
  const hasOfferPrice = Boolean(item.offer_price);

  return (
    <article className="group relative flex w-full items-stretch gap-3 overflow-hidden rounded-[14px] border border-white/12 bg-[#0d1012] p-3 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] outline-none transition-[background-color,border-color] duration-300 active:border-transparent active:bg-[#f68b24]">
      <div className="relative h-[88px] w-[88px] shrink-0 rounded-[10px] bg-[#14181b]">
        <Image
          src="/app/images/menu-card-brush.png"
          alt=""
          fill
          sizes="88px"
          className="scale-[1.15] object-contain opacity-55"
          aria-hidden="true"
          unoptimized
        />
        {item.image ? (
          <Image src={item.image} alt={item.image_alt || item.name || 'Menu item'} fill sizes="88px" className="scale-[1.05] object-contain object-center drop-shadow-[0_8px_12px_rgba(0,0,0,0.22)]" />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-[17px] font-black leading-[1.1] tracking-normal">{item.name}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {item.category_name ? <p className="text-[11px] font-semibold leading-none text-white/65">{item.category_name}</p> : null}
                <MenuAttributeBadge type={item.food_type} />
                {item.spicy ? <SpicyBadge /> : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5 font-display leading-none text-white">
              {hasOfferPrice ? (
                <span className="text-[11px] font-medium text-white/45 line-through">
                  {formatMenuPrice(item.price)}
                </span>
              ) : null}
              <span className="text-[18px] font-semibold">
                {formatMenuPrice(item.offer_price || item.price)}
              </span>
            </div>
          </div>
          {item.description ? (
            <p
              className="mt-2 line-clamp-2 text-[11px] font-semibold leading-[1.35] text-white/60"
              dangerouslySetInnerHTML={{ __html: safeBreakHtml(item.description) }}
            />
          ) : null}
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              addItem(item);
              router.push('/cart');
            }}
            className="inline-flex h-[32px] items-center justify-center gap-1.5 border border-white/75 bg-transparent px-2.5 font-display text-[10px] font-medium uppercase text-white"
          >
            <Image src="/app/images/menu-card-whatsapp.png" alt="" width={13} height={13} className="h-[13px] w-[13px] object-contain" unoptimized />
            Buy Now
          </button>
          <button type="button" onClick={() => addItem(item)} className="inline-flex h-[32px] w-[32px] items-center justify-center border border-white/75">
            <Image src="/app/images/menu-card-bag.png" alt="" width={13} height={13} className="h-[13px] w-[13px] object-contain" unoptimized />
          </button>
        </div>
      </div>
    </article>
  );
}

function MenuAttributeBadge({ type }: { type: MenuItem['food_type'] }) {
  const isVeg = type === 'veg';

  return (
    <span
      className={`inline-flex h-[16px] w-[16px] items-center justify-center border transition ${
      isVeg
        ? 'border-[#54c86a]'
        : 'border-[#ef4444]'
      }`}
      title={isVeg ? 'Veg' : 'Non Veg'}
      aria-label={isVeg ? 'Veg' : 'Non Veg'}
    >
      <span className={`h-[7px] w-[7px] rounded-full ${isVeg ? 'bg-[#54c86a]' : 'bg-[#ef4444]'}`} />
    </span>
  );
}

function SpicyBadge() {
  return (
    <span className="inline-flex h-[18px] w-[18px] items-center justify-center" title="Spicy" aria-label="Spicy">
      <Image src="/app/images/chilli.svg" alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" unoptimized />
    </span>
  );
}

function formatMenuPrice(price: string): string {
  const numericPrice = Number(price);

  return Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : price;
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
