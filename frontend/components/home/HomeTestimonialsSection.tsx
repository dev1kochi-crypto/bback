'use client';

import { absoluteAssetUrl } from '@/lib/api';
import type { TestimonialItem, TestimonialsPayload } from '@/types/testimonial';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

interface HomeTestimonialsSectionProps {
  payload: TestimonialsPayload;
}

const assets = {
  background: '/app/images/Mask group (18).jpg',
  underline: '/app/images/Vector-2.png',
  arrow: '/app/images/testimonial-arrow.png',
  quote: '/app/images/testimonial-quote.png',
};

export function HomeTestimonialsSection({ payload }: HomeTestimonialsSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const section = payload.section;
  const items = useMemo(() => (payload.items ?? []).filter(hasTestimonialContent), [payload.items]);

  useEffect(() => {
    if (prefersReducedMotion || items.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [items.length, prefersReducedMotion]);

  if (!section?.display_home || items.length === 0) {
    return null;
  }

  const active = items[Math.min(activeIndex, items.length - 1)];
  const title = section.sub_heading_1 || 'Satisfied Customers';
  const eyebrow = section.title || 'Food Lovers';
  const description = section.description;

  const goPrevious = () => setActiveIndex((current) => (current - 1 + items.length) % items.length);
  const goNext = () => setActiveIndex((current) => (current + 1) % items.length);

  return (
    <section className="relative isolate overflow-hidden bg-[#050505] px-5 py-[78px] text-white sm:px-8 sm:py-[90px] lg:px-12 lg:py-[112px]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/app/images/Mask group (18).jpg')] bg-cover bg-center opacity-[0.20]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[10%] z-[1] overflow-hidden text-center font-display text-[96px] font-black uppercase leading-none text-black/55 sm:text-[150px] lg:text-[210px] xl:text-[230px]">
        Satisfied
      </div>

      <div className="relative z-[2] mx-auto grid max-w-[1560px] items-center gap-10 lg:grid-cols-[minmax(280px,0.72fr)_minmax(260px,0.62fr)_minmax(420px,1fr)] lg:gap-12 xl:gap-16">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: -32, filter: 'blur(8px)' }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {hasText(eyebrow) ? <p className="font-body text-[13px] font-semibold leading-none text-[#9b9b9b]">{plainText(eyebrow)}</p> : null}
          {hasText(title) ? (
            <h2
              className="mt-2 max-w-[390px] font-display text-[48px] font-black uppercase leading-[1.04] text-white sm:text-[58px] lg:text-[62px] xl:text-[70px]"
              dangerouslySetInnerHTML={{ __html: safeBreakHtml(title) }}
            />
          ) : null}
          <div className="mt-4 h-[10px] w-[160px] translate-x-[74px] bg-[url('/app/images/Vector-2.png')] bg-contain bg-center bg-no-repeat" />
          {hasText(description) ? (
            <div className="mt-8 max-w-[360px] font-body text-[13px] font-medium leading-[1.58] text-[#a7a7a7]" dangerouslySetInnerHTML={{ __html: cleanCmsHtml(description) }} />
          ) : null}

          {items.length > 1 ? (
            <div className="mt-9 flex items-center gap-3">
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={goPrevious}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-body text-[18px] font-black text-white transition hover:bg-primary hover:text-white"
              >
                <Image src={assets.arrow} alt="" width={18} height={18} className="h-[16px] w-[16px] rotate-180 object-contain brightness-0 invert" />
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                onClick={goNext}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-body text-[18px] font-black text-[#050505] transition hover:bg-primary hover:text-white"
              >
                <Image src={assets.arrow} alt="" width={18} height={18} className="h-[16px] w-[16px] object-contain" />
              </button>
            </div>
          ) : null}
        </motion.div>

        <div className="relative mx-auto flex min-h-[250px] w-full items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="relative w-[158px] sm:w-[176px]"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24, rotateY: -18, scale: 0.92 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, rotateY: 0, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -18, rotateY: 16, scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1000 }}
            >
              <div className="absolute left-[18px] top-[-14px] z-0 h-[calc(100%+20px)] w-[calc(100%+4px)] rotate-[6deg] rounded-[6px] bg-[#18232c]" />
              <div className="relative z-10 rounded-[6px] bg-white p-[6px] pb-[38px] shadow-[0_22px_38px_rgba(0,0,0,0.42)] sm:p-[7px] sm:pb-[42px]">
                <div className="absolute -left-[24px] -top-[18px] z-20 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#ff8a18] p-[10px] shadow-[0_14px_26px_rgba(255,138,24,0.42)]">
                  <Image src={assets.quote} alt="" width={26} height={26} className="h-full w-full object-contain brightness-0 invert" />
                </div>
                <div className="relative aspect-[1.12] overflow-hidden rounded-[4px] bg-[#101010]">
                  {active.image ? (
                    <Image src={absoluteAssetUrl(active.image) ?? active.image} alt={active.image_alt || active.name || 'Customer'} fill sizes="176px" className="object-cover object-center" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#151515] font-display text-[52px] uppercase text-primary">{initials(active.name)}</div>
                  )}
                </div>
                <p className="absolute bottom-[8px] left-0 right-0 z-20 text-center text-[27px] leading-none text-[#101010] sm:text-[30px]" style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive' }}>
                  Amazing
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            className="grid gap-8 border-l-0 border-dotted border-white/45 pl-0 lg:border-l-[6px] lg:pl-10 xl:pl-12"
            initial={prefersReducedMotion ? false : { opacity: 0, x: 36, filter: 'blur(8px)' }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20, filter: 'blur(6px)' }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            {hasText(active.content) ? (
              <div className="max-w-[620px] font-body text-[14px] font-medium leading-[1.68] text-[#b9b9b9]" dangerouslySetInnerHTML={{ __html: cleanCmsHtml(active.content) }} />
            ) : null}
            <div>
              {hasText(active.name) ? <h3 className="font-body text-[14px] font-black leading-tight text-white">{active.name}</h3> : null}
              {hasText(active.designation) ? <p className="mt-1 font-body text-[12px] font-semibold leading-tight text-[#888]">{active.designation}</p> : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function hasTestimonialContent(item: TestimonialItem): boolean {
  return hasText(item.name) || hasText(item.content) || Boolean(item.image);
}

function initials(value: string | null | undefined): string {
  return (value ?? 'BB')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
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

function plainText(value: string): string {
  return value
    .replace(/&lt;\s*br\s*\/?\s*&gt;/gi, ' ')
    .replace(/<\s*br\s*\/?\s*>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanCmsHtml(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br />');
}
