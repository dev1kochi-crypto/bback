import { SiteShell } from '@/components/layout/SiteShell';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <SiteShell>
      <main className="bg-black px-6 py-20 text-white sm:px-10 lg:px-16">
        <section className="mx-auto flex min-h-[360px] max-w-[900px] flex-col items-center justify-center text-center">
          <div className="relative h-[132px] w-[220px]">
            <span className="absolute inset-x-0 top-3 font-display text-[110px] font-black leading-none text-white/10">404</span>
            <Image src="/app/images/logo.svg" alt="B.back" width={130} height={60} className="absolute left-1/2 top-10 h-[70px] w-auto -translate-x-1/2 object-contain" />
          </div>
          <h1 className="mt-8 font-display text-[42px] font-medium uppercase leading-none sm:text-[58px]">Oops, Page Not Found</h1>
          <p className="mt-4 max-w-[520px] font-display text-[18px] leading-relaxed text-white/55">
            Sorry, the page you are looking for does not exist.
          </p>
          <Link href="/" className="mt-8 inline-flex h-11 items-center justify-center bg-ember px-7 font-display text-[14px] font-medium uppercase text-white transition hover:brightness-110">
            Back To Home
          </Link>
        </section>
      </main>
    </SiteShell>
  );
}
