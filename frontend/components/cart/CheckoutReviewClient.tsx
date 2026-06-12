'use client';

import { CheckoutSummary } from '@/components/cart/CheckoutSummary';
import { useCart } from '@/components/cart/CartProvider';
import { CommerceItem, CommercePage, CommercePanel, CommerceSection, CommerceStagger } from '@/components/motion/CommerceMotion';
import { hasMenuItemImage, menuItemImageSrc } from '@/lib/assets';
import { submitCheckout, verifyCheckoutOtp } from '@/lib/api';
import {
  clearCheckoutDraft,
  clearReorderNotice,
  formatAddressSummary,
  readCheckoutDraft,
  readReorderNotice,
  type CheckoutDraft,
} from '@/lib/checkoutStorage';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

export function CheckoutReviewClient() {
  const router = useRouter();
  const { cart, removeSelectedItems, updateQuantity, removeItem, isHydrated } = useCart();
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [reorderNotice, setReorderNotice] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingCheckoutOtp, setIsVerifyingCheckoutOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const selectedItems = cart.items.filter((item) => item.selected !== false);

  useEffect(() => {
    const storedDraft = readCheckoutDraft();

    if (!storedDraft || !storedDraft.form.address_line_1.trim()) {
      router.replace('/checkout');
      return;
    }

    setDraft(storedDraft);
    setReorderNotice(readReorderNotice());
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = window.localStorage.getItem('auth_token');
      const appliedCouponCode = Number(cart.discount_amount) > 0 ? cart.coupon_code : null;
      const response = await submitCheckout(token, {
        ...draft.form,
        address_id: draft.isAddingAddress ? null : draft.selectedAddressId,
        items: selectedItems.map((item) => ({ menu_item_id: item.menu_item_id, quantity: item.quantity })),
        coupon_code: appliedCouponCode,
      });

      if (response.otp_required) {
        setIsVerifyingCheckoutOtp(true);
        setMessage(response.message);
        return;
      }

      if (response.token && response.user) {
        window.localStorage.setItem('auth_token', response.token);
        window.localStorage.setItem('user', JSON.stringify(response.user));
      }

      removeSelectedItems();
      clearCheckoutDraft();
      clearReorderNotice();
      router.push(`/orders/${encodeURIComponent(response.order_number)}?placed=1`);
    } catch (error) {
      if (axios.isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
        const firstError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;
        setMessage(firstError ?? error.response?.data?.message ?? 'Checkout failed.');
      } else {
        setMessage('Checkout failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft || !isVerifyingCheckoutOtp) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const appliedCouponCode = Number(cart.discount_amount) > 0 ? cart.coupon_code : null;
      const response = await verifyCheckoutOtp({
        ...draft.form,
        address_id: draft.isAddingAddress ? null : draft.selectedAddressId,
        items: selectedItems.map((item) => ({ menu_item_id: item.menu_item_id, quantity: item.quantity })),
        coupon_code: appliedCouponCode,
        otp,
      });

      window.localStorage.setItem('auth_token', response.token);
      window.localStorage.setItem('user', JSON.stringify(response.user));
      removeSelectedItems();
      clearCheckoutDraft();
      clearReorderNotice();
      setOtp('');
      router.push(`/orders/${encodeURIComponent(response.order_number)}?placed=1`);
    } catch (error) {
      if (axios.isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
        const firstError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;
        setMessage(firstError ?? error.response?.data?.message ?? 'OTP verification failed.');
      } else {
        setMessage('OTP verification failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!draft) {
    return (
      <main className="relative overflow-hidden bg-black px-4 py-14 text-white sm:px-8 sm:py-20 lg:px-10">
        <div className="relative z-[2] mx-auto max-w-[760px] rounded-[8px] border border-white/12 bg-[#101516] p-5 text-center sm:p-8">
          <p className="font-body text-[15px] text-white/60">Preparing checkout...</p>
        </div>
      </main>
    );
  }

  if (isHydrated && !selectedItems.length) {
    return (
      <main className="relative overflow-hidden bg-black px-4 py-14 text-white sm:px-8 sm:py-20 lg:px-10">
        <div className="relative z-[2] mx-auto max-w-[760px] rounded-[8px] border border-white/12 bg-[#101516] p-5 text-center sm:p-8">
          <h1 className="font-display text-[30px] font-black uppercase leading-none sm:text-[34px]">Checkout</h1>
          <p className="mt-4 font-body text-[15px] text-white/60">No items selected for checkout.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/menu" className="inline-flex h-11 items-center justify-center bg-ember px-6 font-body text-[13px] font-bold uppercase text-white">
              Go To Menu
            </Link>
            <Link href="/checkout" className="inline-flex h-11 items-center justify-center border border-white/18 px-6 font-body text-[13px] font-bold uppercase text-white">
              Change Address
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden bg-black px-4 py-10 text-white sm:px-8 sm:py-14 lg:px-10 lg:py-16">
      <CommercePage className="relative z-[2] mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <CommercePanel className="rounded-[8px] border border-white/12 bg-[#0a0a0a] p-5 sm:p-8">
        <form onSubmit={isVerifyingCheckoutOtp ? handleOtpSubmit : handleSubmit} className="contents">
          <Link href="/checkout" className="mb-6 inline-flex h-10 items-center border border-white/15 px-4 font-body text-[12px] font-bold uppercase text-white/70 transition hover:border-ember hover:text-ember">
            Change Address
          </Link>

          <h1 className="font-display text-[36px] font-black uppercase leading-none text-white sm:text-[44px]">Checkout</h1>
          <p className="mt-3 max-w-[680px] font-body text-[14px] font-normal leading-[1.7] text-white/58">
            Review your items, payment method, and delivery address before placing the order.
          </p>

          {reorderNotice ? (
            <div className="mt-6 border border-amber-400/35 bg-amber-400/10 px-4 py-3 font-body text-[13px] leading-[1.6] text-amber-100">
              {reorderNotice}
            </div>
          ) : null}

          <CommerceSection className="mt-8 border-t border-white/10 pt-6">
            <h2 className="font-display text-[20px] font-medium text-white">Order Items</h2>
            <CommerceStagger className="mt-4 space-y-3">
              {selectedItems.map((item) => (
                <CommerceItem key={item.menu_item_id} className="relative grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 border-b border-white/8 pb-3 sm:grid-cols-[72px_1fr_120px_90px] sm:gap-4 sm:pb-4">
                  <div className={`relative h-[58px] w-[64px] overflow-hidden rounded-[6px] sm:h-[72px] sm:w-[72px] ${hasMenuItemImage(item.image) ? '' : 'bg-[#14181b]'}`}>
                    <Image
                      src={menuItemImageSrc(item.image)}
                      alt={item.name}
                      fill
                      sizes="72px"
                      className={`object-contain ${hasMenuItemImage(item.image) ? '' : 'p-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]'}`}
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-[17px] font-medium leading-tight text-white sm:text-[18px]">{item.name}</p>
                    <p className="mt-1 font-body text-[12px] text-white/50">{item.category_name ?? 'Menu item'}</p>
                    <button type="button" onClick={() => removeItem(item.menu_item_id)} className="mt-1 font-body text-[11px] font-semibold text-red-400 sm:mt-2">
                      Remove item
                    </button>
                  </div>
                  <div className="col-span-2 flex items-center gap-3 border-t border-white/10 pt-2.5 sm:col-auto sm:border-0 sm:pt-0">
                    <button type="button" onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-white/12">+</button>
                    <span className="min-w-[18px] text-center font-display text-[18px]">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => (item.quantity > 1 ? updateQuantity(item.menu_item_id, item.quantity - 1) : removeItem(item.menu_item_id))}
                      className="grid h-7 w-7 place-items-center rounded-full bg-white/12"
                    >
                      -
                    </button>
                  </div>
                  <p className="absolute bottom-3 right-0 font-display text-[20px] text-white sm:static sm:text-right">{item.line_total}</p>
                </CommerceItem>
              ))}
            </CommerceStagger>
          </CommerceSection>

          <CommerceSection className="mt-8 border-t border-white/10 pt-6" delay={0.08}>
            <h2 className="font-display text-[20px] font-medium text-white">Payment Method</h2>
            <div className="mt-4 border border-ember/35 bg-ember/10 px-4 py-3 font-body text-[14px] text-white">
              Cash on Delivery
            </div>
          </CommerceSection>

          <CommerceSection className="mt-8 border-t border-white/10 pt-6" delay={0.12}>
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-[20px] font-medium text-white">Delivery Address</h2>
              <Link href="/checkout" className="font-body text-[12px] font-bold uppercase text-ember hover:text-white">
                Change
              </Link>
            </div>
            <div className="mt-4 border border-white/12 bg-[#111] p-4 font-body text-[13px] leading-[1.7] text-white/72">
              <strong className="text-white">{draft.form.name}</strong>
              <br />
              {draft.form.phone} - {draft.form.email}
              <br />
              {formatAddressSummary(draft.form)}
            </div>
          </CommerceSection>

          {draft.form.notes ? (
            <CommerceSection className="mt-8 border-t border-white/10 pt-6" delay={0.16}>
              <h2 className="font-display text-[20px] font-medium text-white">Order Notes</h2>
              <p className="mt-4 border border-white/12 bg-[#111] p-4 font-body text-[13px] leading-[1.7] text-white/72">{draft.form.notes}</p>
            </CommerceSection>
          ) : null}

          {isVerifyingCheckoutOtp ? (
            <div className="mt-8 max-w-[420px]">
              <label className="block">
                <span className="mb-2 block font-body text-[13px] font-bold text-white">Phone OTP</span>
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Enter 4 digit OTP"
                  required
                  className="h-11 w-full border border-white/12 bg-[#111] px-4 font-body text-[14px] outline-none focus:border-ember"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsVerifyingCheckoutOtp(false);
                  setOtp('');
                }}
                className="mt-3 font-body text-[12px] font-bold uppercase text-white/55 hover:text-ember"
              >
                Edit address
              </button>
            </div>
          ) : null}

          {message ? <p className="mt-5 font-body text-[14px] font-semibold text-amber-300">{message}</p> : null}

          <button type="submit" disabled={isSubmitting || !selectedItems.length} className="mt-8 h-12 w-full bg-ember px-8 font-display text-[14px] font-medium uppercase text-white disabled:opacity-45 sm:w-auto">
            {isSubmitting ? 'Please Wait...' : isVerifyingCheckoutOtp ? 'Verify OTP' : 'Place Order'}
          </button>
        </form>
        </CommercePanel>

        <CheckoutSummary />
      </CommercePage>
    </main>
  );
}
