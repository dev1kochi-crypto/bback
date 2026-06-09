'use client';

import { absoluteAssetUrl } from '@/lib/api';
import type { AboutUsItem, WhyChooseUsSection } from '@/types/about';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

interface HomeWhyChooseUsSectionProps {
  section: WhyChooseUsSection | null;
}

const assets = {
  background: '/app/images/Mask group (18).jpg',
  topBrush: absoluteAssetUrl('/app/images/Mask group-1.png') ?? '/app/images/Mask group-1.png',
  bottomBrush: absoluteAssetUrl('/app/images/Mask group.png') ?? '/app/images/Mask group.png',
  underline: '/app/images/Vector-2.png',
  chefHat: absoluteAssetUrl('/app/images/cap.png') ?? '/app/images/cap.png',
  wrap: absoluteAssetUrl('/app/images/Chicken Shawarma 2.png') ?? '/app/images/Chicken Shawarma 2.png',
  tomatoes: absoluteAssetUrl('/app/images/tomates-cerise 1.png') ?? '/app/images/tomates-cerise 1.png',
  tomato: absoluteAssetUrl('/app/images/Object.png') ?? '/app/images/Object.png',
  leaf: absoluteAssetUrl('/app/images/leaf 1.png') ?? '/app/images/leaf 1.png',
  leafSmall: absoluteAssetUrl('/app/images/leaf 2.png') ?? '/app/images/leaf 2.png',
};

const fallbackIcons = [
  '/app/images/fluent_food-apple-20-regular.png',
  '/app/images/solar_chef-hat-linear.png',
  '/app/images/fluent-emoji-high-contrast_shallow-pan-of-food.png',
  '/app/images/proicons_diamond.png',
  '/app/images/akar-icons_music.png',
  '/app/images/icons8_dining-room.png',
];

