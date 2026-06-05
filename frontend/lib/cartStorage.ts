import type { CartPayload } from '@/types/cart';

const localKey = 'bback_cart';
const cookieName = 'bback_cart';
const cookieMaxAge = 60 * 60 * 24 * 30;

function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));

  return match ? decodeURIComponent(match[1]) : null;
}

function parseCart(raw: string | null): CartPayload | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CartPayload;
  } catch {
    return null;
  }
}

export function readCartStorage(): CartPayload | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return parseCart(window.localStorage.getItem(localKey)) ?? parseCart(readCookie(cookieName));
}

export function writeCartStorage(cart: CartPayload, persistGuestCookie: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = JSON.stringify(cart);

  window.localStorage.setItem(localKey, payload);

  if (persistGuestCookie) {
    setCookie(cookieName, payload, cookieMaxAge);
  } else {
    deleteCookie(cookieName);
  }
}

export function clearCartStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(localKey);
  deleteCookie(cookieName);
}
