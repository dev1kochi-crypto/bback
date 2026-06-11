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
  clearCheckoutDraft,
  writeCheckoutDraft,
  type CheckoutFormState,
} from '@/lib/checkoutStorage';
import type { CustomerAddress } from '@/types/cart';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

type GoogleMapsNamespace = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
    Marker: new (options: Record<string, unknown>) => GoogleMarkerInstance;
    LatLng: new (latitude: number, longitude: number) => GoogleLatLng;
    Point: new (x: number, y: number) => unknown;
    Geocoder: new () => GoogleGeocoderInstance;
    places: {
      Autocomplete: new (input: HTMLInputElement, options: Record<string, unknown>) => GoogleAutocompleteInstance;
    };
    event: {
      addListener: (target: unknown, eventName: string, callback: (...args: any[]) => void) => void;
    };
  };
};

type GoogleLatLng = {
  lat: () => number;
  lng: () => number;
};

type GoogleMapMouseEvent = {
  latLng?: GoogleLatLng;
};

type GoogleGeocoderInstance = {
  geocode: (
    request: { location: { lat: number; lng: number } },
    callback: (results: GoogleGeocoderResult[] | null, status: string) => void,
  ) => void;
};

type GoogleGeocoderResult = {
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address?: string;
  geometry?: {
    location_type?: string;
  };
  types?: string[];
};

type GoogleAutocompleteInstance = {
  addListener: (eventName: string, callback: () => void) => void;
  getPlace: () => GooglePlaceResult;
};

type GooglePlaceResult = {
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address?: string;
  geometry?: {
    location?: GoogleLatLng;
  };
  name?: string;
};

