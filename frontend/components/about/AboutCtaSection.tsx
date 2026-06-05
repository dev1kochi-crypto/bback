'use client';

import { absoluteAssetUrl } from '@/lib/api';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const cards = [
  {
    title: 'View Menu',
    href: '/menu',
    image: absoluteAssetUrl('/app/images/about1.png') ?? '/app/images/about1.png',
    center: false,
  },
  {
    title: '',
    href: '/offers',
    image: absoluteAssetUrl('/app/images/about2.png') ?? '/app/images/about2.png',
    center: true,
  },
  {
    title: 'Locate Us',
    href: '/contact',
    image: absoluteAssetUrl('/app/images/about3.png') ?? '/app/images/about3.png',
    center: false,
  },
] as const;

export function AboutCtaSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#050505] px-0 pb-[104px] pt-[104px] text-white">
      {!prefersReducedMotion ? (
        <motion.div
          className="pointer-events-none absolute right-[8%] top-[14%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(246,139,36,0.1),transparent_70%)] blur-2xl"
          animate={{ opacity: [0.12, 0.34, 0.12], scale: [1, 1.12, 1] }}
          transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
      <div className="grid w-full gap-0 md:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.href}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 30, rotateX: 5, filter: 'blur(8px)' }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: [0, -5, 0], rotateX: 0, filter: 'blur(0px)' }}
            whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.01 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.65, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 1000, transformStyle: 'preserve-3d' }}
          >
            <Link href={card.href} className="group relative block aspect-[616/367] overflow-hidden bg-[#101010]">
              <Image src={card.image} alt={card.title || 'B-back limited range'} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/8 to-transparent" />
              {card.center ? null : (
                <div className="absolute bottom-[34px] left-[40px] right-[40px]">
                  <h3 className="font-display text-[clamp(2rem,3vw,3.3rem)] font-black uppercase leading-none text-white">{card.title}</h3>
                  <div className="mt-4 h-[3px] w-full bg-white" />
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
