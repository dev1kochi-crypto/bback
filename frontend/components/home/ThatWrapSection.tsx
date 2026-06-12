'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import type { SitePayload } from '@/types/site';

const assets = {
  topBrush: '/app/images/Mask group-1.png',
  wrapPhoto: '/app/images/2fc39ea21e584be1e3df9fabb0c17ebcdd9aba8e.jpg',
  tomato: '/app/images/demo-pizza-parlor-home-bg-02.jpg 1.png',
  pizza: '/app/images/global-ft-pic2 1.png',
  burgerIcon: '/app/images/streamline-plump_burger.png',
  heartIcon: '/app/images/Group 51.png',
};

const whatsappMessage = `Hi! 😊 Thanks for contacting us. Our menu is ready for you
 🍽️ 
Share your order & location; we’ll handle the rest!`;

interface ThatWrapSectionProps {
  site: SitePayload;
}

interface WrapCopyProps {
  ctaExternal: boolean;
  ctaHref: string;
  prefersReducedMotion: boolean | null;
  titleY: ReturnType<typeof useTransform<number, number>>;
}

export function ThatWrapSection({ site }: ThatWrapSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 85, damping: 24, mass: 0.35 });
  const wrapX = useTransform(smooth, [0, 0.45, 1], [74, 0, -22]);
  const wrapScale = useTransform(smooth, [0, 0.45, 1], [0.95, 1, 1.035]);
  const pizzaY = useTransform(smooth, [0, 1], [34, -36]);
  const tomatoY = useTransform(smooth, [0, 1], [-22, 28]);
  const titleY = useTransform(smooth, [0, 1], [24, -14]);
  const whatsappHref = buildWhatsAppHref(site.footer.social.whatsapp ?? site.whatsapp, whatsappMessage);
  const ctaHref = whatsappHref ?? '/contact';
  const ctaExternal = Boolean(whatsappHref);

  return (
    <section
      ref={ref}
      className="that-wrap-section relative overflow-hidden bg-[#050505] px-5 py-[76px] text-white sm:px-8 sm:py-[96px] lg:px-10 lg:py-[118px] xl:px-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-black" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/app/images/Mask group (18).jpg')] bg-cover bg-center opacity-[0.14]" />
      <Image
        src={assets.topBrush}
        alt=""
        width={1920}
        height={140}
        className="that-wrap-section__top-brush pointer-events-none absolute left-0 top-0 h-[116px] w-full object-fill opacity-90 sm:h-[142px] lg:h-[164px]"
      />

      <motion.div
        className="that-wrap-section__tomato pointer-events-none absolute left-[-78px] top-[56px] z-[4] hidden w-[142px] sm:block md:left-[-36px] md:top-[70px] md:w-[168px] lg:left-[-20px] lg:top-[82px] lg:w-[190px]"
        style={prefersReducedMotion ? undefined : { y: tomatoY }}
        animate={prefersReducedMotion ? undefined : { rotate: [0, -4, 2, 0] }}
        transition={prefersReducedMotion ? undefined : { duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image src={assets.tomato} alt="" width={220} height={282} className="h-auto w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.45)]" />
      </motion.div>

      <motion.div
        className="that-wrap-section__pizza pointer-events-none absolute bottom-[52px] left-[-40px] z-[4] hidden w-[220px] sm:block md:bottom-[56px] md:left-[1%] md:w-[260px] lg:bottom-[60px] lg:left-[2%] lg:w-[310px] xl:bottom-[64px] xl:left-[4%] xl:w-[360px]"
        style={prefersReducedMotion ? undefined : { y: pizzaY }}
        animate={prefersReducedMotion ? undefined : { rotate: [0, 1.8, -1.2, 0] }}
        transition={prefersReducedMotion ? undefined : { duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image src={assets.pizza} alt="" width={432} height={432} className="h-auto w-full object-contain drop-shadow-[0_22px_32px_rgba(0,0,0,0.5)]" />
      </motion.div>

      <motion.div
        className="that-wrap-section__photo pointer-events-none absolute right-0 z-[2] hidden md:block"
        style={prefersReducedMotion ? undefined : { x: wrapX, scale: wrapScale }}
        initial={prefersReducedMotion ? false : { opacity: 0, x: 90, filter: 'blur(10px)' }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, filter: 'blur(0px)' }}
        viewport={{ once: false, amount: 0.28 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src={assets.wrapPhoto}
          alt=""
          fill
          sizes="(min-width: 1280px) 52vw, 46vw"
          className="that-wrap-section__photo-img object-cover object-[58%_52%]"
        />
      </motion.div>

      <div className="that-wrap-section__content relative z-[5] mx-auto flex min-h-[500px] max-w-[1480px] items-center justify-center sm:min-h-[540px] md:min-h-[470px] lg:min-h-[500px]">
        <div className="absolute inset-x-[-34px] bottom-[-36px] h-[290px] md:hidden">
          <Image src={assets.wrapPhoto} alt="" fill sizes="100vw" className="object-cover object-[44%_58%] opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/35 to-black/80" />
        </div>

        <WrapCopy titleY={titleY} prefersReducedMotion={prefersReducedMotion} ctaHref={ctaHref} ctaExternal={ctaExternal} />
      </div>
    </section>
  );
}

function WrapCopy({ ctaExternal, ctaHref, prefersReducedMotion, titleY }: WrapCopyProps) {
  return (
    <motion.div
      className="that-wrap-section__copy relative z-10 mx-auto flex w-full max-w-[520px] flex-col items-center text-center"
      style={prefersReducedMotion ? undefined : { y: titleY }}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28, filter: 'blur(8px)' }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.35 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="font-title text-[58px] font-normal uppercase leading-[0.88] text-white sm:text-[74px] lg:text-[80px] xl:text-[88px]">
        That&apos;s
        <span className="mt-1 block font-display text-[60px] font-black lowercase leading-[0.92] text-ember sm:text-[82px] lg:text-[92px] xl:text-[100px]">a wrap!</span>
      </h2>

      <div className="mt-6 grid w-[min(100%,520px)] grid-cols-[1fr_auto_1fr] items-center gap-3 sm:mt-7 sm:gap-4">
        <span className="h-px bg-ember/70" />
        <span className="inline-flex h-10 w-10 items-center justify-center border border-ember bg-black/70 text-ember shadow-[0_0_24px_rgba(246,139,36,0.28)] sm:h-12 sm:w-12">
          <Image src={assets.burgerIcon} alt="" width={31} height={31} className="h-7 w-7 object-contain sm:h-8 sm:w-8" unoptimized />
        </span>
        <span className="h-px bg-ember/70" />
      </div>

      <p className="mx-auto mt-6 max-w-[360px] font-body text-[13px] font-bold leading-[1.65] text-white sm:mt-7 sm:text-[14px] lg:text-[15px]">
        Enjoy great food &amp; special moments with friends &amp; family at <span className="text-ember">B Back Restaurant.</span>
      </p>
      <Image src={assets.heartIcon} alt="" width={38} height={34} className="mt-5 h-[34px] w-[38px] object-contain" unoptimized />
      <a
        href={ctaHref}
        target={ctaExternal ? '_blank' : undefined}
        rel={ctaExternal ? 'noreferrer' : undefined}
        className="mt-7 inline-flex min-h-11 max-w-full items-center justify-center rounded-full border border-white/35 px-5 py-3 text-center font-body text-[12px] font-medium leading-tight text-white/85 transition hover:border-ember hover:bg-ember hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember sm:px-6 sm:text-[13px]"
      >
        Let&apos;s create something amazing together
      </a>
    </motion.div>
  );
}

function buildWhatsAppHref(value: string | null | undefined, message: string): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      url.searchParams.set('text', message);
      return url.toString();
    } catch {
      return trimmed;
    }
  }

  const phone = trimmed.replace(/[^\d]/g, '');

  if (!phone) {
    return null;
  }

  const url = new URL('https://api.whatsapp.com/send/');
  url.searchParams.set('phone', phone);
  url.searchParams.set('text', message);

  return url.toString();
}
