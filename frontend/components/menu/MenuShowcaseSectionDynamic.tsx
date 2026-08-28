'use client';

import dynamic from 'next/dynamic';

export const MenuShowcaseSectionDynamic = dynamic(
  () => import('@/components/menu/MenuShowcaseSection').then((mod) => mod.MenuShowcaseSection),
  { ssr: false },
);
