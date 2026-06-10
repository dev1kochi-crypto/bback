'use client';

import { absoluteAssetUrl } from '@/lib/api';
import type { AboutUsContent } from '@/types/about';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const assets = {
  brush: absoluteAssetUrl('/app/images/134314063_c94482cf-37bb-4673-a62b-ed34cfde336c 1.png') ?? '/app/images/134314063_c94482cf-37bb-4673-a62b-ed34cfde336c 1.png',
  burger: absoluteAssetUrl('/app/images/hero-three 2.png') ?? '/app/images/hero-three 2.png',
  pizza: absoluteAssetUrl('/app/images/crispy-mixed-pizza-with-olives-sausage 1.png') ?? '/app/images/crispy-mixed-pizza-with-olives-sausage 1.png',
  friesTop: absoluteAssetUrl('/app/images/floating_fries_01 1.png') ?? '/app/images/floating_fries_01 1.png',
  friesBottom: absoluteAssetUrl('/app/images/floating_fries_02 2.png') ?? '/app/images/floating_fries_02 2.png',
  sketchLarge: absoluteAssetUrl('/app/images/h6_decor-2 1.png') ?? '/app/images/h6_decor-2 1.png',
  sketchSmall: absoluteAssetUrl('/app/images/h6_decor-3 1.png') ?? '/app/images/h6_decor-3 1.png',
  bottomTexture: absoluteAssetUrl('/app/images/Mask group.png') ?? '/app/images/Mask group.png',
  tomato: absoluteAssetUrl('/app/images/revslider_h2-tomato 1.png') ?? '/app/images/revslider_h2-tomato 1.png',
  tomatoes: absoluteAssetUrl('/app/images/tomates-cerise 1.png') ?? '/app/images/tomates-cerise 1.png',
  leaf: absoluteAssetUrl('/app/images/leaf 1.png') ?? '/app/images/leaf 1.png',
  mushroom: absoluteAssetUrl('/app/images/revslider_h2-mushroom 1.png') ?? '/app/images/revslider_h2-mushroom 1.png',
  mushroom2: absoluteAssetUrl('/app/images/revslider_h2-mushroom 2.png') ?? '/app/images/revslider_h2-mushroom 2.png',
};

interface HomeAboutShowcaseProps {
  about: AboutUsContent | null;
}

interface AboutCopyProps {
  line1: string;
  line2: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  variant: 'mobile' | 'desktop';
}

function AboutCopy({ line1, line2, description, buttonText, buttonUrl, variant }: AboutCopyProps) {
  const isMobile = variant === 'mobile';

  return (
    <>
      <p
        className={
          isMobile
            ? 'font-display text-[15px] leading-none text-[#8f8f8f] md:max-lg:text-[16px]'
            : 'font-display text-[20px] leading-none text-[#8f8f8f] lg:text-[16px]'
        }
      >
        {line1}
      </p>
      <h2
        className={
          isMobile
            ? 'mt-2 font-display text-[clamp(2.15rem,9.5vw,2.85rem)] uppercase leading-[0.92] text-white md:max-lg:text-[3.45rem]'
            : 'mt-4 font-display text-[clamp(4.2rem,14vw,7.6rem)] uppercase leading-[0.88] text-white lg:mt-3 lg:text-[76px] xl:text-[88px]'
        }
      >
        {line2}
      </h2>
      <div
        className={
          isMobile
            ? 'mx-auto mt-3 h-[4px] w-[min(72%,11rem)] origin-center -skew-x-[34deg] bg-[#f58214] [clip-path:polygon(4%_38%,100%_0,96%_60%,0_100%)] md:max-lg:w-[14rem]'
            : 'mt-[18px] h-[5px] w-[258px] origin-left -skew-x-[34deg] bg-[#f58214] lg:ml-[148px] lg:mt-[16px] [clip-path:polygon(4%_38%,100%_0,96%_60%,0_100%)]'
        }
      />
      <p
        className={
          isMobile
            ? 'relative z-10 mt-4 text-[14px] leading-[1.7] text-[#dfdfdf] md:max-lg:mx-auto md:max-lg:max-w-[30rem] md:max-lg:text-[15px] md:max-lg:leading-[1.75]'
            : 'relative z-10 mt-[32px] max-w-[420px] text-[15.5px] leading-[1.65] text-[#dfdfdf] [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] lg:mt-[44px] lg:max-w-[390px] lg:text-[15px] lg:leading-[1.75] lg:text-[#9f9f9f] lg:[text-shadow:none]'
        }
      >
        {description}
      </p>
      <a
        href={buttonUrl}
        className={
          isMobile
            ? 'relative z-10 mt-5 inline-flex h-[44px] min-w-[120px] items-center justify-center border border-white/75 bg-transparent px-4 font-display text-[18px] leading-none text-white transition hover:border-[#f58214] hover:bg-[#f58214] hover:text-black md:max-lg:mt-6 md:max-lg:h-[48px] md:max-lg:min-w-[128px]'
            : 'relative z-10 mt-[36px] inline-flex h-[50px] min-w-[130px] items-center justify-center border border-white/75 bg-transparent px-5 font-display text-[22px] leading-none text-white transition hover:border-[#f58214] hover:bg-[#f58214] hover:text-black lg:mt-[34px] lg:h-[42px] lg:min-w-[110px] lg:px-4 lg:text-[17px]'
        }
      >
        {buttonText}
      </a>
    </>
  );
}

