'use client';

import dynamic from 'next/dynamic';

export const ContactThreeSceneDynamic = dynamic(
  () => import('@/components/contact/ContactThreeScene').then((mod) => mod.ContactThreeScene),
  { ssr: false },
);
