'use client';

import { absoluteAssetUrl } from '@/lib/api';
import type { AboutUsItem, WhyChooseUsSection as WhyChooseUsSectionData } from '@/types/about';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

interface WhyChooseUsSectionProps {
  section: WhyChooseUsSectionData | null;
}

const chefHat = absoluteAssetUrl('/app/images/cap.png') ?? '/app/images/cap.png';
const topBrush = absoluteAssetUrl('/app/images/Mask group-1.png') ?? '/app/images/Mask group-1.png';
const bottomBrush = absoluteAssetUrl('/app/images/Mask group.png') ?? '/app/images/Mask group.png';

const fallbackItems: AboutUsItem[] = [
  {
    id: 1,
    icon: absoluteAssetUrl('/app/images/fluent_food-apple-20-regular.png') ?? '/app/images/fluent_food-apple-20-regular.png',
    icon_alt: 'Fresh food',
    line_1: 'Always serve fresh food',
    line_2: 'Perfectly portioned ingredients.',
    sort_order: 1,
  },
  {
    id: 2,
    icon: absoluteAssetUrl('/app/images/solar_chef-hat-linear.png') ?? '/app/images/solar_chef-hat-linear.png',
    icon_alt: 'Chef',
    line_1: 'We have popular masterchef',
    line_2: 'The patient staff reflects the style.',
    sort_order: 2,
  },
  {
    id: 3,
    icon: absoluteAssetUrl('/app/images/fluent-emoji-high-contrast_shallow-pan-of-food.png') ?? '/app/images/fluent-emoji-high-contrast_shallow-pan-of-food.png',
    icon_alt: 'Recipes',
    line_1: 'Delicious recipes',
    line_2: 'Best crust with this good recipe.',
    sort_order: 3,
  },
  {
    id: 4,
    icon: absoluteAssetUrl('/app/images/proicons_diamond.png') ?? '/app/images/proicons_diamond.png',
    icon_alt: 'Quality',
    line_1: 'Maintaining the quality of food',
    line_2: 'Standardized food recipes for menu.',
    sort_order: 4,
  },
  {
    id: 5,
    icon: absoluteAssetUrl('/app/images/akar-icons_music.png') ?? '/app/images/akar-icons_music.png',
    icon_alt: 'Music',
    line_1: 'Best live music restaurants',
    line_2: 'Beautiful natural and serene ambience.',
    sort_order: 5,
  },
  {
    id: 6,
    icon: absoluteAssetUrl('/app/images/icons8_dining-room.png') ?? '/app/images/icons8_dining-room.png',
    icon_alt: 'Dining',
    line_1: 'Wonderful dining experience',
    line_2: 'A memorable dining atmosphere.',
    sort_order: 6,
  },
];

