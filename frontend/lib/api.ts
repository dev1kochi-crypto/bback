import axios from 'axios';
import type { Banner } from '@/types/banner';
import type { AboutUsPayload } from '@/types/about';
import type { AuthResponse, AuthUser, MessageResponse, VerifyOtpResponse } from '@/types/auth';
import type { CartPayload, CheckoutInput, CheckoutOtpResponse, CustomerAddress } from '@/types/cart';
import type { ContactEnquiryInput, ContactPayload } from '@/types/contact';
import type { PageMetadataPayload } from '@/types/metadata';
import type { MenuItem, MenuPayload } from '@/types/menu';
import type { OrderDetail, OrderSummary } from '@/types/order';
import type { OrderProcessPayload } from '@/types/orderProcess';
import type { OffersPayload } from '@/types/offer';
import type { SitePayload } from '@/types/site';
import type { TestimonialsPayload } from '@/types/testimonial';

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

export const defaultSitePayload: SitePayload = {
  logo: '/app/images/logo.svg',
  logo_alt: 'B.back',
  company_name: 'B.back',
  phone: null,
  email: null,
  whatsapp: null,
  address: null,
  google_map_link: null,
  opening_hours: null,
  delivery_free_above_amount: '0.00',
  delivery_charge_amount: '0.00',
  tax_amount: '0.00',
  privacy_policy: null,
  terms_and_conditions: null,
  nav_items: [
    { label: 'Home', url: '/' },
    { label: 'About', url: '/about' },
    { label: 'Our Menu', url: '/menu' },
    { label: 'Offers', url: '/offers' },
    { label: 'Contact', url: '/contact' },
  ],
  footer: {
    description: null,
    privacy_policy_url: null,
    terms_url: null,
    menu_links: [],
    social: {},
  },
  seo: {
    gtm_container_ids: [],
    custom_head_script: null,
    custom_body_script: null,
  },
};

export const defaultAboutPayload: AboutUsPayload = {
  about: null,
  why_choose_us: null,
  site: defaultSitePayload,
};

export const defaultMenuPayload: MenuPayload = {
  section: null,
  categories: [],
  items: [],
  signature_section: null,
  signature_items: [],
};

function toMenuId(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeMenuItem(item: MenuItem): MenuItem {
  return {
    ...item,
    id: Number(item.id),
    category_id: toMenuId(item.category_id),
    sort_order: Number(item.sort_order ?? 0),
    spicy: Boolean(item.spicy),
  };
}

export function normalizeMenuPayload(payload: MenuPayload): MenuPayload {
  return {
    ...payload,
    categories: (payload.categories ?? []).map((category) => ({
      ...category,
      id: Number(category.id),
      sort_order: Number(category.sort_order ?? 0),
    })),
    items: (payload.items ?? []).map((item) => normalizeMenuItem(item)),
    signature_items: (payload.signature_items ?? []).map((item) => ({
      ...item,
      id: Number(item.id),
      menu_item_id: toMenuId(item.menu_item_id),
      sort_order: Number(item.sort_order ?? 0),
      menu_item: item.menu_item ? normalizeMenuItem(item.menu_item) : null,
    })),
  };
}

export function menuCategoryMatches(itemCategoryId: number | null, activeCategory: number | 'all'): boolean {
  if (activeCategory === 'all') {
    return true;
  }

  if (itemCategoryId === null) {
    return false;
  }

  return Number(itemCategoryId) === Number(activeCategory);
}

export const defaultOrderProcessPayload: OrderProcessPayload = {
  section: null,
  items: [],
};

export const defaultTestimonialsPayload: TestimonialsPayload = {
  section: null,
  items: [],
};

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

export async function getSite(): Promise<SitePayload> {
  const response = await api.get<SitePayload>('/api/site');

  return response.data;
}

export async function getBanners(): Promise<Banner[]> {
  const response = await api.get<Banner[]>('/api/banners');

  return response.data
    .filter((banner) => banner.status === 1)
    .sort((a, b) => a.order - b.order);
}

export async function getAboutUs(): Promise<AboutUsPayload> {
  const response = await api.get<AboutUsPayload>('/api/about-us');

  return response.data;
}

export async function getContact(): Promise<ContactPayload> {
  const response = await api.get<ContactPayload>('/api/contact');

  return response.data;
}

export async function getOffers(): Promise<OffersPayload> {
  const response = await api.get<OffersPayload>('/api/offers');

  return response.data;
}

export async function getMenus(): Promise<MenuPayload> {
  const response = await api.get<MenuPayload>('/api/menus');

  return normalizeMenuPayload(response.data);
}

export async function getOrderProcess(): Promise<OrderProcessPayload> {
  const response = await api.get<OrderProcessPayload>('/api/order-process');

  return response.data;
}

export async function getTestimonials(): Promise<TestimonialsPayload> {
  const response = await api.get<TestimonialsPayload>('/api/testimonials');

  return response.data;
}

export async function getPageMetadata(pageKey: string): Promise<PageMetadataPayload | null> {
  const response = await api.get<PageMetadataPayload | null>(`/api/metadata/${pageKey}`);

  return response.data;
}

export async function submitContactEnquiry(payload: ContactEnquiryInput): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/api/contact/enquiries', payload);

  return response.data;
}

