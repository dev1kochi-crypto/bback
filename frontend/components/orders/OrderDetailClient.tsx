'use client';

import { CommerceItem, CommercePage, CommerceSection, CommerceStagger } from '@/components/motion/CommerceMotion';
import { OrderDetailLoadingState } from '@/components/orders/OrdersLoading';
import { useOrderReorder } from '@/components/orders/useOrderReorder';
import { customerOrderInvoiceUrl, getCustomerOrder } from '@/lib/api';
import type { OrderDetail } from '@/types/order';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function OrderDetailClient() {
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const { reorder, isReordering, reorderError, clearReorderError } = useOrderReorder();

  useEffect(() => {
    const token = window.localStorage.getItem('auth_token');
    const orderNumber = params.orderNumber;

    if (!token) {
      router.push('/login');
      return;
    }

    setToken(token);
    getCustomerOrder(token, orderNumber)
      .then((response) => {
        setOrder(response.order);
        setError(null);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Order not found.');
        setIsLoading(false);
      });
  }, [params.orderNumber, router]);

  const mapUrl = order ? deliveryMapUrl(order) : null;

  return (
    <section className="relative bg-black px-5 pb-14 pt-14 text-white antialiased sm:px-8 lg:px-10 lg:pb-16 lg:pt-16">
      <div className="cinematic-noise pointer-events-none absolute inset-0 opacity-35" />
      <div className="relative z-[2] mx-auto max-w-[1500px]">
        {isLoading ? <OrderDetailLoadingState /> : null}
        {!isLoading && error ? <p className="font-body text-[15px] font-semibold text-white/58">{error}</p> : null}

        {!isLoading && order ? (
          <CommercePage>
            {searchParams.get('placed') === '1' ? (
              <CommerceSection className="mb-7 rounded-[6px] border border-ember/35 bg-ember/10 px-5 py-4">
                <p className="font-display text-[22px] font-medium uppercase text-white">Order placed successfully.</p>
                <p className="mt-1.5 font-body text-[16px] font-normal leading-[1.6] text-[#DEDEDE]">
                  Your order has been received. Payment Method: <span className="text-ember">Cash on Delivery</span>.
                </p>
              </CommerceSection>
            ) : null}

            <CommerceSection className="mb-8" delay={0.05}>
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="font-display text-[30px] font-medium uppercase leading-[1.1] text-white sm:text-[32px]">
                  Order ID : {displayOrder(order)}
                </h1>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-2.5 font-body text-[16px] font-normal leading-[1.6] text-[#DEDEDE]/75">{formatDateTime(order.created_at)}</p>
            </CommerceSection>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,880px)_420px] xl:gap-12">
              <CommerceStagger className="space-y-7">
                <CommerceItem>
                <Panel title="Order Item" description="Lorem Ipsum is Simply Dummy Text Of The Printing And Typesetting Industry...">
                  <CommerceStagger className="space-y-0 border-t border-white/[0.07] pt-5">
                    {order.items.map((item) => (
                      <CommerceItem key={`${item.menu_item_id}-${item.name}`} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-b border-white/[0.07] py-5 first:pt-0 last:border-0 last:pb-0">
                        <div className="relative h-[98px] w-[132px] shrink-0 overflow-hidden rounded-full bg-white/[0.055]">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill sizes="132px" className="object-cover" />
                          ) : (
                            <div className="grid h-full w-full place-items-center font-display text-[22px] text-ember">B</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 w-full sm:w-auto">
                          <h2 className="font-display text-[24px] sm:text-[30px] font-medium leading-[1.1] text-white">{item.name}</h2>
                          <p className="mt-2.5 font-body text-[16px] sm:text-[18px] font-normal leading-[1.35] text-[#DEDEDE]/85">{item.category_name ?? 'Menu item'}</p>
                          <p className="mt-2 line-clamp-1 font-body text-[14px] font-normal leading-[1.55] text-[#DEDEDE]/72">{itemDescription(item.category_name)}</p>
                        </div>
                        <p className="self-start sm:self-center font-display text-[24px] sm:text-[28px] font-medium text-white">{item.line_total}</p>
                      </CommerceItem>
                    ))}
                  </CommerceStagger>
                </Panel>
                </CommerceItem>

                <CommerceItem>
                <Panel title="Order Summary" description="Lorem Ipsum is Simply Dummy Text Of The Printing And Typesetting Industry..." action={paymentStatusLabel(order.payment_status)}>
                  <div className="border-t border-white/[0.07] pt-5">
                    <div className="space-y-3">
                      {summaryRows(order).map((row) => (
                        <SummaryRow key={row.label} {...row} />
                      ))}
                    </div>
                    {reorderError ? (
                      <p className="mt-5 font-body text-[13px] leading-[1.5] text-amber-300">
                        {reorderError}
                        <button type="button" onClick={clearReorderError} className="ml-2 underline">Dismiss</button>
                      </p>
                    ) : null}
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
                      <p className="font-body text-[14px] font-normal leading-[1.55] text-[#DEDEDE]">
                        Reorder this purchase or download your invoice.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => reorder(order.order_number)}
                          disabled={isReordering}
                          className="inline-flex h-9 items-center justify-center gap-2 bg-ember px-5 font-body text-[13px] font-medium text-white disabled:opacity-60"
                        >
                          <Image src="/app/images/ic_baseline-whatsapp.png" alt="" width={14} height={14} className="h-[14px] w-[14px] object-contain" unoptimized />
                          {isReordering ? 'Loading...' : 'Re-Order'}
                        </button>
                        {token ? (
                          <a
                            href={customerOrderInvoiceUrl(token, order.order_number)}
                            download
                            className="inline-flex h-9 items-center justify-center bg-ember px-5 font-body text-[13px] font-medium text-white"
                          >
                            Download Invoice
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Panel>
                </CommerceItem>
              </CommerceStagger>

              <CommerceStagger className="space-y-7">
                <CommerceItem>
                <Panel title="Customers" compact>
                  <div className="flex items-center gap-3.5 border-t border-white/[0.07] pt-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#ff7a00,#31363a)] font-display text-[17px] font-medium uppercase text-white">
                      {initials(order.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-display text-[18px] font-medium leading-[1.2] text-white">{order.name}</p>
                      <p className="mt-1 font-body text-[14px] font-normal leading-[1.45] text-[#DEDEDE]/72">Customer account</p>
                    </div>
                  </div>
                </Panel>
                </CommerceItem>

                <CommerceItem>
                <Panel title="Contact Information" compact>
                  <IconLine icon="mail" value={order.email} />
                  <IconLine icon="phone" value={order.phone} />
                </Panel>
                </CommerceItem>

                <CommerceItem>
                <Panel title="Delivery Address" compact>
                  <IconLine
                    accent
                    icon="location"
                    value={[
                      order.address_line_1,
                      order.address_line_2,
                      [order.city, order.postal_code].filter(Boolean).join(' - '),
                      order.landmark ? `Landmark: ${order.landmark}` : null,
                    ].filter(Boolean).join('\n')}
                  />
                  {mapUrl ? (
                    <a
                      className="mt-3 flex items-center gap-2 font-body text-[13px] font-medium text-ember"
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <DetailIcon name="map" />
                      <span>View Map</span>
                    </a>
                  ) : null}
                </Panel>
                </CommerceItem>

                <CommerceItem>
                <Panel title="Payment" compact>
                  <IconLine icon="card" label="Payment Method" value="Cash on Delivery" />
                  <IconLine icon="calendar" label="Payment Date" value={formatDateTime(order.created_at)} />
                </Panel>
                </CommerceItem>
              </CommerceStagger>
            </div>

            <CommerceSection className="mt-8" delay={0.2}>
              <Link href="/orders" className="inline-flex h-10 items-center justify-center border border-white/16 px-5 font-body text-[14px] font-medium uppercase text-white transition hover:border-ember hover:text-ember">
                Back To Orders
              </Link>
            </CommerceSection>
          </CommercePage>
        ) : null}
      </div>
    </section>
  );
}

function Panel({ title, action, compact = false, description, children }: { title: string; action?: string; compact?: boolean; description?: string; children: React.ReactNode }) {
  return (
    <section className={['rounded-[8px] border border-white/[0.09] bg-[#080d0e] shadow-none', compact ? 'p-[18px]' : 'p-6'].join(' ')}>
      <div className={['flex items-start justify-between gap-4', compact ? 'pb-0' : 'pb-0'].join(' ')}>
        <div>
          <h2 className="font-display text-[20px] font-medium leading-[1.35] text-white">{title}</h2>
          {description ? <p className="mt-2 font-body text-[16px] font-normal leading-[1.6] text-[#DEDEDE]">{description}</p> : null}
        </div>
        {action ? <StatusBadge status={action} small /> : null}
      </div>
      <div className={description ? 'mt-5' : compact ? 'mt-4' : 'mt-5'}>{children}</div>
    </section>
  );
}

type SummaryRowData = {
  label: string;
  detail: string;
  amount: string;
  strong?: boolean;
};

function SummaryRow({ label, detail, amount, strong = false }: SummaryRowData) {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[minmax(92px,1fr)_minmax(120px,1fr)_minmax(86px,0.8fr)] sm:items-center gap-1 sm:gap-5 font-body text-[14px] font-normal leading-[1.45] py-2 sm:py-0 border-b border-white/[0.05] sm:border-0 last:border-0">
      <span className={strong ? 'font-medium text-white' : 'text-[#DEDEDE]'}>{label}</span>
      {detail ? <span className={strong ? 'font-medium text-white' : 'text-[#DEDEDE]'}>{detail}</span> : null}
      <span className={strong ? 'sm:text-right font-medium text-white mt-1 sm:mt-0' : 'sm:text-right text-[#DEDEDE] mt-1 sm:mt-0'}>{amount}</span>
    </div>
  );
}

function summaryRows(order: OrderDetail): SummaryRowData[] {
  const discountAmount = Number(order.discount_amount);
  const deliveryAmount = Number(order.delivery_charge_amount);

  return [
    {
      label: 'Subtotal',
      detail: `${order.items_count} item${order.items_count === 1 ? '' : 's'}`,
      amount: order.subtotal,
    },
    {
      label: 'Discount',
      detail: order.coupon_code || (discountAmount > 0 ? 'Discount Applied' : 'No Discount'),
      amount: discountAmount > 0 ? order.discount_amount : '',
    },
    {
      label: 'Delivery',
      detail: deliveryAmount > 0 ? 'Delivery Charge' : 'Free Delivery',
      amount: deliveryAmount > 0 ? order.delivery_charge_amount : '',
    },
    {
      label: 'Total Amount',
      detail: '',
      amount: order.total,
      strong: true,
    },
  ];
}

function StatusBadge({ status, small = false }: { status: string; small?: boolean }) {
  return (
    <span className={['inline-flex items-center justify-center bg-ember font-body font-normal text-white', small ? 'h-9 px-4 text-[14px]' : 'h-9 px-5 text-[14px]'].join(' ')}>
      {statusLabel(status)}
    </span>
  );
}

function IconLine({ icon, value, label, accent = false }: { icon: IconName; value: string | null; label?: string; accent?: boolean }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex gap-2.5 py-1.5 first:pt-0 last:pb-0">
      <span className={['mt-0.5 grid h-4 w-4 shrink-0 place-items-center', accent ? 'text-ember' : 'text-white/50'].join(' ')}>
        <DetailIcon name={icon} />
      </span>
      <div className="min-w-0">
        {label ? <p className="font-body text-[14px] font-normal leading-[1.35] text-[#DEDEDE]/65">{label}</p> : null}
        {value.split('\n').map((line) => (
          <p key={line} className={['font-body text-[16px] font-normal leading-[1.6]', label ? 'mt-1' : '', accent ? 'text-[#DEDEDE]' : 'text-[#DEDEDE]/86'].join(' ')}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

type IconName = 'mail' | 'phone' | 'location' | 'card' | 'calendar' | 'map';

function DetailIcon({ name }: { name: IconName }) {
  if (name === 'mail') {
    return (
      <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </svg>
    );
  }

  if (name === 'phone') {
    return (
      <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.61a2 2 0 0 1-.45 2.11L8.09 9.58a16 16 0 0 0 6.33 6.33l1.14-1.14a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.61.62A2 2 0 0 1 22 16.92Z" />
      </svg>
    );
  }

  if (name === 'location') {
    return (
      <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  if (name === 'calendar') {
    return (
      <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </svg>
    );
  }

  if (name === 'map') {
    return (
      <svg aria-hidden="true" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'BB';
}

function itemDescription(category: string | null): string {
  if ((category ?? '').toLowerCase().includes('pizza')) {
    return 'Spinach, Mozzarella, Carrot, Mushroom, Basil, Pizza Sauce';
  }

  if ((category ?? '').toLowerCase().includes('sandwich')) {
    return 'Toasted bread, fresh filling, signature sauce';
  }

  return 'Fresh ingredients with B.back signature seasoning';
}

function displayOrder(order: Pick<OrderDetail, 'display_order_number' | 'order_number'>): string {
  return order.display_order_number || `#${order.order_number.replace(/^#/, '')}`;
}

function deliveryMapUrl(order: OrderDetail): string | null {
  if (order.latitude != null && order.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.latitude},${order.longitude}`)}`;
  }

  const address = [order.address_line_1, order.address_line_2, order.city, order.postal_code, order.landmark]
    .filter(Boolean)
    .join(', ');

  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
}

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function paymentStatusLabel(status: string | null | undefined): string {
  const label = statusLabel(status || 'pending');

  return label.toLowerCase().startsWith('payment') ? label : `Payment ${label}`;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Order date unavailable';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