export function HomeWhyChooseUsSection({ section }: HomeWhyChooseUsSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 });
  const wrapX = useTransform(smoothProgress, [0, 0.42, 1], [-54, 0, -10]);
  const wrapRotate = useTransform(smoothProgress, [0, 1], [-2.2, 1]);
  const tomatoesY = useTransform(smoothProgress, [0, 1], [-24, 34]);
  const centerY = useTransform(smoothProgress, [0, 1], [18, -18]);
  const contentY = useTransform(smoothProgress, [0, 0.5, 1], [24, 0, -8]);

  if (!section?.display_home) {
    return null;
  }

  const title = section.home_title || section.title;
  const description = section.home_description || section.description;
  const items = (section.items ?? []).filter((item) => hasText(item.line_1) || hasText(item.line_2));

  if (!hasText(title) && !hasText(description) && items.length === 0) {
    return null;
  }

  const visibleItems = items.slice(0, 6);
  const leftItems = visibleItems.slice(0, 3);
  const rightItems = visibleItems.slice(3, 6);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#050505] px-5 pb-[92px] pt-[96px] text-white sm:px-8 sm:pb-[108px] sm:pt-[112px] lg:px-12 lg:pb-[126px] lg:pt-[136px] xl:pb-[138px] xl:pt-[150px]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/app/images/Mask group (18).jpg')] bg-cover bg-center opacity-[0.20]" />
      <Image src={assets.topBrush} alt="" width={1920} height={140} className="pointer-events-none absolute left-0 top-0 h-[92px] w-full object-fill opacity-90 sm:h-[118px] lg:h-[142px]" />
      <Image src={assets.bottomBrush} alt="" width={1920} height={204} className="pointer-events-none absolute bottom-0 left-0 h-[110px] w-full object-fill opacity-90 sm:h-[142px] lg:h-[174px]" />

      <motion.div
        className="pointer-events-none absolute left-[-82px] top-[26%] z-[3] hidden w-[180px] sm:block sm:w-[205px] lg:left-[-86px] lg:top-[28%] lg:w-[218px] xl:left-[-76px] xl:w-[238px] min-[1700px]:w-[286px]"
        style={prefersReducedMotion ? undefined : { x: wrapX, rotate: wrapRotate, transformPerspective: 900 }}
      >
        <Image src={assets.wrap} alt="" width={386} height={306} className="h-auto w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.46)]" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute right-[-42px] top-[8%] z-[3] hidden w-[138px] sm:block lg:right-[18px] lg:w-[178px] xl:right-[54px] xl:w-[205px]"
        style={prefersReducedMotion ? undefined : { y: tomatoesY }}
        animate={prefersReducedMotion ? undefined : { rotate: [0, 2.4, -1.6, 0] }}
        transition={prefersReducedMotion ? undefined : { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image src={assets.tomatoes} alt="" width={260} height={300} className="h-auto w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute bottom-[7%] left-[4%] z-[4] hidden w-[72px] sm:block lg:w-[98px]"
        animate={prefersReducedMotion ? undefined : { y: [0, -16, 0], rotate: [0, -7, 0] }}
        transition={prefersReducedMotion ? undefined : { duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image src={assets.tomato} alt="" width={132} height={132} className="h-auto w-full object-contain drop-shadow-[0_14px_20px_rgba(0,0,0,0.38)]" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-[18%] top-[17%] z-[3] hidden w-[48px] md:block"
        animate={prefersReducedMotion ? undefined : { y: [0, 12, 0], rotate: [0, 11, 0] }}
        transition={prefersReducedMotion ? undefined : { duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        <Image src={assets.leaf} alt="" width={80} height={92} className="h-auto w-full object-contain" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute bottom-[24%] right-[4%] z-[3] hidden w-[66px] lg:block"
        animate={prefersReducedMotion ? undefined : { y: [0, -12, 0], rotate: [0, -10, 0] }}
        transition={prefersReducedMotion ? undefined : { duration: 6.9, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <Image src={assets.leafSmall} alt="" width={108} height={92} className="h-auto w-full object-contain" />
      </motion.div>

      <div className="relative z-[2] mx-auto max-w-[1560px]">
        <motion.div
          className="mx-auto max-w-[980px] text-center"
          style={prefersReducedMotion ? undefined : { y: contentY }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28, filter: 'blur(8px)' }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {hasText(title) ? (
            <h2 className="font-display text-[44px] font-black uppercase leading-[0.94] text-white sm:text-[54px] lg:text-[62px] xl:text-[70px]" dangerouslySetInnerHTML={{ __html: safeBreakHtml(title) }} />
          ) : null}
          <div className="mx-auto mt-3 h-[9px] w-[138px] translate-x-[42px] bg-[url('/app/images/Vector-2.png')] bg-contain bg-center bg-no-repeat sm:w-[176px] sm:translate-x-[74px] max-sm:translate-x-0" />
          {hasText(description) ? (
            <p className="mx-auto mt-6 max-w-[820px] font-body text-[13px] font-semibold leading-[1.58] text-[#a8a8a8] sm:text-[14px]" dangerouslySetInnerHTML={{ __html: safeBreakHtml(description) }} />
          ) : null}
        </motion.div>

        <div className="mt-[46px] grid items-center gap-7 lg:mt-[62px] lg:grid-cols-[minmax(340px,1fr)_minmax(230px,360px)_minmax(340px,1fr)] lg:gap-8 xl:gap-12 lg:max-[1600px]:mt-[48px] xl:max-[1600px]:gap-8">
          <div className="mx-auto w-full max-w-[512px] max-[1600px]:max-w-[448px] lg:ml-auto lg:mr-0">
            {leftItems.map((item, index) => (
              <HomeWhyChooseItem key={item.id} item={item} iconFallback={fallbackIcons[index]} index={index} align="left" />
            ))}
          </div>

          <motion.div
            className="mx-auto flex w-[220px] max-w-full items-center justify-center sm:w-[270px] lg:w-[340px] lg:max-[1600px]:w-[300px] lg:max-[1400px]:w-[270px]"
            style={prefersReducedMotion ? undefined : { y: centerY, transformPerspective: 1100, transformStyle: 'preserve-3d' }}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.82, rotateY: -16 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            animate={prefersReducedMotion ? undefined : { rotate: [0, 1.4, 0], scale: [1, 1.025, 1] }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], rotate: { duration: 5.6, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 5.6, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <Image src={assets.chefHat} alt="" width={430} height={300} className="h-auto w-full object-contain drop-shadow-[0_24px_34px_rgba(255,122,0,0.22)]" />
          </motion.div>

          <div className="mx-auto w-full max-w-[512px] max-[1600px]:max-w-[448px] lg:ml-0 lg:mr-auto">
            {rightItems.map((item, index) => (
              <HomeWhyChooseItem key={item.id} item={item} iconFallback={fallbackIcons[index + leftItems.length]} index={index + leftItems.length} align="right" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeWhyChooseItem({ item, iconFallback, index, align }: { item: AboutUsItem; iconFallback: string; index: number; align: 'left' | 'right' }) {
  const prefersReducedMotion = useReducedMotion();
  const icon = item.icon || iconFallback;

  return (
    <motion.article
      className="relative grid min-h-[78px] grid-cols-[78px_1fr] gap-4 py-[8px] after:absolute after:bottom-0 after:left-[94px] after:right-0 after:h-px after:bg-white/[0.09] first:before:absolute first:before:left-[94px] first:before:right-0 first:before:top-0 first:before:h-px first:before:bg-white/[0.09] sm:min-h-[86px] sm:grid-cols-[112px_1fr] sm:after:left-[128px] sm:first:before:left-[128px] lg:min-h-[92px] lg:py-[10px] lg:max-[1600px]:min-h-[76px] lg:max-[1600px]:grid-cols-[76px_1fr] lg:max-[1600px]:py-[7px] lg:max-[1600px]:after:left-[92px] lg:max-[1600px]:first:before:left-[92px]"
      initial={prefersReducedMotion ? false : { opacity: 0, x: align === 'left' ? -34 : 34, rotateY: align === 'left' ? -7 : 7, filter: 'blur(6px)' }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, rotateY: 0, filter: 'blur(0px)' }}
      whileHover={prefersReducedMotion ? undefined : { x: align === 'left' ? 5 : -5, scale: 1.012 }}
      viewport={{ once: false, amount: 0.45 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 900 }}
    >
      <div className="flex h-full min-h-[64px] items-center justify-center border-r border-white/[0.14] lg:max-[1600px]:min-h-[56px]">
        <motion.div
          className="flex h-[34px] w-[34px] items-center justify-center"
          animate={prefersReducedMotion ? undefined : { y: [0, -4, 0], rotateZ: [0, 2.5, 0] }}
          transition={prefersReducedMotion ? undefined : { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.22 }}
        >
          <Image src={icon} alt={item.icon_alt ?? item.line_1 ?? ''} width={32} height={32} className="h-[23px] w-[23px] object-contain brightness-0 invert sm:h-[26px] sm:w-[26px] lg:max-[1600px]:h-[22px] lg:max-[1600px]:w-[22px]" />
        </motion.div>
      </div>
      <div className="pt-0.5">
        {hasText(item.line_1) ? <h3 className="font-body text-[12px] font-black leading-tight text-white sm:text-[13px] lg:text-[14px] lg:max-[1600px]:text-[12px]">{item.line_1}</h3> : null}
        {hasText(item.line_2) ? <p className="mt-1.5 font-body text-[11px] font-semibold leading-[1.42] text-[#9f9f9f] sm:text-[12px] lg:max-[1600px]:mt-1 lg:max-[1600px]:text-[11px]">{item.line_2}</p> : null}
      </div>
    </motion.article>
  );
}

function hasText(value: string | null | undefined): value is string {
  return Boolean(value && value.replace(/<br\s*\/?>/gi, '').trim());
}

function safeBreakHtml(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br />');
}