export async function submitNewsletterSignup(payload: { email: string }): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/api/newsletter-signups', payload);

  return response.data;
}

export async function loginCustomer(payload: { email: string; password: string }): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login', payload);

  return response.data;
}

export async function sendLoginOtp(payload: { phone: string }): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>('/api/auth/login/send-otp', payload);

  return response.data;
}

export async function verifyLoginOtp(payload: { phone: string; otp: string }): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login/verify-otp', payload);

  return response.data;
}

export async function sendPasswordOtp(payload: { email: string }): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>('/api/auth/forgot-password', payload);

  return response.data;
}

export async function verifyPasswordOtp(payload: { email: string; otp: string }): Promise<VerifyOtpResponse> {
  const response = await api.post<VerifyOtpResponse>('/api/auth/verify-otp', payload);

  return response.data;
}

export async function resetCustomerPassword(payload: {
  email: string;
  reset_token: string;
  password: string;
  password_confirmation: string;
}): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>('/api/auth/reset-password', payload);

  return response.data;
}

export async function getCurrentCustomer(token: string): Promise<{ user: AuthUser }> {
  const response = await api.get<{ user: AuthUser }>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function logoutCustomer(token: string): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>('/api/auth/logout', null, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function getServerCart(token: string): Promise<CartPayload> {
  const response = await api.get<CartPayload>('/api/cart', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function syncServerCart(token: string, payload: { items: Array<{ menu_item_id: number; quantity: number }>; coupon_code?: string | null }): Promise<CartPayload> {
  const response = await api.post<CartPayload>('/api/cart/sync', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function applyServerCoupon(token: string, code: string | null): Promise<CartPayload> {
  const response = await api.post<CartPayload>('/api/cart/coupon', { code }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function getCustomerAddresses(token: string): Promise<{ addresses: CustomerAddress[] }> {
  const response = await api.get<{ addresses: CustomerAddress[] }>('/api/cart/addresses', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function saveCustomerAddress(token: string, payload: CheckoutInput): Promise<{ message: string; address: CustomerAddress }> {
  const response = await api.post<{ message: string; address: CustomerAddress }>('/api/cart/addresses', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function submitCheckout(token: string | null, payload: CheckoutInput): Promise<{
  message: string;
  order_number: string;
  token: string | null;
  user: AuthUser | null;
  address: CustomerAddress;
  password_setup_required: boolean;
  otp_required: false;
} | CheckoutOtpResponse> {
  const response = await api.post('/api/cart/checkout', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return response.data;
}

export async function verifyCheckoutOtp(payload: CheckoutInput & { otp: string }): Promise<{
  message: string;
  order_number: string;
  token: string;
  user: AuthUser;
  address: CustomerAddress;
  password_setup_required: boolean;
  otp_required: false;
}> {
  const response = await api.post('/api/cart/checkout/verify-otp', payload);

  return response.data;
}

export async function reverseGeocodeLocation(payload: { latitude: number; longitude: number }): Promise<{
  city?: string | null;
  postal_code?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  formatted_address?: string | null;
  provider?: string | null;
}> {
  const response = await api.get('/api/location/reverse-geocode', {
    params: payload,
  });

  return response.data;
}

export async function getCustomerOrders(token: string): Promise<{ orders: OrderSummary[] }> {
  const response = await api.get<{ orders: OrderSummary[] }>('/api/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function getCustomerOrder(token: string, orderNumber: string): Promise<{ order: OrderDetail }> {
  const response = await api.get<{ order: OrderDetail }>(`/api/orders/${encodeURIComponent(orderNumber)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export interface OrderReorderItem {
  menu_item_id: number;
  category_id: number | null;
  name: string;
  category_name: string | null;
  image: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface OrderReorderPayload {
  items: OrderReorderItem[];
  unavailable_items: Array<{ name: string; reason: string }>;
  notice: string | null;
  address: {
    address_id: number | null;
    name: string;
    email: string;
    phone: string;
    city: string | null;
    postal_code: string | null;
    address_line_1: string;
    address_line_2: string | null;
    landmark: string | null;
    address_type: string | null;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
  };
}

export async function getOrderReorderPayload(token: string, orderNumber: string): Promise<OrderReorderPayload> {
  const response = await api.get<OrderReorderPayload>(`/api/orders/${encodeURIComponent(orderNumber)}/reorder`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export function customerOrderInvoiceUrl(token: string, orderNumber: string): string {
  const params = new URLSearchParams({ token });

  return `${apiBaseUrl}/api/orders/${encodeURIComponent(orderNumber)}/invoice?${params.toString()}`;
}

export function socialLoginUrl(provider: 'google' | 'apple'): string {
  return `${apiBaseUrl}/api/auth/social/${provider}`;
}

export function absoluteAssetUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith('/app/images/')) {
    return path;
  }

  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
