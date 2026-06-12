'use client';

import { useCart } from '@/components/cart/CartProvider';
import { CommerceItem, CommercePage, CommercePanel, CommerceStagger } from '@/components/motion/CommerceMotion';
import { hasMenuItemImage, menuItemImageSrc } from '@/lib/assets';
import { resolveCheckoutHref } from '@/lib/checkoutRoute';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

export function CartPageClient() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon, toggleItemSelected, selectAllItems } = useCart();
  const [code, setCode] = useState(cart.coupon_code ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isUpdatingCoupon, setIsUpdatingCoupon] = useState(false);
  const selectedItems = cart.items.filter((item) => item.selected !== false);
  const allSelected = cart.items.length > 0 && selectedItems.length === cart.items.length;
  const hasAppliedCoupon = Boolean(cart.coupon_code) && Number(cart.discount_amount) > 0;

  useEffect(() => {
    setCode(cart.coupon_code ?? '');
  }, [cart.coupon_code]);

  async function handleCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUpdatingCoupon(true);
    setMessage(await applyCoupon(code));
    setIsUpdatingCoupon(false);
  }

  async function handleRemoveCoupon() {
    setIsUpdatingCoupon(true);
    setMessage(await removeCoupon());
    setCode('');
    setIsUpdatingCoupon(false);
  }

  async function handleCheckout() {
    setIsCheckingOut(true);

    try {
      const token = window.localStorage.getItem('auth_token');
      router.push(await resolveCheckoutHref(token));
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="relative overflow-hidden bg-[#050505] px-4 py-14 text-white sm:px-10 sm:py-20 lg:px-12">
      <div className="cinematic-noise pointer-events-none absolute inset-0" />
      <CommercePage className="relative z-[2] mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-4 flex items-center justify-between gap-4 font-body text-[12px] text-white/70 sm:mb-5 sm:text-[13px]">
            <label className="inline-flex min-w-0 items-center gap-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) => selectAllItems(event.target.checked)}
                className="accent-ember"
              />
              Select All Items
            </label>
            {cart.items.length ? <button type="button" onClick={clearCart} className="shrink-0 text-red-400">Clear All Items</button> : null}
          </div>
          <CommerceStagger className="space-y-2.5 sm:space-y-3">
            {cart.items.map((item) => (
              <CommerceItem key={item.menu_item_id} className={`relative grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 rounded-[6px] border p-3 transition sm:grid-cols-[24px_80px_1fr_110px_90px] sm:gap-4 sm:p-4 ${item.selected === false ? 'border-white/8 bg-black/15 opacity-60' : 'border-white/12 bg-black/30'}`}>
                <input
                  type="checkbox"
                  checked={item.selected !== false}
                  onChange={(event) => toggleItemSelected(item.menu_item_id, event.target.checked)}
                  className="absolute right-3 top-3 accent-ember sm:static"
                />
                <div className={`relative h-[58px] w-[64px] overflow-hidden rounded-[6px] sm:h-[70px] sm:w-[80px] ${hasMenuItemImage(item.image) ? '' : 'bg-[#14181b]'}`}>
                  <Image
                    src={menuItemImageSrc(item.image)}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className={`object-contain ${hasMenuItemImage(item.image) ? '' : 'p-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]'}`}
                    unoptimized
                  />
                </div>
                <div className="min-w-0 pr-7 sm:pr-0">
                  <h2 className="font-display text-[17px] font-semibold leading-tight sm:text-[20px]">{item.name}</h2>
                  <p className="mt-0.5 font-body text-[11px] text-white/42 sm:text-[12px]">{item.category_name}</p>
                  <button type="button" onClick={() => removeItem(item.menu_item_id)} className="mt-1 font-body text-[11px] font-semibold text-red-400 sm:mt-2">Delete item</button>
                </div>
                <div className="col-span-2 flex items-center gap-3 border-t border-white/10 pt-2.5 sm:col-auto sm:border-0 sm:pt-0">
                  <button type="button" onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-white/12 text-[16px] sm:h-7 sm:w-7">+</button>
                  <span className="min-w-[18px] text-center font-display text-[18px]">{item.quantity}</span>
                  <button type="button" onClick={() => item.quantity > 1 ? updateQuantity(item.menu_item_id, item.quantity - 1) : removeItem(item.menu_item_id)} className="grid h-7 w-7 place-items-center rounded-full bg-white/12 text-[16px] sm:h-7 sm:w-7">-</button>
                </div>
                <div className="absolute bottom-3 right-3 font-display text-[21px] font-semibold sm:static sm:text-right sm:text-[23px]">{item.line_total}</div>
              </CommerceItem>
            ))}
            {!cart.items.length ? (
              <CommerceItem className="rounded-[6px] border border-white/12 bg-black/30 p-12 text-center">
                <h2 className="font-display text-[38px]">Your Cart Is Empty</h2>
                <Link href="/menu" className="mt-5 inline-flex h-11 items-center bg-ember px-6 font-body text-[13px] font-bold uppercase">Explore Menu</Link>
              </CommerceItem>
            ) : null}
          </CommerceStagger>
        </section>
        <CommercePanel className="h-fit rounded-[8px] bg-[#101516] p-5 sm:p-6">
          <h2 className="font-display text-[24px] font-semibold">Order Summary</h2>
          <div className="mt-5 space-y-3 border-b border-white/10 pb-4 font-body text-[13px]">
            <div className="flex justify-between"><span>Products Amount</span><span>{cart.subtotal} GEL</span></div>
            <div className="flex justify-between"><span>Discount</span><span>{cart.discount_amount} GEL</span></div>
            <div className="flex justify-between"><span>Delivery Charge</span><span>{cart.delivery_charge_amount} GEL</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{cart.tax_amount} GEL</span></div>
          </div>
          <form onSubmit={handleCoupon} className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <label className="font-body text-[13px] font-bold">Promo Code</label>
              {hasAppliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  disabled={isUpdatingCoupon}
                  className="font-body text-[11px] font-semibold uppercase text-red-400 transition hover:text-red-300 disabled:opacity-60"
                >
                  Remove
                </button>
              ) : null}
            </div>
            {hasAppliedCoupon ? (
              <div className="mt-2 flex h-10 items-center justify-between border border-ember/35 bg-ember/10 px-3">
                <span className="font-body text-[12px] font-semibold uppercase text-white">{cart.coupon_code}</span>
                <span className="font-body text-[11px] text-ember">Applied</span>
              </div>
            ) : (
              <div className="mt-2 flex">
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Enter promo code"
                  className="h-10 flex-1 bg-black px-3 font-body text-[12px] outline-none"
                />
                <button type="submit" disabled={isUpdatingCoupon} className="h-10 bg-ember px-4 font-body text-[11px] font-bold uppercase disabled:opacity-60">
                  {isUpdatingCoupon ? 'Wait...' : 'Enter'}
                </button>
              </div>
            )}
            {message ? <p className="mt-2 font-body text-[12px] text-amber-300">{message}</p> : null}
          </form>
          <div className="mt-5 flex justify-between font-display text-[22px]">
            <span>Total</span><span>{cart.total} GEL</span>
          </div>
          {selectedItems.length ? (
            <button type="button" onClick={handleCheckout} disabled={isCheckingOut} className="mt-6 flex h-11 w-full items-center justify-center bg-ember font-display text-[13px] font-medium uppercase disabled:opacity-60">
              {isCheckingOut ? 'Please Wait...' : 'Continue to Checkout'}
            </button>
          ) : (
            <button type="button" disabled className="mt-6 flex h-11 w-full items-center justify-center bg-ember font-display text-[13px] font-medium uppercase opacity-45">
              Select Items To Checkout
            </button>
          )}
        </CommercePanel>
      </CommercePage>
    </main>
  );
}
