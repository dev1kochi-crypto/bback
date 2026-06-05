export interface OrderItem {
  menu_item_id: number | null;
  category_id: number | null;
  name: string;
  category_name: string | null;
  image: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface OrderSummary {
  id: number;
  order_number: string;
  display_order_number: string;
  status: string;
  payment_status: string;
  coupon_code: string | null;
  subtotal: string;
  discount_amount: string;
  delivery_charge_amount: string;
  tax_amount: string;
  total: string;
  items_count: number;
  first_item: OrderItem | null;
  created_at: string | null;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[];
  name: string;
  email: string;
  phone: string;
  city: string | null;
  postal_code: string | null;
  address_line_1: string;
  address_line_2: string | null;
  landmark: string | null;
  address_type: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
}
