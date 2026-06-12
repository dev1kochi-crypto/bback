'use client';

import { useCart } from '@/components/cart/CartProvider';
import { CommerceDrawer, CommerceItem, CommerceOverlay, CommerceStagger } from '@/components/motion/CommerceMotion';
import { hasMenuItemImage, menuItemImageSrc } from '@/lib/assets';
import { resolveCheckoutHref } from '@/lib/checkoutRoute';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CartDrawer() {
  const router = useRouter();
  const { cart, isOpen, closeCart, updateQuantity, removeItem, toast } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const selectedItems = cart.items.filter((item) => item.selected !== false);

  async function handleCheckout() {
    if (!selectedItems.length) {
      return;
    }

    setIsCheckingOut(true);

    try {
      const token = window.localStorage.getItem('auth_token');
      const href = await resolveCheckoutHref(token);
      closeCart();
      router.push(href);
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <>
      <CommerceOverlay open={isOpen} onClose={closeCart} />
      <CommerceDrawer open={isOpen} className="fixed right-0 top-0 z-[250] flex h-screen w-full max-w-[430px] flex-col bg-white text-black shadow-[-24px_0_70px_rgba(0,0,0,0.36)]">
        <header className="flex items-center justify-between border-b border-black/10 px-5 py-5">
          <h2 className="font-display text-[28px] font-medium leading-none">My Cart</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart" className="grid h-8 w-8 place-items-center rounded-full border border-black/15 text-black/50 transition hover:bg-black/5 hover:text-black">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.items.length ? (
            <CommerceStagger className="space-y-3">
              {cart.items.map((item) => (
                <CommerceItem key={item.menu_item_id} className="grid grid-cols-[70px_minmax(0,1fr)_auto] items-start gap-4 rounded-[8px] border border-black/10 px-4 py-4">
                  <div className={`relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[6px] ${hasMenuItemImage(item.image) ? '' : 'bg-[#14181b]'}`}>
                    <Image
                      src={menuItemImageSrc(item.image)}
                      alt={item.name}
                      fill
                      sizes="70px"
                      className={`object-contain ${hasMenuItemImage(item.image) ? '' : 'p-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]'}`}
                      unoptimized
                    />
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <h3 className="font-display text-[18px] font-semibold leading-tight text-black">{item.name}</h3>
                    <p className="mt-1 font-body text-[12px] font-medium text-black/45">{item.category_name}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <button type="button" onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-black/10 text-[18px] leading-none">
                        +
                      </button>
                      <span className="min-w-[12px] text-center font-display text-[18px]">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => (item.quantity > 1 ? updateQuantity(item.menu_item_id, item.quantity - 1) : removeItem(item.menu_item_id))}
                        className="grid h-7 w-7 place-items-center rounded-full bg-black/10 text-[18px] leading-none"
                      >
                        -
                      </button>
                    </div>
                  </div>

                  <div className="flex min-h-[70px] flex-col items-end justify-between text-right">
                    <div className="font-display text-[25px] font-semibold leading-none text-black">{item.line_total}</div>
                    <button type="button" onClick={() => removeItem(item.menu_item_id)} className="font-body text-[10px] font-semibold uppercase tracking-[0.02em] text-red-500">
                      Delete Item
                    </button>
                  </div>
                </CommerceItem>
              ))}
            </CommerceStagger>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <p className="font-display text-[26px] text-black/42">Your cart is empty</p>
            </div>
          )}
        </div>

        <footer className="border-t border-black/10 px-5 py-5">
          <div className="mb-5 space-y-2 font-body text-[13px] font-semibold text-black/62">
            <div className="flex items-center justify-between">
              <span>Products</span>
              <span>{cart.subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <span>{cart.delivery_charge_amount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <span>{cart.tax_amount}</span>
            </div>
            <div className="flex items-center justify-between border-t border-black/10 pt-3 font-display text-black">
              <span className="text-[18px]">Total</span>
              <span className="text-[25px] font-semibold">{cart.total}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/cart" onClick={closeCart} className="flex h-12 items-center justify-center border border-black/18 bg-black font-display text-[14px] font-medium uppercase text-white">
              View Cart
            </Link>
            {selectedItems.length ? (
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="flex h-12 items-center justify-center bg-ember font-display text-[14px] font-medium uppercase text-white disabled:opacity-60"
              >
                {isCheckingOut ? 'Please Wait...' : 'Checkout'}
              </button>
            ) : cart.items.length ? (
              <Link href="/cart" onClick={closeCart} className="flex h-12 items-center justify-center bg-ember font-display text-[14px] font-medium uppercase text-white">
                Select Items
              </Link>
            ) : (
              <Link href="/menu" onClick={closeCart} className="flex h-12 items-center justify-center bg-ember font-display text-[14px] font-medium uppercase text-white">
                Add Items
              </Link>
            )}
          </div>
        </footer>
      </CommerceDrawer>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: -18, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -18, x: '-50%' }}
            transition={{ duration: 0.28 }}
            className="fixed left-1/2 top-20 z-[260] w-[300px] rounded-[8px] bg-white p-4 text-black shadow-[0_18px_55px_rgba(0,0,0,0.28)]"
          >
            <div className="mb-3 flex items-center justify-center gap-2 rounded-[4px] bg-[#258d2f] py-2 font-body text-[13px] font-semibold text-white">
              <span>Item added to your cart</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`relative h-12 w-14 shrink-0 overflow-hidden rounded-[4px] ${hasMenuItemImage(toast.image) ? 'bg-black/5' : 'bg-[#14181b]'}`}>
                <Image
                  src={menuItemImageSrc(toast.image)}
                  alt=""
                  fill
                  sizes="56px"
                  className={`object-contain ${hasMenuItemImage(toast.image) ? '' : 'p-0.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]'}`}
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[18px] font-semibold leading-none">{toast.name}</p>
                <p className="truncate font-body text-[13px] text-black/48">{toast.category_name}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
