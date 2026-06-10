'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

const assets = {
  background: '/app/images/Mask group (18).jpg',
  topBrush: '/app/images/Mask group-1.png',
  wrapPhoto: '/app/images/2fc39ea21e584be1e3df9fabb0c17ebcdd9aba8e.jpg',
  tomato: '/app/images/demo-pizza-parlor-home-bg-02.jpg 1.png',
  pizza: '/app/images/global-ft-pic2 1.png',
};

function WrapCopy({
  titleY,
  prefersReducedMotion,
  align = 'center',
  buttonClassName,
}: {
  titleY: ReturnType<typeof useTransform<number, number>>;
  prefersReducedMotion: boolean | null;
  align?: 'center' | 'left';
  buttonClassName?: string;
}) {
  return (
    <motion.div
      className={`mx-auto max-w-[520px] ${align === 'center' ? 'text-center' : 'text-left'}`}
      style={prefersReducedMotion ? undefined : { y: titleY }}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28, filter: 'blur(8px)' }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.35 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="font-title text-[58px] font-normal uppercase leading-[0.9] text-white sm:text-[74px] lg:text-[84px]">
        That&apos;s
        <span className="mt-1 block font-display text-[60px] font-black lowercase leading-none text-ember sm:text-[82px] lg:text-[96px]">a wrap!</span>
      </h2>

      <div className={`mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 ${align === 'left' ? 'max-w-[340px]' : ''}`}>
        <span className="h-px bg-ember/70" />
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ember text-ember">
          <span className="h-3 w-4 rounded-[4px] border border-current before:block before:h-px before:w-full before:translate-y-[4px] before:bg-current after:block after:h-px after:w-full after:translate-y-[7px] after:bg-current" />
        </span>
        <span className="h-px bg-ember/70" />
      </div>

      <p className={`mx-auto mt-8 max-w-[330px] font-body text-[14px] font-bold leading-[1.5] text-white ${align === 'left' ? 'md:mx-0' : ''}`}>
        Enjoy great food &amp; special moments with friends &amp; family at <span className="text-ember">B Back Restaurant.</span>
      </p>
      <div className={`mt-6 font-display text-[42px] leading-none text-ember ${align === 'left' ? 'md:text-left' : ''}`}>♡</div>
      <a
        href="/contact"
        className={
          buttonClassName
          ?? 'mt-7 inline-flex h-11 items-center justify-center rounded-full border border-white/35 px-6 font-body text-[13px] font-medium text-white/85 transition hover:border-ember hover:bg-ember hover:text-white'
        }
      >
        Let&apos;s create something amazing together
      </a>
    </motion.div>
  );
}

export function ThatWrapSection() {
  const ref = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 85, damping: 24, mass: 0.35 });
  const wrapX = useTransform(smooth, [0, 0.45, 1], [54, 0, -20]);
  const wrapScale = useTransform(smooth, [0, 0.45, 1], [0.96, 1, 1.035]);
  const pizzaY = useTransform(smooth, [0, 1], [28, -34]);
  const tomatoY = useTransform(smooth, [0, 1], [-22, 28]);
  const titleY = useTransform(smooth, [0, 1], [24, -14]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#050505] px-5 py-[84px] text-white sm:px-8 sm:py-[104px] lg:px-12 lg:py-[126px]">
      <div className="pointer-events-none absolute inset-0 bg-black" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/app/images/Mask group (18).jpg')] bg-cover bg-center opacity-[0.18]" />
      <Image src={assets.topBrush} alt="" width={1920} height={140} className="pointer-events-none absolute left-0 top-0 h-[116px] w-full object-fill opacity-90 sm:h-[142px] lg:h-[164px]" />

      <motion.div
        className="pointer-events-none absolute left-[-80px] top-[84px] z-[3] hidden w-[150px] sm:block lg:left-[-18px] lg:top-[92px] lg:w-[190px]"
        style={prefersReducedMotion ? undefined : { y: tomatoY }}
        animate={prefersReducedMotion ? undefined : { rotate: [0, -4, 2, 0] }}
        transition={prefersReducedMotion ? undefined : { duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image src={assets.tomato} alt="" width={220} height={282} className="h-auto w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.45)]" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute left-[7%] top-[35%] z-[4] hidden w-[230px] sm:block lg:left-[8%] lg:top-[42%] lg:w-[310px] xl:left-[9%] xl:w-[360px]"
        style={prefersReducedMotion ? undefined : { y: pizzaY }}
        animate={prefersReducedMotion ? undefined : { rotate: [0, 1.8, -1.2, 0] }}
        transition={prefersReducedMotion ? undefined : { duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image src={assets.pizza} alt="" width={432} height={432} className="h-auto w-full object-contain drop-shadow-[0_22px_32px_rgba(0,0,0,0.5)]" />
      </motion.div>

      {/* Desktop only: original overlay image */}
      <motion.div
        className="pointer-events-none absolute bottom-[66px] right-[-86px] z-[2] hidden h-[355px] w-[760px] overflow-hidden bg-black lg:block lg:right-[-34px] lg:w-[860px] xl:right-[10px] xl:w-[914px]"
        style={prefersReducedMotion ? undefined : { x: wrapX, scale: wrapScale }}
        initial={prefersReducedMotion ? false : { opacity: 0, x: 90, filter: 'blur(10px)' }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, filter: 'blur(0px)' }}
        viewport={{ once: false, amount: 0.28 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image src={assets.wrapPhoto} alt="" fill sizes="914px" className="object-cover object-[50%_55%]" />
        <div className="absolute inset-y-0 left-0 w-[43%] bg-gradient-to-r from-black via-black/78 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[10%] bg-gradient-to-l from-black/35 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[25%] bg-gradient-to-b from-black/82 via-black/34 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/82 via-black/30 to-transparent" />
      </motion.div>

      {/* Mobile: original centered copy */}
      <div className="relative z-[5] mx-auto flex min-h-[430px] max-w-[1480px] items-center justify-center md:hidden">
        <WrapCopy titleY={titleY} prefersReducedMotion={prefersReducedMotion} />
      </div>

      {/* Tablet only: split panel for readable text */}
      <div className="relative z-[5] mx-auto hidden max-w-[1480px] md:block lg:hidden">
        <div className="grid items-stretch overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#080808] md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col justify-center px-8 py-12">
            <WrapCopy
              titleY={titleY}
              prefersReducedMotion={prefersReducedMotion}
              align="left"
              buttonClassName="mt-8 inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-white bg-white px-6 font-body text-[13px] font-bold uppercase tracking-[0.04em] text-[#050505] transition hover:border-ember hover:bg-ember hover:text-white"
            />
          </div>

          <motion.div
            className="relative min-h-[400px] bg-black"
            style={prefersReducedMotion ? undefined : { scale: wrapScale }}
            initial={prefersReducedMotion ? false : { opacity: 0, x: 40, filter: 'blur(8px)' }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.28 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image src={assets.wrapPhoto} alt="Grilled chicken wrap" fill sizes="50vw" className="object-cover object-center" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[18%] bg-gradient-to-r from-[#080808] to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* Desktop: original centered copy */}
      <div className="relative z-[5] mx-auto hidden min-h-[430px] max-w-[1480px] items-center justify-center lg:flex">
        <WrapCopy titleY={titleY} prefersReducedMotion={prefersReducedMotion} />
      </div>
    </section>
  );
}
