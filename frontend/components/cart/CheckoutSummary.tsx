'use client';

import { useCart } from '@/components/cart/CartProvider';
import { CommercePanel } from '@/components/motion/CommerceMotion';

export function CheckoutSummary() {
  const { cart } = useCart();
  const selectedItems = cart.items.filter((item) => item.selected !== false);

  return (
    <CommercePanel className="h-fit rounded-[8px] bg-[#101516] p-6" delay={0.18}>
      <h2 className="font-display text-[24px] font-semibold text-white">Order Summary</h2>
      <div className="mt-5 space-y-3 border-b border-white/10 pb-4 font-body text-[13px] text-white/82">
        {selectedItems.map((item) => (
          <div key={item.menu_item_id} className="flex justify-between gap-4">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>{item.line_total}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-3 font-body text-[13px] text-white/82">
        <div className="flex justify-between">
          <span>Products Amount</span>
          <span>{cart.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span>{cart.discount_amount}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Charge</span>
          <span>{cart.delivery_charge_amount}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{cart.tax_amount}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment</span>
          <span>Cash on Delivery</span>
        </div>
      </div>
      <div className="mt-5 flex justify-between border-t border-white/10 pt-4 font-display text-[23px] text-white">
        <span>Total</span>
        <span>{cart.total} GEL</span>
      </div>
    </CommercePanel>
  );
}
