import type { CartItem } from '@/types/cart';
import { getOrderReorderPayload } from '@/lib/api';
import {
  clearCheckoutDraft,
  clearCheckoutPrefill,
  clearReorderNotice,
  writeCheckoutDraft,
  writeReorderNotice,
  type CheckoutFormState,
} from '@/lib/checkoutStorage';

export class ReorderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReorderError';
  }
}

export async function executeOrderReorder(
  token: string,
  orderNumber: string,
  loadCheckoutItems: (items: CartItem[], merge?: boolean) => void,
  router: { push: (href: string) => void },
): Promise<void> {
  const payload = await getOrderReorderPayload(token, orderNumber);

  if (!payload.items.length) {
    throw new ReorderError(payload.notice ?? 'No available items to reorder.');
  }

  clearCheckoutDraft();
  clearCheckoutPrefill();

  const address = payload.address;
  const form: CheckoutFormState = {
    name: address.name,
    email: address.email,
    phone: address.phone,
    city: address.city ?? '',
    postal_code: address.postal_code ?? '',
    address_line_1: address.address_line_1,
    address_line_2: address.address_line_2 ?? '',
    landmark: address.landmark ?? '',
    address_type: (address.address_type as CheckoutFormState['address_type']) ?? 'home',
    latitude: address.latitude,
    longitude: address.longitude,
    is_default: false,
    notes: address.notes ?? '',
  };

  writeCheckoutDraft({
    form,
    selectedAddressId: address.address_id,
    isAddingAddress: !address.address_id,
  });

  if (payload.notice) {
    writeReorderNotice(payload.notice);
  } else {
    clearReorderNotice();
  }

  loadCheckoutItems(
    payload.items.map((item) => ({
      menu_item_id: item.menu_item_id,
      category_id: item.category_id,
      name: item.name,
      category_name: item.category_name,
      image: item.image,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
      selected: true,
    })),
    true,
  );

  router.push('/checkout/review');
}
