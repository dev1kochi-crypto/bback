'use client';

import { CheckoutSummary } from '@/components/cart/CheckoutSummary';
import { useCart } from '@/components/cart/CartProvider';
import { CommerceItem, CommercePage, CommercePanel, CommerceStagger } from '@/components/motion/CommerceMotion';
import { getCustomerAddresses, reverseGeocodeLocation } from '@/lib/api';
import {
  addressToCheckoutForm,
  emptyCheckoutForm,
  readCheckoutDraft,
  readCheckoutPrefill,
  clearCheckoutPrefill,
  writeCheckoutDraft,
  type CheckoutFormState,
} from '@/lib/checkoutStorage';
import type { CustomerAddress } from '@/types/cart';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

export function CheckoutAddressClient() {
  const router = useRouter();
  const { cart, isHydrated } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(true);
  const [form, setForm] = useState<CheckoutFormState>(emptyCheckoutForm);
  const selectedItems = cart.items.filter((item) => item.selected !== false);

  useEffect(() => {
    const user = window.localStorage.getItem('user');
    const token = window.localStorage.getItem('auth_token');
    const draft = readCheckoutDraft();
    const prefill = readCheckoutPrefill();

    if (user) {
      try {
        const parsed = JSON.parse(user);
        setForm((current) => ({ ...current, name: parsed.name ?? '', email: parsed.email ?? '' }));
      } catch {
        window.localStorage.removeItem('user');
      }
    }

    if (draft) {
      setForm((current) => ({ ...current, ...draft.form }));
      setSelectedAddressId(draft.selectedAddressId);
      setIsAddingAddress(draft.isAddingAddress);
    }

    if (prefill) {
      setForm((current) => ({ ...current, ...prefill }));
      clearCheckoutPrefill();
    }

    if (!token) {
      return;
    }

    getCustomerAddresses(token)
      .then((response) => {
        setAddresses(response.addresses);

        if (draft?.selectedAddressId) {
          const draftAddress = response.addresses.find((address) => address.id === draft.selectedAddressId);

          if (draftAddress) {
            setSelectedAddressId(draftAddress.id);
            setForm((current) => ({ ...current, ...addressToCheckoutForm(draftAddress), notes: draft.form.notes }));
            setIsAddingAddress(false);
            return;
          }
        }

        if (prefill) {
          const matchedAddress = response.addresses.find((address) => address.address_line_1 === prefill.address_line_1);

          if (matchedAddress) {
            setSelectedAddressId(matchedAddress.id);
            setForm((current) => ({ ...current, ...addressToCheckoutForm(matchedAddress), notes: prefill.notes ?? current.notes }));
            setIsAddingAddress(false);
            return;
          }

          setSelectedAddressId(null);
          setIsAddingAddress(response.addresses.length === 0);
          return;
        }

        const defaultAddress = response.addresses.find((address) => address.is_default) ?? response.addresses[0] ?? null;

        if (defaultAddress && !draft) {
          setSelectedAddressId(defaultAddress.id);
          setForm((current) => ({ ...current, ...addressToCheckoutForm(defaultAddress) }));
          setIsAddingAddress(false);
        }
      })
      .catch(() => {
        setIsAddingAddress(true);
      });
  }, []);

  function setValue(field: keyof CheckoutFormState, value: string | number | boolean | null) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectAddress(address: CustomerAddress) {
    setSelectedAddressId(address.id);
    setForm((current) => ({ ...current, ...addressToCheckoutForm(address), notes: current.notes }));
    setIsAddingAddress(false);
    setMessage(null);
  }

  function startNewAddress() {
    setSelectedAddressId(null);
    setIsAddingAddress(true);
    setForm((current) => ({
      ...emptyCheckoutForm,
      name: current.name,
      email: current.email,
      phone: current.phone,
      notes: current.notes,
      is_default: addresses.length === 0,
    }));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage('Current location is not available in this browser.');
      return;
    }

    setIsLocating(true);
    getBestCurrentPosition()
      .then(async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        let locationFields: Partial<CheckoutFormState> = {};

        try {
          locationFields = await reverseGeocode(latitude, longitude);
        } catch {
          locationFields = {};
        }

        setForm((current) => ({
          ...current,
          ...locationFields,
          latitude,
          longitude,
        }));

        if (!locationFields.address_line_1 && !locationFields.city && !locationFields.postal_code) {
          setMessage('Location pinned, but readable address was not found. Please type your address.');
        } else {
          setMessage(
            accuracy > 100
              ? 'Location pinned, but GPS accuracy is low. Please confirm the written address.'
              : 'Location pinned. Please confirm your written address.',
          );
        }

        setIsLocating(false);
      })
      .catch(() => {
        setMessage('Location permission denied. Please type your address manually.');
        setIsLocating(false);
      });
  }

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedItems.length) {
      setMessage('Add items to your cart before continuing.');
      return;
    }

    if (!form.address_line_1.trim() || !form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setMessage('Please complete your delivery address before continuing.');
      return;
    }

    writeCheckoutDraft({
      form,
      selectedAddressId,
      isAddingAddress,
    });

    router.push('/checkout/review');
  }

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? null;

  if (isHydrated && !selectedItems.length) {
    return (
      <main className="relative overflow-hidden bg-black px-6 py-20 text-white sm:px-8 lg:px-10">
        <div className="relative z-[2] mx-auto max-w-[760px] rounded-[8px] border border-white/12 bg-[#101516] p-8 text-center">
          <h1 className="font-display text-[42px] font-black uppercase leading-none">Your Cart Is Empty</h1>
          <p className="mx-auto mt-4 max-w-[520px] font-body text-[15px] font-normal leading-[1.7] text-white/60">
            Add items to your cart from the menu, then continue to checkout.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/menu" className="inline-flex h-11 items-center justify-center bg-ember px-6 font-body text-[13px] font-bold uppercase text-white">
              Go To Menu
            </Link>
            <Link href="/cart" className="inline-flex h-11 items-center justify-center border border-white/18 px-6 font-body text-[13px] font-bold uppercase text-white transition hover:border-ember hover:text-ember">
              View Cart
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden bg-black px-6 py-14 text-white sm:px-8 lg:px-10 lg:py-16">
      <CommercePage className="relative z-[2] mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <CommercePanel className="rounded-[8px] border border-white/12 bg-[#0a0a0a] p-6 sm:p-8">
        <form onSubmit={handleContinue} className="contents">
          <Link href="/cart" className="mb-6 inline-flex h-10 items-center border border-white/15 px-4 font-body text-[12px] font-bold uppercase text-white/70 transition hover:border-ember hover:text-ember">
            Back to Cart
          </Link>

          <h1 className="font-display text-[44px] font-black uppercase leading-none text-white">Delivery Address</h1>
          <p className="mt-3 max-w-[680px] font-body text-[14px] font-normal leading-[1.7] text-white/58">
            Add your delivery details. Use current location to pin coordinates, then confirm the readable address.
          </p>

          {addresses.length > 0 && !isAddingAddress ? (
            <div className="mt-8 space-y-4">
              <CommerceStagger className="space-y-3">
                {addresses.map((address) => (
                  <CommerceItem key={address.id}>
                  <button
                    type="button"
                    onClick={() => selectAddress(address)}
                    className={`w-full border p-4 text-left font-body transition ${address.id === selectedAddressId ? 'border-ember bg-ember/10' : 'border-white/12 bg-[#111] hover:border-white/30'}`}
                  >
                    <span className="font-display text-[14px] font-medium uppercase text-ember">Delivery address</span>
                    <span className="mt-2 block text-[14px] font-normal text-white/82">{address.address_line_1}</span>
                    <span className="mt-1 block text-[12px] text-white/50">{[address.city, address.postal_code].filter(Boolean).join(', ')}</span>
                    {address.is_default ? <span className="mt-3 inline-block bg-ember px-2 py-1 text-[10px] font-bold uppercase text-black">Default</span> : null}
                  </button>
                  </CommerceItem>
                ))}
              </CommerceStagger>

              {selectedAddress ? (
                <div className="border border-white/12 bg-[#111] p-4 font-body text-[13px] leading-[1.7] text-white/72">
                  <strong className="text-white">{selectedAddress.name}</strong>
                  <br />
                  {selectedAddress.phone} - {selectedAddress.email}
                  <br />
                  {[selectedAddress.address_line_1, selectedAddress.address_line_2].filter(Boolean).join(', ')}
                </div>
              ) : null}

              <button type="button" onClick={startNewAddress} className="h-11 border border-ember px-5 font-body text-[13px] font-bold uppercase text-ember">
                Add New Address
              </button>
            </div>
          ) : null}

          {isAddingAddress || addresses.length === 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={form.name} onChange={(value) => setValue('name', value)} required />
              <Field label="Email" type="email" value={form.email} onChange={(value) => setValue('email', value)} required />
              <Field label="Phone" value={form.phone} onChange={(value) => setValue('phone', value)} required />
              <Field label="City / Municipality" value={form.city} onChange={(value) => setValue('city', value)} placeholder="Tbilisi, Batumi..." />
              <Field label="Postal Code / PIN" value={form.postal_code} onChange={(value) => setValue('postal_code', value)} />
              <div className="flex items-end">
                <button type="button" onClick={useCurrentLocation} disabled={isLocating} className="h-11 w-full border border-ember bg-ember/10 font-body text-[13px] font-bold uppercase text-ember disabled:opacity-50">
                  {isLocating ? 'Pinning Location...' : 'Select Current Location'}
                </button>
              </div>
              <Field className="sm:col-span-2" label="Address Line 1" value={form.address_line_1} onChange={(value) => setValue('address_line_1', value)} placeholder="Street, building, apartment" required />
              <Field className="sm:col-span-2" label="Address Line 2" value={form.address_line_2} onChange={(value) => setValue('address_line_2', value)} placeholder="Flat, floor, suite" />
            </div>
          ) : null}

          <label className="mt-6 block">
            <span className="mb-2 block font-body text-[13px] font-bold text-white">Order Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => setValue('notes', event.target.value)}
              rows={4}
              className="w-full border border-white/12 bg-[#111] px-4 py-3 font-body text-[14px] outline-none focus:border-ember"
            />
          </label>

          {message ? <p className="mt-5 font-body text-[14px] font-semibold text-amber-300">{message}</p> : null}

          <button type="submit" disabled={!selectedItems.length} className="mt-8 h-12 w-full bg-ember px-8 font-display text-[14px] font-medium uppercase text-white disabled:opacity-45 sm:w-auto">
            Continue to Checkout
          </button>
        </form>
        </CommercePanel>

        <CheckoutSummary />
      </CommercePage>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text', required, placeholder, className = '' }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block font-body text-[13px] font-bold text-white">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full border border-white/12 bg-[#111] px-4 font-body text-[14px] outline-none focus:border-ember"
      />
    </label>
  );
}

async function reverseGeocode(latitude: number, longitude: number): Promise<Partial<CheckoutFormState>> {
  const data = await reverseGeocodeLocation({ latitude, longitude });
  const fields: Partial<CheckoutFormState> = {};

  if (data.city) {
    fields.city = data.city;
  }

  if (data.postal_code) {
    fields.postal_code = data.postal_code;
  }

  if (data.address_line_1) {
    fields.address_line_1 = data.address_line_1;
  }

  return fields;
}

function getBestCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    let bestPosition: GeolocationPosition | null = null;
    let settled = false;
    let watchId: number | null = null;

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      if (bestPosition) {
        resolve(bestPosition);
      } else {
        reject(new Error('Location unavailable'));
      }
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        if (position.coords.accuracy <= 50) {
          finish();
        }
      },
      () => finish(),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );

    window.setTimeout(finish, 8000);
  });
}
