import type { CustomerAddress } from '@/types/cart';

export interface CheckoutFormState {
  name: string;
  email: string;
  phone: string;
  city: string;
  postal_code: string;
  address_line_1: string;
  address_line_2: string;
  landmark: string;
  address_type: CustomerAddress['address_type'];
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  notes: string;
}

export interface CheckoutDraft {
  form: CheckoutFormState;
  selectedAddressId: number | null;
  isAddingAddress: boolean;
}

const draftKey = 'bback_checkout_draft';
const prefillKey = 'bback_checkout_prefill';
const reorderNoticeKey = 'bback_reorder_notice';

export const emptyCheckoutForm: CheckoutFormState = {
  name: '',
  email: '',
  phone: '',
  city: '',
  postal_code: '',
  address_line_1: '',
  address_line_2: '',
  landmark: '',
  address_type: 'home',
  latitude: null,
  longitude: null,
  is_default: true,
  notes: '',
};

export function readCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.sessionStorage.getItem(draftKey);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as CheckoutDraft;
  } catch {
    window.sessionStorage.removeItem(draftKey);
    return null;
  }
}

export function writeCheckoutDraft(draft: CheckoutDraft): void {
  window.sessionStorage.setItem(draftKey, JSON.stringify(draft));
}

export function clearCheckoutDraft(): void {
  window.sessionStorage.removeItem(draftKey);
}

export function readCheckoutPrefill(): Partial<CheckoutFormState> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.sessionStorage.getItem(prefillKey);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as Partial<CheckoutFormState>;
  } catch {
    window.sessionStorage.removeItem(prefillKey);
    return null;
  }
}

export function writeCheckoutPrefill(form: Partial<CheckoutFormState>): void {
  window.sessionStorage.setItem(prefillKey, JSON.stringify(form));
}

export function clearCheckoutPrefill(): void {
  window.sessionStorage.removeItem(prefillKey);
}

export function readReorderNotice(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(reorderNoticeKey);
}

export function writeReorderNotice(notice: string): void {
  window.sessionStorage.setItem(reorderNoticeKey, notice);
}

export function clearReorderNotice(): void {
  window.sessionStorage.removeItem(reorderNoticeKey);
}

export function addressToCheckoutForm(address: CustomerAddress): CheckoutFormState {
  return {
    name: address.name,
    email: address.email ?? '',
    phone: address.phone,
    city: address.city ?? '',
    postal_code: address.postal_code ?? '',
    address_line_1: address.address_line_1,
    address_line_2: address.address_line_2 ?? '',
    landmark: address.landmark ?? '',
    address_type: address.address_type,
    latitude: address.latitude,
    longitude: address.longitude,
    is_default: address.is_default,
    notes: '',
  };
}

export function formatAddressSummary(form: CheckoutFormState): string {
  return [
    form.address_line_1,
    form.address_line_2,
    [form.city, form.postal_code].filter(Boolean).join(', '),
    form.landmark ? `Landmark: ${form.landmark}` : null,
  ].filter(Boolean).join(', ');
}
