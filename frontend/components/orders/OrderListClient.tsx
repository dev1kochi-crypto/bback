'use client';

import { CommerceItem, CommercePage, CommerceStagger } from '@/components/motion/CommerceMotion';
import { OrderListLoadingState } from '@/components/orders/OrdersLoading';
import { useOrderReorder } from '@/components/orders/useOrderReorder';
import { getCustomerOrders } from '@/lib/api';
import type { OrderSummary } from '@/types/order';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function OrderListClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem('auth_token');

    if (!token) {
      router.push('/login');
      return;
    }

    getCustomerOrders(token)
      .then((response) => {
        setOrders(response.orders);
        setEmptyMessage(response.orders.length ? null : 'No orders yet.');
        setIsLoading(false);
      })
      .catch(() => {
        window.localStorage.removeItem('auth_token');
        window.localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        router.push('/login');
      });
  }, [router]);

  return (
    <section className="relative bg-black px-5 py-14 text-white sm:px-8 lg:px-10 lg:py-16">
      <CommercePage className="relative z-[2] mx-auto max-w-[1520px]">
        {isLoading ? <OrderListLoadingState /> : null}
        {!isLoading && emptyMessage ? <p className="font-body text-[15px] font-normal text-white/55">{emptyMessage}</p> : null}

        {!isLoading && orders.length ? (
          <CommerceStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orders.map((order) => (
              <CommerceItem key={order.id}>
                <OrderCard order={order} />
              </CommerceItem>
            ))}
          </CommerceStagger>
        ) : null}
      </CommercePage>
    </section>
  );
}

function OrderCard({ order }: { order: OrderSummary }) {
  const { reorder, isReordering, reorderError, clearReorderError } = useOrderReorder();
  const item = order.first_item;

  return (
    <article className="rounded-[8px] bg-[#232323] px-[18px] py-[16px]">
      <p className="font-body text-[12px] font-normal leading-none text-white/45">Order ID {displayOrder(order)}</p>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full bg-[#3a3a3a]">
          {item?.image ? (
            <Image src={item.image} alt={item.name} fill sizes="52px" className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center font-display text-[18px] text-ember">B</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-[16px] font-medium leading-tight text-white">{item?.name ?? 'B.back Order'}</h2>
          <p className="mt-1 truncate font-body text-[12px] font-normal leading-none text-white/45">
            {item?.category_name ?? `${order.items_count} item${order.items_count === 1 ? '' : 's'}`}
          </p>
        </div>

        <p className="shrink-0 font-display text-[26px] font-medium leading-none text-white">{order.total}</p>
      </div>

      <div className="mt-3">
        <p className="font-body text-[11px] font-normal leading-none text-white/45">Order placed on {formatOrderDate(order.created_at)}</p>
        <p className={`mt-1.5 font-body text-[12px] font-medium leading-none ${statusColor(order.status)}`}>{statusLabel(order.status)}</p>
      </div>

      {reorderError ? (
        <p className="mt-3 font-body text-[11px] leading-[1.5] text-amber-300">
          {reorderError}
          <button type="button" onClick={clearReorderError} className="ml-2 underline">Dismiss</button>
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => reorder(order.order_number)}
          disabled={isReordering}
          className="inline-flex h-[34px] items-center justify-center gap-2 rounded-[4px] bg-ember px-3 font-body text-[11px] font-medium uppercase tracking-[0.02em] text-white transition hover:bg-[#ff8e22] disabled:opacity-60"
        >
          <Image src="/app/images/ic_baseline-whatsapp.png" alt="" width={14} height={14} className="h-[14px] w-[14px] object-contain" unoptimized />
          {isReordering ? 'Loading...' : 'Re-Order'}
        </button>
        <Link
          href={`/orders/${encodeURIComponent(order.order_number)}`}
          className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-white/35 px-3 font-body text-[11px] font-medium uppercase tracking-[0.02em] text-white transition hover:border-white hover:text-white"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

function displayOrder(order: Pick<OrderSummary, 'display_order_number' | 'order_number'>): string {
  const value = order.display_order_number || order.order_number.replace(/^#/, '');

  return value.startsWith('#') ? value : `#${value}`;
}

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusColor(status: string): string {
  const normalized = status.toLowerCase();

  if (normalized === 'delivered') {
    return 'text-[#3dd66e]';
  }

  if (normalized === 'cancelled') {
    return 'text-[#ff4d4d]';
  }

  return 'text-ember';
}

function formatOrderDate(value: string | null): string {
  if (!value) {
    return 'date unavailable';
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
