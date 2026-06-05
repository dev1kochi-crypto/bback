export interface CartItem {
  menu_item_id: number;
  category_id: number | null;
  name: string;
  category_name: string | null;
  image: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
  selected?: boolean;
}

export interface CartPayload {
  items: CartItem[];
  coupon_code: string | null;
  subtotal: string;
  discount_amount: string;
  delivery_charge_amount: string;
  tax_amount: string;
  total: string;
}

export type AddressType = 'home' | 'office' | 'other';

export interface CustomerAddress {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  postal_code: string | null;
  address_line_1: string;
  address_line_2: string | null;
  landmark: string | null;
  address_type: AddressType;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

export interface CheckoutInput {
  address_id?: number | null;
  items?: Array<{ menu_item_id: number; quantity: number }>;
  coupon_code?: string | null;
  name: string;
  email: string;
  phone: string;
  city: string;
  postal_code: string;
  address_line_1: string;
  address_line_2: string;
  landmark?: string;
  address_type?: AddressType;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
  notes: string;
}

export interface CheckoutOtpResponse {
  message: string;
  otp_required: true;
}
