'use client';

import { absoluteAssetUrl } from '@/lib/api';
import type { Banner } from '@/types/banner';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MagneticButton } from './MagneticButton';

gsap.registerPlugin(ScrollTrigger);

interface CinematicHeroProps {
  banners: Banner[];
}

const layoutClassMap: Record<string, string> = {
  center: 'w-[70vw] max-w-[920px] translate-x-[4vw] lg:w-[58vw]',
  wide: 'w-[86vw] max-w-[1180px] translate-x-[8vw] lg:w-[70vw]',
  right: 'w-[76vw] max-w-[960px] translate-x-[12vw] lg:w-[62vw]',
};

export function CinematicHero({ banners }: CinematicHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const activeBanner = banners[activeIndex];
  const staticTomatoImage = absoluteAssetUrl('/app/images/revslider_h2-tomato 1.png') ?? '/app/images/revslider_h2-tomato 1.png';
  const staticMushroomImage = absoluteAssetUrl('/app/images/revslider_h2-mushroom 1.png') ?? '/app/images/revslider_h2-mushroom 1.png';
  const staticMushroomImage2 = absoluteAssetUrl('/app/images/revslider_h2-mushroom 2.png') ?? '/app/images/revslider_h2-mushroom 2.png';

  const resolved = useMemo(() => {
    if (!activeBanner) {
      return null;
    }

    return {
      image: absoluteAssetUrl(activeBanner.image),
      secondaryImage: absoluteAssetUrl(activeBanner.secondary_image),
      backgroundImage: absoluteAssetUrl(activeBanner.background_image),
      logoImage: absoluteAssetUrl(activeBanner.logo_image),
      badgeImage: absoluteAssetUrl(activeBanner.badge_image),
      crumbImage: absoluteAssetUrl(activeBanner.crumb_image),
      floatingImages: activeBanner.floating_images.map(absoluteAssetUrl).filter(Boolean) as string[],
      scale: (activeBanner.food_scale ?? 100) / 100,
    };
  }, [activeBanner]);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % banners.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [banners.length, isPaused]);

  function goToSlide(index: number) {
    if (index === activeIndex) {
      return;
    }

    setActiveIndex(index);
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        '.hero-chrome',
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power4.out', stagger: 0.08 },
      );

      gsap.set('.hero-food-scene', { transformPerspective: 1200, transformOrigin: '50% 50%' });

      const heroTimeline = gsap.timeline({ defaults: { ease: 'power4.out' } });

      heroTimeline
        .fromTo(
          '.hero-copy-back',
          { y: 74, opacity: 0, scale: 0.94, filter: 'blur(10px)' },
          { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.05 },
          0.08,
        )
        .fromTo(
          '.hero-copy-title',
          { y: 82, opacity: 0, clipPath: 'inset(100% 0 0 0)', filter: 'blur(8px)' },
          { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', filter: 'blur(0px)', duration: 1.18, stagger: 0.06 },
          0.22,
        )
        .fromTo(
          '.hero-food-scene',
          { x: 170, y: 48, rotateY: -22, rotateZ: -3, scale: 0.84, opacity: 0, filter: 'blur(14px)' },
          { x: 0, y: 0, rotateY: 0, rotateZ: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.35, ease: 'expo.out' },
          0.36,
        );

      gsap.to('.hero-food-scene', {
        y: -12,
        rotateZ: 0.8,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.45,
      });

      gsap.to('.float-layer', {
        y: -18,
        rotate: 2,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.28,
      });

      gsap.to(root, {
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
        },
        '--scroll-depth': 1,
      });
    }, root);

    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!imageRef.current || !textRef.current) {
      return;
    }

    const foodScene = imageRef.current.querySelector('.hero-food-scene');

    const context = gsap.context(() => {
      gsap.fromTo(
        foodScene,
        { opacity: 0, x: 130, y: 34, rotateY: -18, rotateZ: -2.5, scale: 0.9, filter: 'blur(14px)' },
        { opacity: 1, x: 0, y: 0, rotateY: 0, rotateZ: 0, scale: 1, filter: 'blur(0px)', duration: 1.15, ease: 'expo.out' },
      );

      gsap.fromTo(
        textRef.current?.querySelectorAll('.slide-text') ?? [],
        { y: 62, opacity: 0, clipPath: 'inset(100% 0 0 0)', filter: 'blur(8px)' },
        { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', filter: 'blur(0px)', duration: 1.05, ease: 'power4.out', stagger: 0.05 },
      );

      gsap.fromTo(
        '.hero-dot-active',
        { scale: 0.7, boxShadow: '0 0 0 rgba(245,154,35,0)' },
        { scale: 1, boxShadow: '0 0 28px rgba(245,154,35,0.72)', duration: 0.45, ease: 'back.out(2)' },
      );
    }, rootRef);

    return () => context.revert();
  }, [activeIndex]);

  if (!activeBanner || !resolved) {
    return (
      <section className="grid min-h-screen place-items-center bg-charcoal px-6 text-center text-cream">
        <p className="text-sm uppercase tracking-normal text-white/50">No active banners available.</p>
      </section>
    );
  }

  const title = activeBanner.title || '';
  const subtitle = activeBanner.subtitle || '';
  const foodLayout = layoutClassMap[activeBanner.food_layout] ?? layoutClassMap.center;
  const topFontSize = title.length >= 9
    ? 'clamp(3.5rem, 16.4vw, 34rem)'
    : title.length >= 8
      ? 'clamp(4rem, 17.2vw, 35rem)'
      : 'clamp(4.5rem, 18vw, 36rem)';
  const bottomFontSize = subtitle.length >= 9
    ? 'clamp(3rem, 13.2vw, 27rem)'
    : subtitle.length >= 8
      ? 'clamp(3.5rem, 14vw, 28rem)'
      : 'clamp(4rem, 14.8vw, 29rem)';



  return (
    <section
      ref={rootRef}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: (event.clientX / rect.width - 0.5) * 2,
          y: (event.clientY / rect.height - 0.5) * -2,
        });
      }}
      className="home-hero relative min-h-screen select-none overflow-hidden bg-charcoal text-cream [--scroll-depth:0]"
    >
      {resolved.backgroundImage ? (
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={resolved.backgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-100"
          />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(245,154,35,0.18),transparent_25%),radial-gradient(circle_at_8%_50%,rgba(0,0,0,0.78),transparent_36%),radial-gradient(circle_at_92%_50%,rgba(0,0,0,0.82),transparent_36%)]" />
      <div className="cinematic-noise pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="float-layer absolute h-1.5 w-1.5 rounded-full bg-ember/70 shadow-glow"
            style={{
              left: `${8 + ((index * 17) % 84)}%`,
              top: `${15 + ((index * 29) % 70)}%`,
              opacity: 0.2 + (index % 5) * 0.09,
              transform: `translate3d(${pointer.x * (index % 6)}px, ${pointer.y * (index % 7)}px, 0)`,
            }}
          />
        ))}
      </div>

      <div className="home-hero__shell pointer-events-none relative z-20 flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="home-hero__stage relative flex flex-1 items-center justify-center banner-wrapper">
          <div
            className="pointer-events-auto absolute left-0 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-4 lg:flex"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => goToSlide(index)}
                className={[
                  'relative grid h-8 w-8 place-items-center rounded-full border-2 transition duration-300',
                  index === activeIndex
                    ? 'hero-dot-active border-ember bg-ember/10 shadow-glow'
                    : 'border-white/60 bg-transparent hover:border-ember',
                ].join(' ')}
                aria-label={`Go to banner ${index + 1}`}
                aria-current={index === activeIndex}
              >
                <span className={index === activeIndex ? 'block h-3 w-3 rounded-full bg-ember' : 'block h-3 w-3 rounded-full bg-white/70'} />
              </button>
            ))}
          </div>

          <div ref={textRef} className="home-hero__copy pointer-events-none absolute inset-x-0 top-[13%] mx-auto h-[76vh] w-full max-w-none text-center lg:top-[13%]">
            <div
              className="slide-text hero-copy hero-copy-back hero-back-word absolute inset-x-0 top-[55%] z-[12] px-[3.4vw] font-display font-normal uppercase leading-[0.8] tracking-[0.015em]"
              style={{ fontSize: bottomFontSize }}
            >
              {subtitle}
            </div>
            <h1
              className="slide-text hero-copy hero-copy-title hero-main-word absolute inset-x-0 top-0 z-[20] px-[3.4vw] font-display font-normal uppercase leading-[1] tracking-[0.015em]"
              style={{ fontSize: topFontSize }}
            >
              {title}
            </h1>
            <h1
              className="slide-text hero-copy hero-copy-title hero-outline-word absolute inset-x-0 top-0 z-[38] px-[3.4vw] font-display font-normal uppercase leading-[1] tracking-[0.015em]"
              style={{ fontSize: topFontSize }}
            >
              {title}
            </h1>
            <h1
              className="slide-text hero-copy hero-copy-title hero-light-word absolute inset-x-0 top-0 z-[39] px-[3.4vw] font-display font-normal uppercase leading-[1] tracking-[0.015em]"
              style={{ fontSize: topFontSize }}
            >
              {title}
            </h1>
          </div>

          {/* Mobile floating decor */}
          <motion.div
            className="pointer-events-none absolute left-[2%] top-[18%] z-10 h-14 w-14 opacity-80 md:hidden"
            animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image src={staticTomatoImage} alt="" fill sizes="56px" className="object-contain" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute right-[4%] top-[28%] z-10 h-12 w-12 opacity-75 md:hidden"
            animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          >
            <Image src={staticMushroomImage} alt="" fill sizes="48px" className="object-contain" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute bottom-[22%] left-[6%] z-10 h-11 w-11 opacity-70 md:hidden"
            animate={{ y: [0, -7, 0], x: [0, 4, 0] }}
            transition={{ duration: 6.1, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            <Image src={staticMushroomImage2} alt="" fill sizes="44px" className="object-contain" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute bottom-[18%] right-[8%] z-10 h-10 w-10 opacity-65 md:hidden"
            animate={{ y: [0, 9, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
          >
            <Image src={staticTomatoImage} alt="" fill sizes="40px" className="object-contain blur-[0.5px]" />
          </motion.div>

          <div
            ref={imageRef}
            className="home-hero__food hero-food relative z-30 mt-[4.25rem] flex w-full justify-center will-change-transform lg:mt-[5.25rem]"
            style={{
              transform: `translate3d(${pointer.x * 18}px, ${pointer.y * -10}px, 0) scale(${resolved.scale})`,
            }}
          >
            {resolved.image ? (
              <div className={`hero-food-scene relative aspect-[16/9] ${foodLayout}`}>
                <Image
                  src={resolved.image}
                  alt={activeBanner.image_alt ?? title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 70vw, 92vw"
                  className="object-contain drop-shadow-[0_48px_80px_rgba(0,0,0,0.68)]"
                />
              </div>
            ) : null}
          </div>

          <motion.div
            className="absolute left-[10%] top-[55%] z-40 hidden h-80 w-80 -translate-y-1/2 items-center justify-center p-9 text-center md:flex"
            animate={{ rotate: [0, -2, 2, 0], y: [0, -8, 0] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            {resolved.badgeImage ? (
              <Image src={resolved.badgeImage} alt="" fill sizes="20rem" className="object-contain" />
            ) : null}
            <p className="slide-text relative z-10 max-w-52 text-2xl font-black leading-tight text-white">{activeBanner.description}</p>
          </motion.div>

          {resolved.crumbImage ? (
            <div className="float-layer absolute right-0 top-[38%] z-30 hidden h-[360px] w-[130px] lg:block">
              <Image src={resolved.crumbImage} alt="" fill sizes="130px" className="object-contain" />
            </div>
          ) : null}

          {resolved.crumbImage ? (
            <div className="float-layer absolute left-[1%] top-[62%] z-30 hidden h-[280px] w-[120px] rotate-[18deg] lg:block">
              <Image src={resolved.crumbImage} alt="" fill sizes="120px" className="object-contain" />
            </div>
          ) : null}

          <div
            className="float-layer absolute left-[8%] top-[43%] z-20 hidden h-[148px] w-[166px] opacity-90 lg:block"
            style={{
              transform: `translate3d(${pointer.x * 7}px, ${pointer.y * 5}px, 0)`,
              filter: 'blur(2.5px)',
            }}
          >
            <Image src={staticTomatoImage} alt="" fill sizes="166px" className="object-contain" />
          </div>

          <div
            className="float-layer absolute right-[6%] top-[46%] z-20 hidden h-[148px] w-[166px] opacity-90 lg:block"
            style={{
              transform: `translate3d(${pointer.x * 8}px, ${pointer.y * 6}px, 0)`,
              filter: 'blur(2.5px)',
            }}
          >
            <Image src={staticTomatoImage} alt="" fill sizes="166px" className="object-contain" />
          </div>

          {resolved.secondaryImage ? (
            <div className="float-layer absolute right-[13%] top-[24%] z-40 hidden h-32 w-32 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-glow backdrop-blur-lg lg:block">
              <Image src={resolved.secondaryImage} alt="" fill sizes="8rem" className="object-contain p-3" />
            </div>
          ) : null}

          {resolved.floatingImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="float-layer absolute z-20 hidden h-20 w-20 opacity-90 blur-[0.2px] lg:block"
              style={{
                left: `${[0, 95, 80, 86, 9][index] ?? 80}%`,
                top: `${[17, 33, 60, 75, 41][index] ?? 50}%`,
                transform: `translate3d(${pointer.x * (index + 4)}px, ${pointer.y * (index + 3)}px, 0)`,
                filter: index === 0 || index === 4 ? 'blur(3px)' : undefined,
                width: index === 0 || index === 4 ? 150 : 78,
                height: index === 0 || index === 4 ? 150 : 78,
              }}
            >
              <Image src={image} alt="" fill sizes="5rem" className="object-contain" />
            </div>
          ))}
        </div>

        <footer className="hero-chrome pointer-events-auto relative z-40 flex flex-col items-center gap-4 pb-6 md:flex-row md:justify-center">
          {activeBanner.button_text && activeBanner.button_url ? (
            <MagneticButton href={activeBanner.button_url}>{activeBanner.button_text}</MagneticButton>
          ) : null}
          {activeBanner.secondary_button_text && activeBanner.secondary_button_url ? (
            <MagneticButton href={activeBanner.secondary_button_url} variant="outline">
              {activeBanner.secondary_button_text}
            </MagneticButton>
          ) : null}
        </footer>
      </div>
    </section>
  );
}