export function HomeAboutShowcase({ about }: HomeAboutShowcaseProps) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  if (!about?.display_home) {
    return null;
  }

  const line1 = about?.line_1 ?? 'About Us';
  const line2 = about?.line_2 ?? 'WHO WE ARE';
  const description =
    about?.short_description ??
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
  const buttonText = about?.button_text ?? 'READ MORE';
  const buttonUrl = about?.button_url ?? '/about';

  return (
    <section
      id="about"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: (event.clientX / rect.width - 0.5) * 2,
          y: (event.clientY / rect.height - 0.5) * 2,
        });
      }}
      className="home-about-showcase relative isolate overflow-hidden bg-[#050505] text-white lg:h-[760px] xl:h-[820px]"
    >
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_36%,rgba(255,255,255,0.07),transparent_30%),radial-gradient(circle_at_16%_50%,rgba(0,0,0,0.75),transparent_36%)]" />

      <div className="home-about-showcase__bottom-texture pointer-events-none absolute inset-x-0 bottom-[-30px] z-[1] h-[112px] opacity-70 sm:h-[128px] lg:bottom-[-42px] lg:z-30 lg:h-[170px] lg:opacity-95">
        <Image src={assets.bottomTexture} alt="" fill sizes="100vw" className="object-cover object-bottom" />
      </div>

      {/* Mobile layout */}
      <div className="relative z-10 px-5 pb-7 pt-8 md:max-lg:px-10 md:max-lg:pb-10 md:max-lg:pt-14 lg:hidden">
        <div className="relative mx-auto min-h-[28rem] max-w-[22rem] md:max-lg:min-h-[23rem] md:max-lg:max-w-[38rem]">
          <div className="pointer-events-none absolute inset-x-[-1.25rem] bottom-[-0.5rem] h-[8rem] bg-gradient-to-b from-transparent via-black/40 to-[#050505]" />

          <motion.div
            className="pointer-events-none absolute left-[-1.65rem] top-[0.35rem] z-10 h-[4.8rem] w-[5.2rem]"
            animate={{ y: [0, 8, 0], rotate: [0, -1.4, 0] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image src={assets.pizza} alt="Pizza" fill sizes="84px" className="object-contain object-bottom drop-shadow-[0_8px_18px_rgba(0,0,0,0.55)]" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute right-[-1.65rem] top-[6.7rem] z-10 h-[4rem] w-[2.4rem]"
            animate={{ y: [0, -9, 0], rotate: [0, -2, 0] }}
            transition={{ duration: 6.9, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          >
            <Image src={assets.friesBottom} alt="" fill sizes="42px" className="scale-x-[-1] object-contain object-bottom drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute left-[0.7rem] top-[18.6rem] z-10 h-[3.35rem] w-[3.35rem]"
            animate={{ y: [0, 6, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 4.9, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          >
            <Image src={assets.mushroom} alt="" fill sizes="54px" className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute right-[1.15rem] top-[18.1rem] z-10 h-[2.7rem] w-[2.7rem]"
            animate={{ y: [0, -7, 0], rotate: [0, 6, 0] }}
            transition={{ duration: 5.9, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
          >
            <Image src={assets.leaf} alt="" fill sizes="44px" className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute left-[47%] top-[20.2rem] z-10 h-[3rem] w-[3rem]"
            animate={{ y: [0, -6, 0], x: [0, 3, 0] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          >
            <Image src={assets.mushroom2} alt="" fill sizes="48px" className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute right-[3.6rem] top-[22.8rem] z-10 h-[2.9rem] w-[3.65rem]"
            animate={{ y: [0, -5, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          >
            <Image src={assets.tomatoes} alt="" fill sizes="56px" className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]" />
          </motion.div>

          <motion.div
            className="relative z-20 px-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <AboutCopy
              line1={line1}
              line2={line2}
              description={description}
              buttonText={buttonText}
              buttonUrl={buttonUrl}
              variant="mobile"
            />
          </motion.div>

          <div className="pointer-events-none absolute inset-x-0 bottom-[0.6rem] z-10">
            <div className="flex items-center justify-center gap-8 opacity-45">
              <motion.div
                className="relative h-[2rem] w-[3.5rem]"
                animate={{ y: [0, -4, 0], opacity: [0.72, 0.92, 0.72] }}
                transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image src={assets.sketchSmall} alt="" fill sizes="56px" className="object-contain" />
              </motion.div>
              <motion.div
                className="relative h-[2.25rem] w-[4rem]"
                animate={{ y: [0, 5, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 7.4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
              >
                <Image src={assets.sketchLarge} alt="" fill sizes="64px" className="object-contain" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout — unchanged */}
      <div className="home-about-showcase__desktop relative hidden h-full min-h-[620px] w-full lg:block lg:min-h-0">
        <motion.div
          className="home-about-showcase__pizza pointer-events-none absolute -left-[80px] bottom-[20px] z-20 h-[280px] w-[220px] sm:-left-[120px] sm:bottom-[92px] sm:h-[530px] sm:w-[412px] lg:-left-[90px] lg:bottom-[96px] lg:h-[560px] lg:w-[436px] xl:-left-[64px] xl:h-[620px] xl:w-[482px]"
          animate={{ y: [0, 12, 0], rotate: [0, -1.4, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ x: pointer.x * -10 }}
        >
          <Image src={assets.pizza} alt="Pizza" fill sizes="(max-width: 640px) 220px, 482px" className="object-contain" priority />
        </motion.div>

        <motion.div
          className="home-about-showcase__fries pointer-events-none absolute -left-[34px] top-[-8px] z-20 h-[230px] w-[94px] scale-x-[-1] sm:-left-[18px] sm:h-[280px] sm:w-[113px] lg:left-[10px] lg:top-[18px] lg:h-[300px] lg:w-[122px] xl:left-[28px]"
          animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src={assets.friesTop} alt="" fill sizes="254px" className="object-contain object-top" />
        </motion.div>

        <motion.div
          className="home-about-showcase__sketch-small pointer-events-none absolute left-[18%] top-[27%] z-30 hidden h-[92px] w-[146px] opacity-[0.62] md:block"
          animate={{ y: [0, -8, 0], opacity: [0.58, 0.78, 0.58] }}
          transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src={assets.sketchSmall} alt="" fill sizes="146px" className="object-contain" />
        </motion.div>

        <motion.div
          className="home-about-showcase__sketch-large pointer-events-none absolute bottom-[17%] left-[43%] z-30 hidden h-[102px] w-[138px] opacity-[0.58] lg:block"
          animate={{ y: [0, 9, 0], rotate: [0, -2, 0] }}
          transition={{ duration: 7.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src={assets.sketchLarge} alt="" fill sizes="158px" className="object-contain" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-[8%] left-[16%] z-30 hidden h-[82px] w-[82px] md:block lg:hidden"
          animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 5.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src={assets.leaf} alt="" fill sizes="94px" className="object-contain" />
        </motion.div>

        <motion.div
          className="home-about-showcase__content relative z-40 mx-auto max-w-[480px] pt-40 sm:pt-64 md:pt-32 lg:absolute lg:left-[29%] lg:top-[172px] lg:mx-0 lg:max-w-[430px] lg:pt-0 xl:top-[205px]"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <AboutCopy
            line1={line1}
            line2={line2}
            description={description}
            buttonText={buttonText}
            buttonUrl={buttonUrl}
            variant="desktop"
          />
        </motion.div>

        <motion.div
          className="home-about-showcase__brush pointer-events-none absolute right-[-260px] top-[-22px] z-0 hidden h-[690px] w-[584px] opacity-[0.92] md:block lg:right-[-112px] lg:top-[22px] lg:h-[650px] lg:w-[552px] xl:right-[-80px] xl:h-[720px] xl:w-[610px]"
          animate={{ rotate: [0, 1.6, 0], scale: [1, 1.012, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src={assets.brush} alt="" fill sizes="786px" className="object-contain" priority />
        </motion.div>

        <motion.div
          className="home-about-showcase__burger pointer-events-none absolute -right-[120px] top-[20px] z-20 h-[240px] w-[300px] sm:right-[-190px] sm:top-[120px] sm:h-[455px] sm:w-[568px] md:right-[-156px] md:top-[96px] lg:right-[-136px] lg:top-[92px] lg:h-[570px] lg:w-[712px] xl:right-[-82px] xl:top-[84px] xl:h-[650px] xl:w-[812px]"
          animate={{ y: [0, -10, 0], rotate: [0, 0.6, 0] }}
          transition={{ duration: 7.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ x: pointer.x * 12 }}
        >
          <Image src={assets.burger} alt="Signature burger" fill sizes="(max-width: 640px) 300px, 812px" className="object-contain drop-shadow-[0_44px_80px_rgba(0,0,0,0.78)]" priority />
        </motion.div>

        <motion.div
          className="home-about-showcase__tomato pointer-events-none absolute right-[39%] top-[13%] z-30 hidden h-[94px] w-[106px] opacity-90 blur-[2.5px] lg:block xl:right-[36%]"
          animate={{ y: [0, -14, 0], x: [0, 8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src={assets.tomato} alt="" fill sizes="132px" className="object-contain" />
        </motion.div>
      </div>
    </section>
  );
}
