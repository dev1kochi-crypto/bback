'use client';

import type { AboutUsContent } from '@/types/about';
import { motion, useReducedMotion } from 'framer-motion';

interface AboutValuesSectionProps {
  about: AboutUsContent | null;
}

const cards = [
  { key: 'mission', title: 'Mission', field: 'mission' },
  { key: 'vision', title: 'Vision', field: 'vision' },
  { key: 'core_value', title: 'Core Value', field: 'core_value' },
] as const;

export function AboutValuesSection({ about }: AboutValuesSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#000] px-6 pb-[80px] pt-[48px] text-white sm:px-10 sm:pb-[92px] sm:pt-[60px] lg:px-16 lg:pb-[104px] lg:pt-[68px]">
      {!prefersReducedMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-x-[12%] top-0 h-[260px] rounded-full bg-[radial-gradient(circle,rgba(246,139,36,0.08),transparent_72%)] blur-3xl"
          animate={{ opacity: [0.18, 0.38, 0.18], scale: [1, 1.08, 1] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
      <div className="mx-auto grid max-w-[1480px] gap-12 text-center md:grid-cols-3 lg:gap-[150px]">
        {cards.map((card, index) => (
          <motion.article
            key={card.key}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28, rotateX: 5, filter: 'blur(8px)' }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: [0, -5, 0], rotateX: 0, filter: 'blur(0px)' }}
            whileHover={prefersReducedMotion ? undefined : { y: -8, rotateX: 2, scale: 1.015 }}
            viewport={{ once: false, amount: 0.28 }}
            transition={{
              opacity: { duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.45 },
              rotateX: { duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
              filter: { duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
            }}
            className="mx-auto max-w-[450px]"
            style={{ transformPerspective: 1000, transformStyle: 'preserve-3d' }}
          >
            <ValueBadge title={card.title} />
            <p className="mx-auto mt-9 max-w-[430px] text-center text-[16px] leading-[1.42] text-[#9f9f9f] sm:mt-[48px] sm:text-[18px] lg:mt-[58px] lg:text-[20px] lg:leading-[1.38]">
              {about?.[card.field] || `Add ${card.title.toLowerCase()} content in the About Us admin module.`}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function ValueBadge({ title }: { title: string }) {
  return (
    <div className="relative mx-auto h-[96px] w-[232px] sm:h-[108px] sm:w-[262px] lg:h-[118px] lg:w-[286px]">
     <svg xmlns="http://www.w3.org/2000/svg" width="251" height="112" viewBox="0 0 251 112" fill="none">
  <path d="M178.7 12.3698C197.16 11.7698 227.83 20.9198 241.01 34.1398C265.5 58.7298 222.27 80.3198 203.58 88.2298C158.16 107.43 101.56 113.45 52.8301 106.48C27.4901 102.85 -16.2899 91.2098 11.3201 58.4798C33.4501 32.2198 87.6001 15.1198 120.73 8.69977C154.47 2.15977 190.42 -0.140233 224.03 6.39977L223 8.38977C216.11 7.38977 209.03 5.94977 202.09 5.41977C149.64 1.43977 61.2001 16.9798 21.2701 53.5198C-10.9899 83.0398 17.7501 98.0098 47.9701 103.35C97.1501 112.05 157.84 105.6 203.56 85.2498C229.94 73.4998 266.21 49.5998 224.53 26.7298C210.32 18.9298 197.92 16.5098 182.15 14.3698C180.66 14.1698 179.08 14.2398 178.69 12.3698H178.7Z" fill="#F68B24"/>
</svg>
      <h3 className="absolute inset-0 flex items-center justify-center pb-1 font-display text-[28px] font-black uppercase leading-none text-white sm:text-[32px] lg:text-[35px]">
        {title}
      </h3>
    </div>
  );
}