export function WhyChooseUsSection({ section }: WhyChooseUsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const topBrushY = useTransform(scrollYProgress, [0, 1], [-32, 34]);
  const bottomBrushY = useTransform(scrollYProgress, [0, 1], [34, -32]);
  const chefY = useTransform(scrollYProgress, [0, 1], [28, -34]);
  const items = section?.items?.length ? section.items : fallbackItems;
  const leftItems = items.slice(0, 3);
  const rightItems = items.slice(3, 6);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black px-6 pb-[96px] pt-[118px] text-white sm:px-10 sm:pb-[128px] sm:pt-[150px] lg:px-16 lg:pb-[180px] lg:pt-[198px]">
      <div className="absolute inset-x-0 bottom-[96px] top-[96px] bg-[#071011] sm:bottom-[128px] sm:top-[128px] lg:bottom-[150px] lg:top-[152px]" />
      {!prefersReducedMotion ? (
        <>
          <motion.div
            className="pointer-events-none absolute left-[8%] top-[30%] z-[1] h-8 w-8 rounded-full bg-white/10 blur-[1px]"
            animate={{ y: [0, -38, 0], x: [0, 14, 0], opacity: [0.12, 0.3, 0.12] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute right-[11%] top-[60%] z-[1] h-4 w-4 rounded-full bg-ember/30 blur-[1px]"
            animate={{ y: [0, 28, 0], x: [0, -10, 0], opacity: [0.16, 0.42, 0.16] }}
            transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          />
        </>
      ) : null}
      <motion.div className="pointer-events-none absolute left-0 top-0 z-[1] h-[118px] w-full sm:h-[162px] lg:h-[205px]" style={prefersReducedMotion ? undefined : { y: topBrushY }}>
        <Image src={topBrush} alt="" width={1920} height={139} className="h-full w-full object-fill opacity-100" />
      </motion.div>
      <motion.div className="pointer-events-none absolute bottom-0 left-0 z-[1] h-[148px] w-full sm:h-[190px] lg:h-[238px]" style={prefersReducedMotion ? undefined : { y: bottomBrushY }}>
        <Image src={bottomBrush} alt="" width={1920} height={204} className="h-full w-full object-fill opacity-100" />
      </motion.div>

      <div className="relative z-[2] mx-auto max-w-[1640px]">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-[980px] text-center"
        >
          <h2 className="font-display text-[clamp(2.7rem,9vw,4rem)] font-black uppercase leading-none text-white lg:text-[clamp(3.2rem,4.5vw,5.15rem)]">
            {section?.title || 'Why Choose Us'}
          </h2>
          <div className="mx-auto mt-4 h-[10px] w-[150px] translate-x-[42px] bg-[url('/app/images/Vector-2.png')] bg-contain bg-center bg-no-repeat sm:mt-6 sm:h-[14px] sm:w-[206px] sm:translate-x-[86px] max-md:translate-x-0" />
          <p className="mx-auto mt-6 max-w-[900px] text-[15px] leading-[1.64] text-[#9b9b9b] sm:mt-8 sm:text-[18px]">
            {section?.description ||
              'We combine fresh ingredients, careful recipes, friendly service, and a memorable dining atmosphere for every guest.'}
          </p>
        </motion.div>

        <div className="mt-[54px] grid gap-8 sm:mt-[72px] sm:gap-10 lg:mt-[92px] lg:grid-cols-[minmax(430px,1fr)_430px_minmax(430px,1fr)] lg:items-center lg:gap-[92px]">
          <div className="space-y-0">
            {leftItems.map((item, index) => (
              <FeatureItem key={item.id} item={item} index={index} />
            ))}
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92, rotateY: -8 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex h-[190px] w-[270px] max-w-full items-center justify-center sm:h-[240px] sm:w-[340px] lg:h-[300px] lg:w-[420px]"
            style={prefersReducedMotion ? undefined : { y: chefY, transformPerspective: 1000, transformStyle: 'preserve-3d' }}
            animate={prefersReducedMotion ? undefined : { rotate: [0, 1.2, 0] }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.04, rotateY: 4 }}
          >
            <Image src={chefHat} alt="Chef hat" width={420} height={280} className="h-auto w-full object-contain" />
          </motion.div>

          <div className="space-y-0">
            {rightItems.map((item, index) => (
              <FeatureItem key={item.id} item={item} index={index + leftItems.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ item, index }: { item: AboutUsItem; index: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18, rotateX: 4, filter: 'blur(6px)' }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
      whileHover={prefersReducedMotion ? undefined : { x: 6, scale: 1.012 }}
      viewport={{ once: false, amount: 0.45 }}
      transition={{ duration: 0.55, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-[52px_1fr] gap-4 border-b border-white/10 py-[18px] first:border-t sm:grid-cols-[64px_1fr] sm:gap-5 sm:py-[22px] lg:grid-cols-[72px_1fr] lg:gap-6 lg:py-[24px]"
      style={{ transformPerspective: 900 }}
    >
      <div className="flex h-12 items-center justify-center sm:h-14">
        {item.icon ? (
          <motion.div
            animate={prefersReducedMotion ? undefined : { y: [0, -4, 0], rotate: [0, 2, 0] }}
            transition={prefersReducedMotion ? undefined : { duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 }}
          >
            <Image src={item.icon} alt={item.icon_alt ?? item.line_1 ?? ''} width={48} height={48} className="h-9 w-9 object-contain opacity-90 sm:h-10 sm:w-10 lg:h-11 lg:w-11" />
          </motion.div>
        ) : null}
      </div>
      <div>
        <h3 className="text-[17px] font-black leading-tight text-white sm:text-[18px] lg:text-[20px]">{item.line_1}</h3>
        <p className="mt-2 text-[14px] leading-[1.42] text-[#9b9b9b] sm:text-[15px] lg:text-[17px]">{item.line_2}</p>
      </div>
    </motion.article>
  );
}
