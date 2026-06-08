@extends('cms-kit::layouts.cms')

@section('title', 'Dashboard')

@section('breadcrumbs')
    <li class="breadcrumb-item active" aria-current="page">Overview</li>
@endsection

@section('content')
@php
    $money = fn ($value) => number_format((float) $value, 2) . ' GEL';
    $label = fn ($status) => ucwords(str_replace('_', ' ', (string) $status));
    $statusClass = function ($status) {
        return match ($status) {
            'delivered' => 'success',
            'cancelled' => 'danger',
            'preparing', 'out_for_delivery' => 'warning',
            'confirmed' => 'info',
            'pending' => 'warning',
            default => 'secondary',
        };
    };
    $statusBarClass = function ($status) {
        return match ($status) {
            'delivered' => 'status-bar-delivered',
            'cancelled' => 'status-bar-cancelled',
            'preparing', 'out_for_delivery' => 'status-bar-progress',
            'confirmed' => 'status-bar-confirmed',
            'pending' => 'status-bar-pending',
            default => 'status-bar-muted',
        };
    };
@endphp

<div class="dashboard-commerce">
    <div class="row g-3 mb-4 kpi-row">
        <div class="col-xl-2 col-lg-4 col-md-6">
            <div class="commerce-kpi kpi-primary">
                <div>
                    <span>Gross Sales</span>
                    <strong>{{ $money($stats['gross_sales']) }}</strong>
                    <small>Today {{ $money($stats['today_sales']) }} · Week {{ $money($stats['week_sales']) }}</small>
                </div>
                <i class="fas fa-chart-line"></i>
            </div>
        </div>
        <div class="col-xl-2 col-lg-4 col-md-6">
            <div class="commerce-kpi">
                <div>
                    <span>Orders</span>
                    <strong>{{ $stats['total_orders'] }}</strong>
                    <small>{{ $stats['today_orders'] }} today · {{ $stats['week_orders'] }} this week</small>
                </div>
                <i class="fas fa-receipt"></i>
            </div>
        </div>
        <div class="col-xl-2 col-lg-4 col-md-6">
            <div class="commerce-kpi kpi-success">
                <div>
                    <span>Avg Order Value</span>
                    <strong>{{ $money($stats['avg_order_value']) }}</strong>
                    <small>{{ $stats['items_sold'] }} items sold · {{ $stats['unique_customers'] }} customers</small>
                </div>
                <i class="fas fa-shopping-basket"></i>
            </div>
        </div>
        <div class="col-xl-2 col-lg-4 col-md-6">
            <div class="commerce-kpi kpi-info">
                <div>
                    <span>Paid Revenue</span>
                    <strong>{{ $money($stats['paid_sales']) }}</strong>
                    <small>{{ $stats['paid_orders'] }} paid · {{ $money($stats['unpaid_sales']) }} unpaid</small>
                </div>
                <i class="fas fa-credit-card"></i>
            </div>
        </div>
        <div class="col-xl-2 col-lg-4 col-md-6">
            <div class="commerce-kpi kpi-warning">
                <div>
                    <span>Active Pipeline</span>
                    <strong>{{ $stats['active_orders'] }}</strong>
                    <small>{{ $money($stats['pending_sales']) }} pending · {{ $stats['completed_orders'] }} delivered</small>
                </div>
                <i class="fas fa-hourglass-half"></i>
            </div>
        </div>
        <div class="col-xl-2 col-lg-4 col-md-6">
            <div class="commerce-kpi kpi-danger">
                <div>
                    <span>Cancelled</span>
                    <strong>{{ $money($stats['cancelled_value']) }}</strong>
                    <small>{{ $stats['cancelled_orders'] }} orders · {{ $stats['payment_pending'] }} payment pending</small>
                </div>
                <i class="fas fa-ban"></i>
            </div>
        </div>
    </div>

    <div class="row g-4 dashboard-layout-row">
        <div class="col-xl-8 dashboard-main-col">
            <div class="dashboard-main-stack">
            <div class="commerce-panel">
                <div class="commerce-panel-header">
                    <div>
                        <h5>Sales Snapshot</h5>
                        <p id="salesSnapshotSubtitle">{{ $orderChartPayload['subtitle'] }}</p>
                    </div>
                    @if($cmsUser->can('customer-orders.view'))
                        <a href="{{ route('cms.customer-orders.index') }}" class="btn btn-sm btn-outline-primary">View Orders</a>
                    @endif
                </div>
                <div class="commerce-metrics-grid commerce-metrics-grid-wide" id="salesSnapshotGrid">
                    <div>
                        <span>Gross Sales</span>
                        <strong data-period-stat="gross_sales" data-period-format="money">{{ $money($orderChartPayload['stats']['gross_sales']) }}</strong>
                    </div>
                    <div>
                        <span>Subtotal</span>
                        <strong data-period-stat="subtotal" data-period-format="money">{{ $money($orderChartPayload['stats']['subtotal']) }}</strong>
                    </div>
                    <div>
                        <span>Total Orders</span>
                        <strong data-period-stat="total_orders" data-period-format="integer">{{ $orderChartPayload['stats']['total_orders'] }}</strong>
                    </div>
                    <div>
                        <span>Items Sold</span>
                        <strong data-period-stat="items_sold" data-period-format="integer">{{ $orderChartPayload['stats']['items_sold'] }}</strong>
                    </div>
                    <div>
                        <span>Completed Sales</span>
                        <strong data-period-stat="completed_sales" data-period-format="money">{{ $money($orderChartPayload['stats']['completed_sales']) }}</strong>
                    </div>
                    <div>
                        <span>Pending Sales</span>
                        <strong data-period-stat="pending_sales" data-period-format="money">{{ $money($orderChartPayload['stats']['pending_sales']) }}</strong>
                    </div>
                    <div>
                        <span>Paid Collected</span>
                        <strong data-period-stat="paid_sales" data-period-format="money">{{ $money($orderChartPayload['stats']['paid_sales']) }}</strong>
                    </div>
                    <div>
                        <span>Unpaid Value</span>
                        <strong data-period-stat="unpaid_sales" data-period-format="money">{{ $money($orderChartPayload['stats']['unpaid_sales']) }}</strong>
                    </div>
                    <div>
                        <span>Avg Order Value</span>
                        <strong data-period-stat="avg_order_value" data-period-format="money">{{ $money($orderChartPayload['stats']['avg_order_value']) }}</strong>
                    </div>
                    <div>
                        <span>Discount Given</span>
                        <strong data-period-stat="discounts" data-period-format="money">{{ $money($orderChartPayload['stats']['discounts']) }}</strong>
                    </div>
                    <div>
                        <span>Delivery Collected</span>
                        <strong data-period-stat="delivery_collected" data-period-format="money">{{ $money($orderChartPayload['stats']['delivery_collected']) }}</strong>
                    </div>
                    <div>
                        <span>Tax Collected</span>
                        <strong data-period-stat="tax_collected" data-period-format="money">{{ $money($orderChartPayload['stats']['tax_collected']) }}</strong>
                    </div>
                    <div>
                        <span>Cancelled Orders</span>
                        <strong data-period-stat="cancelled_orders" data-period-format="integer">{{ $orderChartPayload['stats']['cancelled_orders'] }}</strong>
                    </div>
                    <div>
                        <span>Cancelled Value</span>
                        <strong data-period-stat="cancelled_sales" data-period-format="money">{{ $money($orderChartPayload['stats']['cancelled_sales']) }}</strong>
                    </div>
                    <div>
                        <span>Coupons Active</span>
                        <strong>{{ $stats['active_coupons'] }} / {{ $stats['coupons'] }}</strong>
                    </div>
                </div>
            </div>

            <div class="commerce-panel orders-panel" id="ordersChartPanel"
                data-chart-url="{{ route('cms.dashboard.orders-chart') }}"
                data-initial-payload='@json($orderChartPayload)'>
                <div class="commerce-panel-header">
                    <div>
                        <h5>Orders Graph</h5>
                        <p id="ordersChartSubtitle">{{ $orderChartPayload['subtitle'] }}</p>
                    </div>
                    <div class="chart-header-actions">
                        <div class="chart-period-tabs" role="tablist" aria-label="Chart time period">
                            <button type="button" class="chart-period-tab {{ $chartPeriod === 'hour' ? 'is-active' : '' }}" data-period="hour" role="tab" aria-selected="{{ $chartPeriod === 'hour' ? 'true' : 'false' }}">Hour</button>
                            <button type="button" class="chart-period-tab {{ $chartPeriod === 'day' ? 'is-active' : '' }}" data-period="day" role="tab" aria-selected="{{ $chartPeriod === 'day' ? 'true' : 'false' }}">Day</button>
                            <button type="button" class="chart-period-tab {{ $chartPeriod === 'week' ? 'is-active' : '' }}" data-period="week" role="tab" aria-selected="{{ $chartPeriod === 'week' ? 'true' : 'false' }}">Week</button>
                            <button type="button" class="chart-period-tab {{ $chartPeriod === 'month' ? 'is-active' : '' }}" data-period="month" role="tab" aria-selected="{{ $chartPeriod === 'month' ? 'true' : 'false' }}">Month</button>
                        </div>
                        <div class="chart-summary">
                            <span id="ordersChartTotal">{{ $orderChartPayload['summary']['total_orders'] }} orders</span>
                            <small id="ordersChartPeak">Peak: {{ $orderChartPayload['summary']['peak_orders'] }} on {{ $orderChartPayload['summary']['peak_label'] }}</small>
                        </div>
                    </div>
                </div>
                <div class="chart-detail-strip">
                    <div>
                        <span>Total Sales</span>
                        <strong id="ordersChartTotalSales">{{ $money($orderChartPayload['summary']['total_sales']) }}</strong>
                    </div>
                    <div>
                        <span>Avg Order Value</span>
                        <strong id="ordersChartAvgOrder">{{ $money($orderChartPayload['summary']['avg_order_value']) }}</strong>
                    </div>
                    <div>
                        <span>Avg per Bucket</span>
                        <strong id="ordersChartAvgBucket">{{ number_format($orderChartPayload['summary']['avg_orders'], 2) }} orders</strong>
                    </div>
                    <div>
                        <span>Peak Sales</span>
                        <strong id="ordersChartPeakSales">{{ $money($orderChartPayload['summary']['peak_sales']) }} <small>({{ $orderChartPayload['summary']['peak_sales_label'] }})</small></strong>
                    </div>
                </div>
                <div class="orders-chart">
                    <div class="orders-chart-stage" id="ordersChartStage">
                        <svg class="orders-line-chart" id="ordersLineChart" viewBox="0 0 860 260" role="img" aria-label="Orders graph" preserveAspectRatio="xMidYMid meet"></svg>
                        <div class="orders-line-axis" id="ordersLineAxis"></div>
                    </div>
                </div>
            </div>

            <div class="commerce-panel">
                <div class="commerce-panel-header">
                    <div>
                        <h5>Recent Orders</h5>
                        <p>Latest purchases with amount breakdown, delivery, and payment state.</p>
                    </div>
                    @if($cmsUser->can('customer-orders.view'))
                        <a href="{{ route('cms.customer-orders.index') }}" class="btn btn-sm btn-outline-primary">View All</a>
                    @endif
                </div>
                <div class="table-responsive">
                    <table class="table commerce-table commerce-table-rich mb-0">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Delivery</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentOrders as $order)
                                @php
                                    $itemQty = collect($order->items ?? [])->sum('quantity');
                                    $itemNames = collect($order->items ?? [])->pluck('name')->filter()->take(2)->implode(', ');
                                @endphp
                                <tr>
                                    <td>
                                        @if($cmsUser->can('customer-orders.view'))
                                            <a href="{{ route('cms.customer-orders.show', $order) }}" class="fw-semibold">{{ $order->display_order_number }}</a>
                                        @else
                                            <span class="fw-semibold">{{ $order->display_order_number }}</span>
                                        @endif
                                        <small class="d-block text-muted">{{ $itemQty }} items</small>
                                        @if($itemNames)
                                            <small class="d-block text-muted order-item-preview">{{ $itemNames }}</small>
                                        @endif
                                        @if($order->coupon_code)
                                            <small class="d-block"><span class="badge bg-secondary">Coupon: {{ $order->coupon_code }}</span></small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="fw-semibold">{{ $order->name }}</span>
                                        <small class="d-block text-muted">{{ $order->phone }}</small>
                                        <small class="d-block text-muted">{{ $order->email }}</small>
                                    </td>
                                    <td>
                                        <span class="fw-semibold">{{ $money($order->total) }}</span>
                                        <small class="d-block text-muted">Products {{ number_format((float) $order->subtotal, 2) }}</small>
                                        @if((float) $order->discount_amount > 0)
                                            <small class="d-block text-muted">Discount -{{ number_format((float) $order->discount_amount, 2) }}</small>
                                        @endif
                                        <small class="d-block text-muted">Tax {{ number_format((float) $order->tax_amount, 2) }}</small>
                                    </td>
                                    <td>
                                        <span class="fw-semibold">{{ $money($order->delivery_charge_amount) }}</span>
                                        <small class="d-block text-muted">{{ $order->city ?: 'No city' }}</small>
                                        <small class="d-block text-muted">{{ $label($order->address_type ?? 'delivery') }}</small>
                                    </td>
                                    <td><span class="badge bg-{{ $statusClass($order->status) }}">{{ $label($order->status) }}</span></td>
                                    <td><span class="badge bg-{{ ($order->payment_status ?? 'pending') === 'paid' ? 'success' : 'warning' }} text-dark">{{ $label($order->payment_status ?? 'pending') }}</span></td>
                                    <td>
                                        <span class="fw-semibold">{{ $order->created_at?->format('d M Y') }}</span>
                                        <small class="d-block text-muted">{{ $order->created_at?->format('h:i A') }}</small>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="text-center text-muted py-4">No orders yet.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="commerce-panel">
                <div class="commerce-panel-header">
                    <div>
                        <h5>Recent Enquiries</h5>
                        <p>Latest contact form messages with source and preview.</p>
                    </div>
                    @if($cmsUser->can('enquiries.view') && Route::has('cms.enquiries.index'))
                        <a href="{{ route('cms.enquiries.index') }}" class="btn btn-sm btn-outline-primary">View All</a>
                    @endif
                </div>
                <div class="table-responsive">
                    <table class="table commerce-table commerce-table-rich mb-0">
                        <thead>
                            <tr>
                                <th>Contact</th>
                                <th>Message</th>
                                <th>Source</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentEnquiries as $enquiry)
                                <tr>
                                    <td>
                                        <span class="fw-semibold">{{ $enquiry->name }}</span>
                                        <small class="d-block text-muted">{{ $enquiry->email }}</small>
                                        <small class="d-block text-muted">{{ $enquiry->phone ?: 'No phone' }}</small>
                                        @if($enquiry->company)
                                            <small class="d-block text-muted">{{ $enquiry->company }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="enquiry-message-preview">{{ \Illuminate\Support\Str::limit($enquiry->message ?: 'No message provided.', 120) }}</span>
                                    </td>
                                    <td>
                                        <small class="d-block text-muted">{{ $enquiry->page_source ?: 'Website' }}</small>
                                        @if($enquiry->page_url)
                                            <small class="d-block text-muted enquiry-url">{{ \Illuminate\Support\Str::limit($enquiry->page_url, 42) }}</small>
                                        @endif
                                        @if($enquiry->country)
                                            <small class="d-block text-muted">{{ $enquiry->country }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="fw-semibold">{{ $enquiry->created_at?->format('d M Y') }}</span>
                                        <small class="d-block text-muted">{{ $enquiry->created_at?->diffForHumans() }}</small>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center text-muted py-4">No recent enquiries found.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        </div>

        <div class="col-xl-4 dashboard-sidebar-col">
            <div class="dashboard-sidebar-stack">
                <div class="commerce-panel sidebar-panel">
                    <div class="commerce-panel-header commerce-panel-header-compact">
                        <h5>Order Status</h5>
                    </div>
                    <div class="status-grid">
                        @forelse($statusBreakdown as $status => $count)
                            @php
                                $percent = $stats['total_orders'] > 0 ? round(((int) $count / $stats['total_orders']) * 100) : 0;
                            @endphp
                            <div class="status-chip">
                                <div class="status-chip-top">
                                    <span>{{ $label($status) }}</span>
                                    <strong>{{ $count }}</strong>
                                </div>
                                <div class="progress status-chip-progress">
                                    <div class="progress-bar {{ $statusBarClass($status) }}" style="width: {{ max($percent, $count > 0 ? 8 : 0) }}%"></div>
                                </div>
                            </div>
                        @empty
                            <div class="empty-state">No order status data yet.</div>
                        @endforelse
                    </div>
                </div>

                <div class="commerce-panel sidebar-panel">
                    <div class="commerce-panel-header commerce-panel-header-compact">
                        <h5>Top Selling Items</h5>
                    </div>
                    <div class="top-items top-items-compact">
                        @forelse($topItems as $item)
                            <div class="top-item-row">
                                <div>
                                    <strong>{{ $item['name'] }}</strong>
                                    <small>{{ $money($item['sales']) }}</small>
                                </div>
                                <span>{{ $item['quantity'] }}</span>
                            </div>
                        @empty
                            <div class="empty-state">No item sales yet.</div>
                        @endforelse
                    </div>
                </div>

                <div class="commerce-panel sidebar-panel">
                    <div class="commerce-panel-header commerce-panel-header-compact">
                        <h5>Store Signals</h5>
                    </div>
                    <div class="signal-grid signal-grid-compact">
                        <div><span>Enquiries</span><strong>{{ $stats['enquiries'] }}</strong></div>
                        <div><span>Newsletter</span><strong>{{ $stats['newsletter_signups'] }}</strong></div>
                        <div><span>Coupons</span><strong>{{ $stats['active_coupons'] }} / {{ $stats['coupons'] }}</strong></div>
                        <div><span>Reviews</span><strong>{{ $stats['testimonials'] }}</strong></div>
                    </div>
                </div>

                <div class="commerce-panel sidebar-panel">
                    <div class="commerce-panel-header commerce-panel-header-compact">
                        <h5>Quick Actions</h5>
                    </div>
                    <div class="quick-actions-grid">
                        @if($cmsUser->can('customer-orders.view'))
                            <a href="{{ route('cms.customer-orders.index') }}" class="btn btn-primary btn-sm text-start"><i class="fas fa-receipt me-2"></i> Orders</a>
                        @endif
                        @if(config('cms-kit.common.modules.menus', true) && $cmsUser->can('menus.view'))
                            <a href="{{ route('cms.menus.items.index') }}" class="btn btn-primary btn-sm text-start"><i class="fas fa-utensils me-2"></i> Menu</a>
                        @endif
                        @if(config('cms-kit.common.modules.coupons', true) && $cmsUser->can('coupons.view'))
                            <a href="{{ route('cms.coupons.index') }}" class="btn btn-primary btn-sm text-start"><i class="fas fa-ticket-alt me-2"></i> Coupons</a>
                        @endif
                        @if($cmsUser->can('site-information.view'))
                            <a href="{{ route('cms.site-information.index') }}" class="btn btn-primary btn-sm text-start"><i class="fas fa-cog me-2"></i> Settings</a>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .dashboard-commerce {
        padding-bottom: 2rem;
    }

    .commerce-kpi,
    .commerce-panel {
        background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.08), transparent 55%), var(--surface-color);
        border: 1px solid rgba(var(--primary-rgb), 0.16);
        border-radius: 18px;
        box-shadow: 0 18px 45px rgba(0, 0, 0, 0.16);
    }

    .kpi-row .commerce-kpi {
        min-height: 108px;
    }

    .commerce-kpi {
        align-items: center;
        display: flex;
        gap: .85rem;
        justify-content: space-between;
        min-height: 122px;
        padding: 1rem 1.1rem;
    }

    .commerce-kpi span,
    .commerce-panel-header p,
    .commerce-metrics-grid span,
    .signal-grid span,
    .top-item-row small {
        color: var(--muted-text-color);
    }

    .commerce-kpi span {
        display: block;
        font-size: .76rem;
        font-weight: 800;
        letter-spacing: .04em;
        text-transform: uppercase;
    }

    .commerce-kpi strong {
        color: var(--text-color);
        display: block;
        font-size: 1.28rem;
        line-height: 1.2;
        margin-top: .35rem;
    }

    .commerce-kpi small {
        color: var(--muted-text-color);
        display: block;
        font-size: .68rem;
        line-height: 1.35;
        margin-top: .3rem;
    }

    .commerce-kpi i {
        color: rgba(var(--primary-rgb), .75);
        font-size: 1.55rem;
    }

    .kpi-primary {
        border-left: 4px solid var(--primary-color);
    }

    .kpi-warning {
        border-left: 4px solid var(--theme-warning-color);
    }

    .kpi-danger {
        border-left: 4px solid var(--theme-danger-color);
    }

    .kpi-success {
        border-left: 4px solid var(--theme-success-color, #28a745);
    }

    .kpi-info {
        border-left: 4px solid var(--theme-info-color, #17a2b8);
    }

    .commerce-metrics-grid-wide {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }

    .commerce-panel {
        overflow: hidden;
    }

    .commerce-panel-header {
        align-items: center;
        border-bottom: 1px solid rgba(var(--primary-rgb), 0.22);
        display: flex;
        gap: 1rem;
        justify-content: space-between;
        padding: 1.25rem 1.35rem;
    }

    .commerce-panel-header h5 {
        color: var(--text-color);
        font-size: 1.05rem;
        font-weight: 800;
        margin: 0;
    }

    .commerce-panel-header p {
        font-size: .83rem;
        margin: .25rem 0 0;
    }

    .commerce-metrics-grid,
    .signal-grid {
        display: grid;
        gap: 1px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        background: rgba(var(--primary-rgb), 0.12);
    }

    .signal-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .commerce-metrics-grid > div,
    .signal-grid > div {
        background: var(--surface-color);
        padding: 1.1rem 1.35rem;
    }

    .commerce-metrics-grid span,
    .signal-grid span {
        display: block;
        font-size: .78rem;
        font-weight: 700;
    }

    .commerce-metrics-grid strong,
    .signal-grid strong {
        color: var(--text-color);
        display: block;
        font-size: 1.18rem;
        margin-top: .35rem;
    }

    .dashboard-layout-row {
        align-items: flex-start;
    }

    .dashboard-main-stack {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .dashboard-sidebar-col {
        position: sticky;
        top: 1rem;
    }

    .dashboard-sidebar-stack {
        display: flex;
        flex-direction: column;
        gap: .65rem;
    }

    .sidebar-panel {
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
    }

    .commerce-panel-header-compact {
        padding: .85rem 1rem;
    }

    .commerce-panel-header-compact h5 {
        font-size: .95rem;
        margin: 0;
    }

    .status-grid {
        display: grid;
        gap: .55rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding: .75rem 1rem 1rem;
    }

    .status-grid .empty-state {
        grid-column: 1 / -1;
        padding: .75rem;
    }

    .status-chip {
        background: rgba(255, 255, 255, .025);
        border: 1px solid rgba(var(--primary-rgb), .14);
        border-radius: 10px;
        min-width: 0;
        padding: .55rem .65rem;
    }

    .status-chip-top {
        align-items: center;
        display: flex;
        gap: .35rem;
        justify-content: space-between;
        margin-bottom: .35rem;
    }

    .status-chip-top span {
        color: var(--muted-text-color);
        font-size: .68rem;
        font-weight: 700;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .status-chip-top strong {
        color: var(--text-color);
        flex-shrink: 0;
        font-size: .82rem;
    }

    .status-chip-progress {
        background: rgba(255, 255, 255, .1);
        height: .4rem;
    }

    .status-chip .progress-bar {
        border-radius: 999px;
    }

    .status-bar-delivered {
        background: #22c55e !important;
    }

    .status-bar-confirmed {
        background: #38bdf8 !important;
    }

    .status-bar-pending {
        background: var(--primary-color, #f97316) !important;
        box-shadow: 0 0 8px rgba(var(--primary-rgb), .45);
    }

    .status-bar-progress {
        background: #fbbf24 !important;
    }

    .status-bar-cancelled {
        background: #ef4444 !important;
    }

    .status-bar-muted {
        background: #94a3b8 !important;
    }

    .quick-actions-grid {
        display: grid;
        gap: .45rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding: .65rem .85rem .85rem;
    }

    .quick-actions-grid .btn {
        font-size: .74rem;
        padding: .45rem .55rem;
        white-space: nowrap;
    }

    .top-items-compact {
        padding: .55rem .85rem .75rem;
    }

    .top-items-compact .top-item-row {
        border-bottom: 0;
        padding-bottom: 0;
    }

    .top-items-compact .top-item-row + .top-item-row {
        margin-top: .55rem;
        padding-top: .55rem;
        border-top: 1px solid rgba(var(--primary-rgb), 0.14);
    }

    .top-items-compact .top-item-row strong {
        display: block;
        font-size: .82rem;
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .top-items-compact .top-item-row small {
        font-size: .68rem;
        margin-top: .1rem;
    }

    .top-items-compact .top-item-row span {
        font-size: .78rem;
        height: 1.75rem;
        min-width: 1.75rem;
    }

    .top-items-compact .empty-state {
        padding: .5rem;
    }

    .signal-grid-compact {
        gap: 1px;
    }

    .signal-grid-compact > div {
        padding: .65rem .75rem;
    }

    .signal-grid-compact span {
        font-size: .66rem;
    }

    .signal-grid-compact strong {
        font-size: .95rem;
        margin-top: .2rem;
    }

    .orders-panel {
        background:
            linear-gradient(90deg, rgba(var(--primary-rgb), 0.08), transparent 34%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.018), transparent 48%),
            var(--surface-color);
    }

    .chart-header-actions {
        align-items: flex-end;
        display: flex;
        flex-direction: column;
        gap: .75rem;
    }

    .chart-period-tabs {
        background: rgba(0, 0, 0, .18);
        border: 1px solid rgba(var(--primary-rgb), .22);
        border-radius: 999px;
        display: inline-flex;
        gap: .2rem;
        padding: .2rem;
    }

    .chart-period-tab {
        background: transparent;
        border: 0;
        border-radius: 999px;
        color: var(--muted-text-color);
        cursor: pointer;
        font-size: .72rem;
        font-weight: 800;
        letter-spacing: .03em;
        padding: .42rem .72rem;
        text-transform: uppercase;
        transition: background .18s ease, color .18s ease;
    }

    .chart-period-tab:hover,
    .chart-period-tab:focus-visible {
        color: var(--text-color);
        outline: none;
    }

    .chart-period-tab.is-active {
        background: rgba(var(--primary-rgb), .22);
        box-shadow: inset 0 0 0 1px rgba(var(--primary-rgb), .34);
        color: var(--primary-color);
    }

    .chart-detail-strip {
        border-bottom: 1px solid rgba(var(--primary-rgb), 0.16);
        display: grid;
        gap: 1px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        background: rgba(var(--primary-rgb), 0.1);
    }

    .chart-detail-strip > div {
        background: var(--surface-color);
        padding: .95rem 1.2rem;
    }

    .chart-detail-strip span {
        color: var(--muted-text-color);
        display: block;
        font-size: .72rem;
        font-weight: 700;
        letter-spacing: .03em;
        text-transform: uppercase;
    }

    .chart-detail-strip strong {
        color: var(--text-color);
        display: block;
        font-size: 1rem;
        margin-top: .3rem;
    }

    .chart-detail-strip strong small {
        color: var(--muted-text-color);
        font-size: .72rem;
        font-weight: 700;
    }

    .chart-summary {
        align-items: flex-end;
        display: flex;
        flex-direction: column;
        gap: .3rem;
        text-align: right;
    }

    .chart-summary span {
        background: rgba(var(--primary-rgb), 0.14);
        border: 1px solid rgba(var(--primary-rgb), 0.3);
        border-radius: 999px;
        color: var(--primary-color);
        font-size: .78rem;
        font-weight: 800;
        padding: .45rem .75rem;
        text-transform: uppercase;
    }

    .chart-summary small {
        color: var(--muted-text-color);
        font-size: .72rem;
        font-weight: 700;
    }

    .orders-chart {
        padding: 1.35rem;
    }

    .orders-chart-stage {
        background:
            radial-gradient(circle at 50% 0%, rgba(var(--primary-rgb), .08), transparent 46%),
            linear-gradient(180deg, rgba(255, 255, 255, .025), transparent 62%),
            rgba(0, 0, 0, .1);
        border: 1px solid rgba(255, 255, 255, .055);
        border-radius: 14px;
        padding: 1.05rem 1.05rem .95rem;
        position: relative;
    }

    .orders-line-chart {
        display: block;
        height: 260px;
        overflow: visible;
        width: 100%;
    }

    .orders-grid-line {
        stroke: rgba(255, 255, 255, .065);
        stroke-width: 1;
    }

    .orders-grid-label {
        fill: var(--muted-text-color);
        font-size: 10px;
        font-weight: 700;
        opacity: .65;
    }

    .orders-area {
        fill: url(#ordersChartArea);
    }

    .orders-line-backdrop {
        fill: none;
        stroke: rgba(255, 255, 255, .13);
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 6;
    }

    .orders-line {
        fill: none;
        stroke: var(--primary-color);
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 3.25;
    }

    .orders-point circle {
        fill: #101719;
        stroke: var(--primary-color);
        stroke-width: 3.2;
    }

    .orders-point.is-zero circle {
        fill: rgba(255, 255, 255, .08);
        stroke: rgba(var(--primary-rgb), .65);
        stroke-width: 2.4;
    }

    .orders-point text {
        fill: var(--text-color);
        font-size: 13px;
        font-weight: 900;
        paint-order: stroke;
        stroke: rgba(0, 0, 0, .72);
        stroke-width: 3px;
    }

    .orders-line-axis {
        border-top: 1px solid rgba(255, 255, 255, .06);
        display: grid;
        gap: .55rem;
        padding-top: .75rem;
    }

    .orders-line-axis.is-dense strong {
        font-size: .66rem;
    }

    .orders-line-axis.is-dense span {
        font-size: .62rem;
    }

    .orders-line-axis div {
        border-radius: 9px;
        min-width: 0;
        padding: .48rem .35rem;
        text-align: center;
    }

    .orders-line-axis div.has-orders {
        background: rgba(var(--primary-rgb), .08);
        box-shadow: inset 0 0 0 1px rgba(var(--primary-rgb), .24);
    }

    .orders-line-axis strong {
        color: var(--text-color);
        display: block;
        font-size: .76rem;
        font-weight: 800;
        white-space: nowrap;
    }

    .orders-line-axis span {
        color: var(--muted-text-color);
        display: block;
        font-size: .7rem;
        margin-top: .25rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .top-item-row + .top-item-row {
        margin-top: 1rem;
    }

    .top-item-row strong,
    .top-item-row span {
        color: var(--text-color);
    }

    .progress {
        background: rgba(255, 255, 255, .08);
        height: .48rem;
    }

    .commerce-table {
        color: var(--text-color);
    }

    .commerce-table th,
    .commerce-table td {
        border-color: rgba(var(--primary-rgb), 0.18);
        padding: 1rem 1.35rem;
        vertical-align: middle;
    }

    .commerce-table-rich th,
    .commerce-table-rich td {
        font-size: .84rem;
        padding: .85rem 1rem;
    }

    .commerce-table-rich .order-item-preview,
    .commerce-table-rich .enquiry-url {
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .enquiry-message-preview {
        color: var(--text-color);
        display: -webkit-box;
        font-size: .82rem;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-height: 1.45;
        overflow: hidden;
    }

    .commerce-table thead th {
        background: rgba(255, 255, 255, .025);
        color: var(--text-color);
        font-size: .82rem;
        text-transform: uppercase;
    }

    .commerce-table a {
        color: var(--primary-color);
        text-decoration: none;
    }

    .top-item-row {
        align-items: center;
        border-bottom: 1px solid rgba(var(--primary-rgb), 0.16);
        display: flex;
        justify-content: space-between;
        padding-bottom: .85rem;
    }

    .top-item-row small {
        display: block;
        margin-top: .25rem;
    }

    .top-item-row span {
        align-items: center;
        background: rgba(var(--primary-rgb), 0.16);
        border-radius: 999px;
        display: inline-flex;
        font-weight: 800;
        height: 2.2rem;
        justify-content: center;
        min-width: 2.2rem;
    }

    .empty-state {
        color: var(--muted-text-color);
        padding: 1.25rem;
        text-align: center;
    }

    @media (max-width: 1199.98px) {
        .dashboard-sidebar-col {
            position: static;
        }

        .dashboard-sidebar-stack {
            display: grid;
            gap: .65rem;
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 1399.98px) {
        .commerce-metrics-grid-wide {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }
    }

    @media (max-width: 991.98px) {
        .commerce-metrics-grid,
        .commerce-metrics-grid-wide {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .dashboard-sidebar-stack {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 575.98px) {
        .commerce-metrics-grid,
        .signal-grid {
            grid-template-columns: 1fr;
        }

        .orders-chart {
            overflow-x: auto;
        }

        .orders-chart-stage {
            min-width: 680px;
        }

        .commerce-panel-header {
            align-items: flex-start;
            flex-direction: column;
        }

        .chart-header-actions,
        .chart-summary {
            align-items: flex-start;
            text-align: left;
        }

        .chart-detail-strip {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .status-grid {
            grid-template-columns: 1fr;
        }

        .quick-actions-grid {
            grid-template-columns: 1fr;
        }
    }
</style>

<script>
(() => {
    const panel = document.getElementById('ordersChartPanel');
    if (!panel) {
        return;
    }

    const chartUrl = panel.dataset.chartUrl;
    const subtitleEl = document.getElementById('ordersChartSubtitle');
    const salesSnapshotSubtitleEl = document.getElementById('salesSnapshotSubtitle');
    const totalEl = document.getElementById('ordersChartTotal');
    const peakEl = document.getElementById('ordersChartPeak');
    const totalSalesEl = document.getElementById('ordersChartTotalSales');
    const avgOrderEl = document.getElementById('ordersChartAvgOrder');
    const avgBucketEl = document.getElementById('ordersChartAvgBucket');
    const peakSalesEl = document.getElementById('ordersChartPeakSales');
    const svgEl = document.getElementById('ordersLineChart');
    const axisEl = document.getElementById('ordersLineAxis');
    const stageEl = document.getElementById('ordersChartStage');
    const tabs = panel.querySelectorAll('.chart-period-tab');
    const periodStatsEls = document.querySelectorAll('[data-period-stat]');

    const chartWidth = 860;
    const chartHeight = 260;
    const chartPaddingX = 58;
    const chartPaddingTop = 30;
    const chartPaddingBottom = 46;
    const chartPlotWidth = chartWidth - (chartPaddingX * 2);
    const chartPlotHeight = chartHeight - chartPaddingTop - chartPaddingBottom;

    let activePeriod = 'day';
    let loading = false;

    const money = (value) => `${Number(value || 0).toFixed(2)} GEL`;

    const setActiveTab = (period) => {
        tabs.forEach((tab) => {
            const isActive = tab.dataset.period === period;
            tab.classList.toggle('is-active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    };

    const formatPeriodStat = (value, format) => {
        if (format === 'integer') {
            return String(parseInt(value || 0, 10));
        }

        if (format === 'money') {
            return money(value);
        }

        return String(value ?? '-');
    };

    const updatePeriodStats = (stats = {}) => {
        periodStatsEls.forEach((el) => {
            const key = el.dataset.periodStat;
            if (stats[key] !== undefined) {
                el.textContent = formatPeriodStat(stats[key], el.dataset.periodFormat || 'money');
            }
        });
    };

    const updateSummary = (payload) => {
        const summary = payload.summary || {};
        subtitleEl.textContent = payload.subtitle || '';
        if (salesSnapshotSubtitleEl) {
            salesSnapshotSubtitleEl.textContent = payload.subtitle || '';
        }
        totalEl.textContent = `${summary.total_orders || 0} orders`;
        peakEl.textContent = `Peak: ${summary.peak_orders || 0} on ${summary.peak_label || '-'}`;
        totalSalesEl.textContent = money(summary.total_sales);
        avgOrderEl.textContent = money(summary.avg_order_value);
        avgBucketEl.textContent = `${Number(summary.avg_orders || 0).toFixed(2)} orders`;
        peakSalesEl.innerHTML = `${money(summary.peak_sales)} <small>(${summary.peak_sales_label || '-'})</small>`;
        updatePeriodStats(payload.stats || {});
        svgEl.setAttribute('aria-label', `Orders graph - ${payload.subtitle || ''}`);
    };

    const buildChartGeometry = (chart) => {
        const maxOrders = Math.max(...chart.map((point) => Number(point.orders || 0)), 1);
        const steps = Math.max(chart.length - 1, 1);

        return chart.map((point, index) => {
            const orders = Number(point.orders || 0);
            return {
                ...point,
                orders,
                x: Math.round(chartPaddingX + ((chartPlotWidth / steps) * index) * 100) / 100,
                y: Math.round(chartPaddingTop + (chartPlotHeight - ((orders / maxOrders) * chartPlotHeight)) * 100) / 100,
            };
        });
    };

    const renderChart = (payload) => {
        const chart = Array.isArray(payload.chart) ? payload.chart : [];
        const points = buildChartGeometry(chart);
        const maxOrders = Math.max(...chart.map((point) => Number(point.orders || 0)), 1);
        const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
        const areaPath = points.length
            ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - chartPaddingBottom} L ${points[0].x} ${chartHeight - chartPaddingBottom} Z`
            : '';

        const gridLines = Array.from({ length: 5 }, (_, index) => {
            const gridY = chartPaddingTop + ((chartPlotHeight / 4) * index);
            const gridValue = Math.round(maxOrders - ((maxOrders / 4) * index));
            return `<line x1="${chartPaddingX}" y1="${gridY}" x2="${chartWidth - chartPaddingX}" y2="${gridY}" class="orders-grid-line" />
                <text x="${chartPaddingX - 16}" y="${gridY + 4}" text-anchor="end" class="orders-grid-label">${gridValue}</text>`;
        }).join('');

        const pointMarkup = points.map((point) => {
            const hasOrders = point.orders > 0;
            const labelY = Math.max(16, point.y - 14);
            return `<g class="orders-point ${hasOrders ? 'has-orders' : 'is-zero'}">
                <circle cx="${point.x}" cy="${point.y}" r="${hasOrders ? 6 : 4}" />
                ${hasOrders ? `<text x="${point.x}" y="${labelY}" text-anchor="middle">${point.orders}</text>` : ''}
            </g>`;
        }).join('');

        svgEl.innerHTML = `<defs>
            <linearGradient id="ordersChartArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="var(--primary-color)" stop-opacity=".18" />
                <stop offset="68%" stop-color="var(--primary-color)" stop-opacity=".045" />
                <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0" />
            </linearGradient>
        </defs>
        ${gridLines}
        ${areaPath ? `<path d="${areaPath}" class="orders-area" />` : ''}
        ${linePath ? `<path d="${linePath}" class="orders-line-backdrop" /><path d="${linePath}" class="orders-line" />` : ''}
        ${pointMarkup}`;

        axisEl.style.gridTemplateColumns = `repeat(${Math.max(chart.length, 1)}, minmax(0, 1fr))`;
        axisEl.classList.toggle('is-dense', chart.length > 8);
        axisEl.innerHTML = points.map((point) => {
            const hasOrders = point.orders > 0;
            return `<div class="${hasOrders ? 'has-orders' : ''}">
                <strong>${point.label || ''}</strong>
                <span>${money(point.sales)}</span>
            </div>`;
        }).join('');

        const minWidth = Math.max(680, chart.length * (chart.length > 12 ? 58 : chart.length > 8 ? 48 : 0));
        stageEl.style.minWidth = minWidth > 680 ? `${minWidth}px` : '';
        updateSummary(payload);
    };

    const loadPeriod = async (period) => {
        if (loading || period === activePeriod) {
            return;
        }

        loading = true;
        panel.classList.add('is-loading');
        setActiveTab(period);

        try {
            const response = await fetch(`${chartUrl}?period=${encodeURIComponent(period)}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to load chart data');
            }

            const payload = await response.json();
            activePeriod = period;
            renderChart(payload);
        } catch (error) {
            setActiveTab(activePeriod);
            console.error(error);
        } finally {
            loading = false;
            panel.classList.remove('is-loading');
        }
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => loadPeriod(tab.dataset.period));
    });

    try {
        const initialPayload = JSON.parse(panel.dataset.initialPayload || '{}');
        activePeriod = initialPayload.period || 'day';
        renderChart(initialPayload);
    } catch (error) {
        console.error(error);
    }
})();
</script>
@endsection
