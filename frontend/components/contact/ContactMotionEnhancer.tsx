
'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';

function splitWords(element: HTMLElement) {
  if (element.dataset.revealReady === 'true') {
    return;
  }

  const text = element.textContent ?? '';
  element.textContent = '';
  element.dataset.revealReady = 'true';

  text.split(/(\s+)/).forEach((part) => {
    if (!part.trim()) {
      element.append(document.createTextNode(part));
      return;
    }

    const span = document.createElement('span');
    span.textContent = part;
    span.style.display = 'inline-block';
    span.style.willChange = 'transform, opacity';
    element.append(span);
  });
}

export function ContactAmbientLayer() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute left-[8%] top-[18%] h-2 w-2 rounded-full bg-white/35 blur-[1px] motion-safe:animate-[pulse_4s_ease-in-out_infinite]" />
      <span className="absolute left-[78%] top-[22%] h-1.5 w-1.5 rounded-full bg-ember/55 blur-[1px] motion-safe:animate-[pulse_5s_ease-in-out_infinite]" />
      <span className="absolute left-[18%] top-[72%] h-1 w-1 rounded-full bg-white/30 blur-[1px] motion-safe:animate-[pulse_6s_ease-in-out_infinite]" />
      <span className="absolute left-[62%] top-[62%] h-44 w-44 rounded-full bg-ember/10 blur-3xl motion-safe:animate-[pulse_7s_ease-in-out_infinite]" />
      <span className="absolute left-[4%] top-[42%] h-60 w-60 rounded-full bg-white/[0.035] blur-3xl motion-safe:animate-[pulse_8s_ease-in-out_infinite]" />
    </div>
  );
}

export function ContactMotionEnhancer() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const revealTargets = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      revealTargets.forEach((target) => {
        splitWords(target);
        const words = Array.from(target.querySelectorAll('span'));

        gsap.fromTo(
          words,
          { autoAlpha: 0, y: 16, rotateX: -12, filter: 'blur(5px)' },
          {
            autoAlpha: 1,
            y: 0,
            rotateX: 0,
            filter: 'blur(0px)',
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.028,
            scrollTrigger: {
              trigger: target,
              start: 'top 88%',
            },
          },
        );
      });

      gsap.fromTo(
        '[data-motion-field]',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '[data-motion-form]',
            start: 'top 82%',
          },
        },
      );

      gsap.fromTo(
        '[data-section-motion]',
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.95,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '[data-section-motion]',
            start: 'top 86%',
          },
        },
      );

      const tiltCards = gsap.utils.toArray<HTMLElement>('[data-tilt-card]');
      tiltCards.forEach((card) => {
        const onMove = (event: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotateY: x * 8,
            rotateX: -y * 8,
            y: -6,
            boxShadow: '0 24px 80px rgba(255, 122, 0, 0.16)',
            duration: 0.38,
            ease: 'power2.out',
          });
        };

        const onLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            y: 0,
            boxShadow: 'none',
            duration: 0.55,
            ease: 'power3.out',
          });
        };

        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
      });

      const magneticButtons = gsap.utils.toArray<HTMLElement>('[data-magnetic]');
      magneticButtons.forEach((button) => {
        const onMove = (event: MouseEvent) => {
          const rect = button.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;

          gsap.to(button, {
            x: x * 0.14,
            y: y * 0.18,
            scale: 1.035,
            duration: 0.35,
            ease: 'power2.out',
          });
        };

        const onLeave = () => {
          gsap.to(button, { x: 0, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' });
        };

        button.addEventListener('mousemove', onMove);
        button.addEventListener('mouseleave', onLeave);
      });
    });

    return () => context.revert();
  }, []);

  return null;
}