type GoogleMapInstance = {
  getCenter: () => GoogleLatLng | undefined;
  setCenter: (position: GoogleLatLng | { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
};

type GoogleMarkerInstance = {
  setPosition: (position: GoogleLatLng | { lat: number; lng: number }) => void;
};

type LocationSelection = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  addressFields?: Partial<CheckoutFormState>;
};

declare global {
  interface Window {
    google?: GoogleMapsNamespace;
    __bbackGoogleMapsPromise?: Promise<GoogleMapsNamespace>;
  }
}

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const defaultMapCenter = { lat: 41.7151, lng: 44.8271 };

export function CheckoutAddressClient() {
  const router = useRouter();
  const { cart, isHydrated } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(true);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapMessage, setMapMessage] = useState<string | null>(null);
  const [mapSelection, setMapSelection] = useState<LocationSelection | null>(null);
  const [form, setForm] = useState<CheckoutFormState>(emptyCheckoutForm);
  const latestMapSelectionRef = useRef<LocationSelection | null>(null);
  const readMapCenterRef = useRef<(() => LocationSelection | null) | null>(null);
  const selectedItems = cart.items.filter((item) => item.selected !== false);

  useEffect(() => {
    const user = window.localStorage.getItem('user');
    const token = window.localStorage.getItem('auth_token');
    const draft = token ? readCheckoutDraft() : null;
    const prefill = readCheckoutPrefill();

    if (!token) {
      clearCheckoutDraft();
    }

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

  async function pinLocation(latitude: number, longitude: number, accuracy?: number | null, preferredFields: Partial<CheckoutFormState> = {}) {
    let locationFields: Partial<CheckoutFormState> = {};

    try {
      locationFields = await reverseGeocode(latitude, longitude);
    } catch {
      locationFields = {};
    }

    if (!locationFields.address_line_1 && window.google?.maps) {
      try {
        locationFields = await reverseGeocodeWithBrowserGoogle(latitude, longitude);
      } catch {
        locationFields = {};
      }
    }

    locationFields = mergeAddressFields(locationFields, preferredFields);

    setForm((current) => ({
      ...current,
      ...locationFields,
      latitude,
      longitude,
    }));

    if (!locationFields.address_line_1 && !locationFields.city && !locationFields.postal_code) {
      setMessage('Location pinned, but readable address was not found. Please type your address.');
      return;
    }

    setMessage(
      accuracy && accuracy > 100
        ? 'Location pinned, but GPS accuracy is low. Please confirm the written address.'
        : 'Location pinned and address filled. Please confirm the details.',
    );
  }

  function openLocationMap() {
    const existingSelection = form.latitude !== null && form.longitude !== null
      ? { latitude: form.latitude, longitude: form.longitude }
      : null;

    setIsMapOpen(true);
    setMapSelection(existingSelection);
    latestMapSelectionRef.current = existingSelection;
    readMapCenterRef.current = null;
    setMapMessage('Finding your current location...');

    if (!navigator.geolocation) {
      setMapMessage('Current location is not available in this browser. Move the pin manually.');
      return;
    }

    setIsLocating(true);
    getBestCurrentPosition()
      .then((position) => {
        const selection = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setMapSelection(selection);
        latestMapSelectionRef.current = selection;
        setMapMessage(
          position.coords.accuracy > 100
            ? 'Current location found, but GPS accuracy is low. Adjust the pin if needed, then save.'
            : 'Current location found. Adjust the pin if needed, then save.',
        );
        setIsLocating(false);
      })
      .catch(() => {
        setMapMessage('Location permission denied. Move the pin manually, then save.');
        setIsLocating(false);
      });
  }

  async function saveMapLocation() {
    const selection = readMapCenterRef.current?.() ?? latestMapSelectionRef.current ?? mapSelection;

    if (!selection) {
      setMapMessage('Choose a location on the map before saving.');
      return;
    }

    setIsLocating(true);
    await pinLocation(selection.latitude, selection.longitude, selection.accuracy, selection.addressFields);
    setIsLocating(false);
    setIsMapOpen(false);
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
      <main className="relative overflow-hidden bg-black px-4 py-14 text-white sm:px-8 sm:py-20 lg:px-10">
        <div className="relative z-[2] mx-auto max-w-[760px] rounded-[8px] border border-white/12 bg-[#101516] p-5 text-center sm:p-8">
          <h1 className="font-display text-[34px] font-black uppercase leading-none sm:text-[42px]">Your Cart Is Empty</h1>
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
    <main className="relative overflow-hidden bg-black px-4 py-10 text-white sm:px-8 sm:py-14 lg:px-10 lg:py-16">
      <CommercePage className="relative z-[2] mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <CommercePanel className="rounded-[8px] border border-white/12 bg-[#0a0a0a] p-5 sm:p-8">
        <form onSubmit={handleContinue} className="contents">
          <Link href="/cart" className="mb-6 inline-flex h-10 items-center border border-white/15 px-4 font-body text-[12px] font-bold uppercase text-white/70 transition hover:border-ember hover:text-ember">
            Back to Cart
          </Link>

          <h1 className="font-display text-[36px] font-black uppercase leading-none text-white sm:text-[44px]">Delivery Address</h1>
          <p className="mt-3 max-w-[680px] font-body text-[14px] font-normal leading-[1.7] text-white/58">
            Add your details, choose the delivery point on the map, then save it to fill the address fields.
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
                <button type="button" onClick={openLocationMap} disabled={isLocating} className="inline-flex h-11 w-full items-center justify-center gap-2 border border-ember bg-ember/10 font-body text-[13px] font-bold uppercase text-ember disabled:opacity-50">
                  <MapPinIcon />
                  {isLocating ? 'Finding Location...' : 'Choose Delivery Location'}
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

      {isMapOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 px-4 py-6">
          <div className="w-full max-w-[760px] border border-white/12 bg-[#0d0d0d] p-4 shadow-2xl sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-[24px] font-black uppercase leading-none text-white">Choose Delivery Location</h2>
                <p className="mt-2 font-body text-[13px] text-white/55">Search or move the map until the orange pin is exactly on the delivery point, then save.</p>
              </div>
              <button type="button" onClick={() => setIsMapOpen(false)} className="h-10 w-10 border border-white/12 font-body text-[18px] text-white/70 transition hover:border-ember hover:text-ember" aria-label="Close map">
                ×
              </button>
            </div>
            <MapPicker
              latitude={mapSelection?.latitude ?? form.latitude}
              longitude={mapSelection?.longitude ?? form.longitude}
              disabled={isLocating}
              onCenterReaderReady={(reader) => {
                readMapCenterRef.current = reader;
              }}
              onReady={(latitude, longitude) => {
                const selection = { latitude, longitude };
                setMapSelection(selection);
                latestMapSelectionRef.current = selection;
              }}
              onPick={(latitude, longitude, addressFields) => {
                const selection = { latitude, longitude, addressFields };
                setMapSelection(selection);
                latestMapSelectionRef.current = selection;
                setMapMessage('Pin position updated. Save this location to fill the address form.');
              }}
            />
            {mapMessage ? <p className="mt-3 font-body text-[13px] font-semibold text-amber-300">{mapMessage}</p> : null}
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setIsMapOpen(false)} className="h-11 border border-white/15 px-6 font-body text-[13px] font-bold uppercase text-white/70 transition hover:border-white/40 hover:text-white">
                Cancel
              </button>
              <button type="button" onClick={saveMapLocation} disabled={isLocating || !mapSelection} className="inline-flex h-11 items-center justify-center gap-2 bg-ember px-6 font-body text-[13px] font-bold uppercase text-white disabled:opacity-50">
                <MapPinIcon />
                {isLocating ? 'Saving Location...' : 'Save Location'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
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

function MapPinIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-current`}>
      <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );
}

function MapPicker({
  latitude,
  longitude,
  disabled,
  onCenterReaderReady,
  onReady,
  onPick,
}: {
  latitude: number | null;
  longitude: number | null;
  disabled: boolean;
  onCenterReaderReady: (reader: () => LocationSelection | null) => void;
  onReady: (latitude: number, longitude: number) => void;
  onPick: (latitude: number, longitude: number, addressFields?: Partial<CheckoutFormState>) => void;
}) {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markerRef = useRef<GoogleMarkerInstance | null>(null);
  const selectedPlaceRef = useRef<LocationSelection | null>(null);
  const [status, setStatus] = useState<string | null>(googleMapsApiKey ? null : 'Google Maps key is missing.');

  useEffect(() => {
    if (!googleMapsApiKey || !mapElementRef.current) {
      return;
    }

    let isMounted = true;

    loadGoogleMaps()
      .then((google) => {
        if (!isMounted || !mapElementRef.current) {
          return;
        }

        const center = {
          lat: latitude ?? defaultMapCenter.lat,
          lng: longitude ?? defaultMapCenter.lng,
        };

        const map = new google.maps.Map(mapElementRef.current, {
          center,
          zoom: latitude && longitude ? 17 : 12,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        });

        const marker = new google.maps.Marker({
          map,
          position: center,
          clickable: false,
        });

        mapRef.current = map;
        markerRef.current = marker;
        onCenterReaderReady(() => {
          const liveCenter = map.getCenter();

          if (!liveCenter) {
            return null;
          }

          const latitude = liveCenter.lat();
          const longitude = liveCenter.lng();
          const selectedPlace = selectedPlaceRef.current;
          const isSelectedPlaceCenter = selectedPlace
            ? Math.abs(selectedPlace.latitude - latitude) < 0.00002 && Math.abs(selectedPlace.longitude - longitude) < 0.00002
            : false;

          return {
            latitude,
            longitude,
            addressFields: isSelectedPlaceCenter ? selectedPlace?.addressFields : undefined,
          };
        });
        onReady(center.lat, center.lng);

        if (searchInputRef.current && google.maps.places?.Autocomplete) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            const location = place.geometry?.location;

            if (!location) {
              return;
            }

            const picked = { lat: location.lat(), lng: location.lng() };
            const addressFields = addressFieldsFromGooglePlace(place);
            selectedPlaceRef.current = {
              latitude: picked.lat,
              longitude: picked.lng,
              addressFields,
            };
            map.setCenter(picked);
            map.setZoom(17);
            marker.setPosition(picked);
            void onPick(picked.lat, picked.lng, addressFields);
          });
        }

        const syncToCenter = () => {
          if (disabled) {
            return;
          }

          const center = map.getCenter();

          if (!center) {
            return;
          }

          const picked = { lat: center.lat(), lng: center.lng() };
          marker.setPosition(picked);
          const selectedPlace = selectedPlaceRef.current;
          const isSelectedPlaceCenter = selectedPlace
            ? Math.abs(selectedPlace.latitude - picked.lat) < 0.00002 && Math.abs(selectedPlace.longitude - picked.lng) < 0.00002
            : false;

          void onPick(picked.lat, picked.lng, isSelectedPlaceCenter ? selectedPlace?.addressFields : undefined);
        };

        google.maps.event.addListener(map, 'click', (event: GoogleMapMouseEvent) => {
          if (!event.latLng || disabled) {
            return;
          }

          selectedPlaceRef.current = null;
          const picked = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          map.setCenter(picked);
          marker.setPosition(picked);
          void onPick(picked.lat, picked.lng);
        });

        google.maps.event.addListener(map, 'dragstart', () => {
          selectedPlaceRef.current = null;
        });
        google.maps.event.addListener(map, 'dragend', syncToCenter);
        google.maps.event.addListener(map, 'idle', syncToCenter);

        setStatus(null);
      })
      .catch(() => {
        if (isMounted) {
          setStatus('Google Maps could not be loaded.');
        }
      });

    return () => {
      isMounted = false;
      onCenterReaderReady(() => null);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || latitude === null || longitude === null) {
      return;
    }

    const position = { lat: latitude, lng: longitude };
    mapRef.current.setCenter(position);
    markerRef.current?.setPosition(position);
    mapRef.current.setZoom(17);
  }, [latitude, longitude]);

  return (
    <div className="sm:col-span-2">
      <input
        ref={searchInputRef}
        placeholder="Search area or address"
        className="mb-3 h-11 w-full border border-white/12 bg-black px-4 font-body text-[14px] text-white outline-none placeholder:text-white/35 focus:border-ember"
      />
      <div className="relative h-[260px] overflow-hidden border border-white/12 bg-[#111]">
        <div ref={mapElementRef} className="h-full w-full" />
        {!status ? (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-full flex-col items-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ember text-white shadow-[0_10px_28px_rgba(0,0,0,0.55)] ring-4 ring-white">
              <MapPinIcon className="h-6 w-6" />
            </span>
            <span className="h-3 w-3 -translate-y-1 rounded-full bg-black/55 shadow-[0_0_10px_rgba(0,0,0,0.45)]" />
          </div>
        ) : null}
        {status ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111] px-5 text-center font-body text-[13px] font-semibold text-amber-300">
            {status}
          </div>
        ) : null}
        {disabled ? <div className="absolute inset-0 bg-black/20" /> : null}
      </div>
      <p className="mt-2 font-body text-[12px] leading-[1.6] text-white/45">
        Keep the orange pin on the exact delivery point. The location under this pin is saved.
      </p>
    </div>
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
  } else {
    fields.postal_code = '';
  }

  if (data.address_line_1) {
    fields.address_line_1 = data.address_line_1;
  } else {
    fields.address_line_1 = '';
  }

  fields.address_line_2 = data.address_line_2 ?? '';

  return fields;
}

async function reverseGeocodeWithBrowserGoogle(latitude: number, longitude: number): Promise<Partial<CheckoutFormState>> {
  const google = await loadGoogleMaps();
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status !== 'OK' || !results?.length) {
        reject(new Error('Google geocode failed'));
        return;
      }

      const result = [...results].sort((a, b) => googleResultRank(a) - googleResultRank(b))[0];
      const components = result.address_components ?? [];
      const component = (type: string) => components.find((item) => item.types.includes(type))?.long_name ?? null;
      const building = uniqueJoin([component('subpremise'), component('premise')]);
      const street = uniqueJoin([
        component('street_number'),
        component('route'),
        component('sublocality_level_2'),
        component('sublocality_level_1'),
        component('neighborhood'),
      ]);

      resolve({
        city: component('locality') ?? component('postal_town') ?? component('administrative_area_level_3') ?? component('administrative_area_level_2') ?? '',
        postal_code: component('postal_code') ?? '',
        address_line_1: uniqueJoin([building, street]) || result.formatted_address || '',
        address_line_2: '',
      });
    });
  });
}

function addressFieldsFromGooglePlace(place: GooglePlaceResult): Partial<CheckoutFormState> {
  const components = place.address_components ?? [];
  const component = (type: string) => components.find((item) => item.types.includes(type))?.long_name ?? '';

  return {
    city: component('locality') || component('postal_town') || component('administrative_area_level_3') || component('administrative_area_level_2'),
    postal_code: component('postal_code'),
    address_line_1: place.formatted_address || place.name || '',
    address_line_2: '',
  };
}

function mergeAddressFields(base: Partial<CheckoutFormState>, preferred: Partial<CheckoutFormState>): Partial<CheckoutFormState> {
  const merged = { ...base };

  for (const field of ['city', 'postal_code', 'address_line_1', 'address_line_2'] as const) {
    const value = preferred[field];

    if (typeof value === 'string' && value.trim()) {
      merged[field] = value;
    }
  }

  return merged;
}

function googleResultRank(result: GoogleGeocoderResult): number {
  if (['ROOFTOP', 'RANGE_INTERPOLATED'].includes(result.geometry?.location_type ?? '')) {
    return 0;
  }

  const types = result.types ?? [];

  for (const [rank, type] of ['street_address', 'premise', 'subpremise', 'point_of_interest', 'route', 'sublocality', 'locality', 'postal_code'].entries()) {
    if (types.includes(type)) {
      return rank + 1;
    }
  }

  return 99;
}

function uniqueJoin(parts: Array<string | null | undefined>): string {
  return Array.from(new Set(parts.filter((part): part is string => Boolean(part?.trim())))).join(', ');
}

function loadGoogleMaps(): Promise<GoogleMapsNamespace> {
  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (window.__bbackGoogleMapsPromise) {
    return window.__bbackGoogleMapsPromise;
  }

  window.__bbackGoogleMapsPromise = new Promise((resolve, reject) => {
    if (!googleMapsApiKey) {
      reject(new Error('Missing Google Maps key'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        reject(new Error('Google Maps unavailable'));
      }
    };
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });

  return window.__bbackGoogleMapsPromise;
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
