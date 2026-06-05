'use client';

import Image from 'next/image';
import Link from 'next/link';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerAction?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footerAction }: AuthShellProps) {
  const titleClassName = title.length > 16
    ? 'text-[36px] sm:text-[42px] tracking-[0.8px]'
    : 'text-[58px] sm:text-[64px] tracking-[1.92px]';

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-5 py-7 text-white sm:px-8">
      <div className="cinematic-noise pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember to-transparent" />

      <div className="relative z-[2] mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[990px] flex-col">
        <Link href="/" className="mx-auto inline-flex">
          <Image src="/app/images/logo.svg" alt="B.back" width={142} height={62} priority className="h-[68px] w-auto object-contain" />
        </Link>

        <section className="my-auto pt-7">
          <div className="auth-float relative mx-auto grid max-w-[820px] overflow-hidden rounded-[10px] border border-white/20 bg-[#050505]/96 shadow-[0_42px_140px_rgba(0,0,0,0.84)] md:grid-cols-[390px_430px]">
            <div className="relative z-[2] flex min-h-[500px] flex-col justify-center px-8 py-9 sm:px-10 md:px-11">
              <h1 className={`text-center font-display font-normal leading-none text-white ${titleClassName}`}>{title}</h1>
              <p className="mx-auto mt-4 max-w-[300px] text-center font-body text-[12px] font-semibold leading-[1.55] text-white/76">{subtitle}</p>
              <div className="mt-9">{children}</div>
              {footerAction ? <div className="mt-5">{footerAction}</div> : null}
            </div>

            <div className="auth-scan relative hidden min-h-[500px] overflow-hidden border-l border-white/10 md:block">
              <Image
                src="/app/images/auth-restaurant.png"
                alt="Dimly lit B.back restaurant interior"
                fill
                priority
                sizes="430px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.08),rgba(0,0,0,0.02))]" />
            </div>
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ember/70 pt-5 font-body text-[12px] font-semibold text-white/62">
          <span>Copyright &copy; 2026 All Rights Reserved. B-Back</span>
          <span>Designed by MightyWarriors Technologies LLC</span>
        </footer>
      </div>
    </main>
  );
}

export const AuthInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function AuthInput(props, ref) {
  return (
    <input
      {...props}
      ref={ref}
      className={[
        'h-11 w-full rounded-[2px] border border-white/15 bg-[#1d1d1d] px-4 font-body text-[13px] font-semibold text-white outline-none transition placeholder:text-white/45 focus:border-ember',
        props.className ?? '',
      ].join(' ')}
    />
  );
});

export function AuthButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        'inline-flex h-12 w-full items-center justify-center bg-ember px-4 font-body text-[13px] font-bold uppercase text-white shadow-[0_20px_50px_rgba(255,122,0,0.2)] transition hover:bg-[#ff8e22] disabled:cursor-not-allowed disabled:opacity-55',
        props.className ?? '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function AuthLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block font-body text-[12px] font-bold text-white">{children}</span>;
}

export function AuthForm({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      {...props}
      className={['space-y-4', props.className ?? ''].join(' ')}
    >
      {children}
    </form>
  );
}

export function AuthStatus({ message, tone = 'neutral' }: { message: string | null; tone?: 'neutral' | 'error' | 'success' }) {
  if (!message) {
    return null;
  }

  const color = tone === 'error' ? 'text-red-300' : tone === 'success' ? 'text-emerald-300' : 'text-white/62';

  return <p className={`mt-3 font-body text-[12px] font-semibold leading-[1.45] ${color}`}>{message}</p>;
}
