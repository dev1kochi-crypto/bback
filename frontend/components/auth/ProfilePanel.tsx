'use client';

import { getCurrentCustomer, logoutCustomer } from '@/lib/api';
import type { AuthUser } from '@/types/auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function ProfilePanel() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState('Loading profile...');

  useEffect(() => {
    const token = window.localStorage.getItem('auth_token');

    if (!token) {
      router.push('/login');
      return;
    }

    getCurrentCustomer(token)
      .then((response) => {
        setUser(response.user);
        setMessage('');
      })
      .catch(() => {
        window.localStorage.removeItem('auth_token');
        window.localStorage.removeItem('user');
        router.push('/login');
      });
  }, [router]);

  async function handleLogout() {
    const token = window.localStorage.getItem('auth_token');

    if (token) {
      await logoutCustomer(token).catch(() => null);
    }

    window.localStorage.removeItem('auth_token');
    window.localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    router.push('/login');
  }

  return (
    <section className="relative overflow-hidden bg-[#050505] px-6 py-24 text-white sm:px-10 lg:px-12">
      <div className="cinematic-noise pointer-events-none absolute inset-0" />
      <div className="relative z-[2] mx-auto max-w-[860px] rounded-[10px] border border-white/10 bg-white/[0.035] p-8 shadow-food">
        {user ? (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-ember/15 ring-1 ring-ember/40">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} width={80} height={80} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <span className="font-display text-[34px] font-black text-ember">{user.name.slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="font-body text-[13px] font-semibold uppercase tracking-[0.08em] text-white/45">Profile</p>
                <h1 className="mt-1 font-display text-[42px] font-black uppercase leading-none text-white">{user.name}</h1>
                <p className="mt-2 font-body text-[15px] font-semibold text-white/58">{user.email}</p>
              </div>
            </div>
            <button type="button" onClick={handleLogout} className="h-12 bg-ember px-7 font-body text-[13px] font-bold uppercase text-white transition hover:bg-[#ff8e22]">
              Logout
            </button>
          </div>
        ) : (
          <p className="font-body text-[15px] font-semibold text-white/62">{message}</p>
        )}
      </div>
    </section>
  );
}
