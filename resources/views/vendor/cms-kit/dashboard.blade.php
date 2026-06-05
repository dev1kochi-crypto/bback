@extends('cms-kit::layouts.cms')

@section('title', 'Dashboard')

@section('breadcrumbs')
    <li class="breadcrumb-item active" aria-current="page">Overview</li>
@endsection

@section('content')
@php
    $money = fn ($value) => number_format((float) $value, 2) . ' GEL';
    $label = fn ($status) => ucwords(str_replace('_', ' ', (string) $status));
    $maxChartOrders = max($orderChart->max('orders') ?? 0, 1);
    $chartWidth = 720;
    $chartHeight = 230;
    $chartPaddingX = 34;
    $chartPaddingY = 28;
    $chartPlotWidth = $chartWidth - ($chartPaddingX * 2);
    $chartPlotHeight = $chartHeight - ($chartPaddingY * 2);
    $chartPoints = $orderChart->values()->map(function ($point, $index) use ($orderChart, $maxChartOrders, $chartPaddingX, $chartPaddingY, $chartPlotWidth, $chartPlotHeight) {
        $steps = max($orderChart->count() - 1, 1);

        return [
            ...$point,
            'x' => round($chartPaddingX + (($chartPlotWidth / $steps) * $index), 2),
            'y' => round($chartPaddingY + ($chartPlotHeight - (($point['orders'] / $maxChartOrders) * $chartPlotHeight)), 2),
        ];
    });
    $linePath = $chartPoints->map(fn ($point, $index) => ($index === 0 ? 'M' : 'L') . $point['x'] . ' ' . $point['y'])->implode(' ');
    $areaPath = $chartPoints->isNotEmpty()
        ? $linePath . ' L ' . $chartPoints->last()['x'] . ' ' . ($chartHeight - $chartPaddingY) . ' L ' . $chartPoints->first()['x'] . ' ' . ($chartHeight - $chartPaddingY) . ' Z'
        : '';
    $statusClass = function ($status) {
        return match ($status) {
            'delivered' => 'success',
            'cancelled' => 'danger',
            'preparing', 'out_for_delivery' => 'warning',
            'confirmed' => 'info',
            default => 'secondary',
        };
    };
@endphp

<div class="dashboard-commerce">
    <div class="row g-4 mb-4">
        <div class="col-xl-3 col-md-6">
            <div class="commerce-kpi kpi-primary">
                <div>
                    <span>Gross Sales</span>
                    <strong>{{ $money($stats['gross_sales']) }}</strong>
                    <small>Today: {{ $money($stats['today_sales']) }}</small>
                </div>
                <i class="fas fa-chart-line"></i>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="commerce-kpi">
                <div>
                    <span>Orders</span>
                    <strong>{{ $stats['total_orders'] }}</strong>
                    <small>{{ $stats['today_orders'] }} placed today</small>
                </div>
                <i class="fas fa-receipt"></i>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="commerce-kpi kpi-warning">
                <div>
                    <span>Active Orders</span>
                    <strong>{{ $stats['active_orders'] }}</strong>
                    <small>{{ $stats['payment_pending'] }} payment pending</small>
                </div>
                <i class="fas fa-hourglass-half"></i>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="commerce-kpi kpi-danger">
                <div>
                    <span>Cancelled Value</span>
                    <strong>{{ $money($stats['cancelled_value']) }}</strong>
                    <small>{{ $stats['cancelled_orders'] }} cancelled orders</small>
                </div>
                <i class="fas fa-level-down-alt"></i>
            </div>
        </div>
    </div>

    <div class="row g-4 mb-4">
        <div class="col-xl-8">
            <div class="commerce-panel mb-4">
                <div class="commerce-panel-header">
                    <div>
                        <h5>Sales Snapshot</h5>
                        <p>Revenue, charges, discount, and fulfilment health.</p>
                    </div>
                    @if($cmsUser->can('customer-orders.view'))
                        <a href="{{ route('cms.customer-orders.index') }}" class="btn btn-sm btn-outline-primary">View Orders</a>
                    @endif
                </div>
                <div class="commerce-metrics-grid">
                    <div>
                        <span>Completed Sales</span>
                        <strong>{{ $money($stats['completed_sales']) }}</strong>
                    </div>
                    <div>
                        <span>Pending Sales</span>
                        <strong>{{ $money($stats['pending_sales']) }}</strong>
                    </div>
                    <div>
                        <span>Discount Given</span>
                        <strong>{{ $money($stats['discounts']) }}</strong>
                    </div>
                    <div>
                        <span>Delivery Collected</span>
                        <strong>{{ $money($stats['delivery_collected']) }}</strong>
                    </div>
                    <div>
                        <span>Tax Collected</span>
                        <strong>{{ $money($stats['tax_collected']) }}</strong>
                    </div>
                    <div>
                        <span>Menu Active</span>
                        <strong>{{ $stats['active_menu_items'] }} / {{ $stats['menu_items'] }}</strong>
                    </div>
                </div>
            </div>

            <div class="commerce-panel">
                <div class="commerce-panel-header">
                    <div>
                        <h5>Orders Graph</h5>
                        <p>Daily order movement for the last 7 days.</p>
                    </div>
                    <span class="chart-total">{{ $orderChart->sum('orders') }} orders</span>
                </div>
                <div class="orders-chart">
                    <svg class="orders-line-chart" viewBox="0 0 {{ $chartWidth }} {{ $chartHeight }}" role="img" aria-label="Orders graph for the last 7 days" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="ordersLineFill" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stop-color="var(--primary-color)" stop-opacity=".28" />
                                <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0" />
                            </linearGradient>
                            <filter id="ordersLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        @for($i = 0; $i <= 3; $i++)
                            @php
                                $gridY = $chartPaddingY + (($chartPlotHeight / 3) * $i);
                            @endphp
                            <line x1="{{ $chartPaddingX }}" y1="{{ $gridY }}" x2="{{ $chartWidth - $chartPaddingX }}" y2="{{ $gridY }}" class="orders-grid-line" />
                        @endfor

                        @if($areaPath)
                            <path d="{{ $areaPath }}" class="orders-area" />
                        @endif
                        @if($linePath)
                            <path d="{{ $linePath }}" class="orders-line" filter="url(#ordersLineGlow)" />
                        @endif

                        @foreach($chartPoints as $point)
                            <g class="orders-point">
                                <circle cx="{{ $point['x'] }}" cy="{{ $point['y'] }}" r="5.5" />
                                <text x="{{ $point['x'] }}" y="{{ max(14, $point['y'] - 13) }}" text-anchor="middle">{{ $point['orders'] }}</text>
                            </g>
                        @endforeach
                    </svg>
                    <div class="orders-chart-axis">
                        @foreach($orderChart as $point)
                            <div>
                                <strong>{{ $point['label'] }}</strong>
                                <span>{{ $money($point['sales']) }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-4">
            <div class="commerce-panel h-100">
                <div class="commerce-panel-header">
                    <div>
                        <h5>Order Status</h5>
                        <p>Live fulfilment split.</p>
                    </div>
                </div>
                <div class="status-stack">
                    @forelse($statusBreakdown as $status => $count)
                        @php
                            $percent = $stats['total_orders'] > 0 ? round(((int) $count / $stats['total_orders']) * 100) : 0;
                        @endphp
                        <div class="status-row">
                            <div class="d-flex justify-content-between mb-1">
                                <span>{{ $label($status) }}</span>
                                <strong>{{ $count }}</strong>
                            </div>
                            <div class="progress">
                                <div class="progress-bar bg-{{ $statusClass($status) }}" style="width: {{ $percent }}%"></div>
                            </div>
                        </div>
                    @empty
                        <div class="empty-state">No order status data yet.</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-xl-8">
            <div class="commerce-panel mb-4">
                <div class="commerce-panel-header">
                    <div>
                        <h5>Recent Orders</h5>
                        <p>Latest purchases and payment state.</p>
                    </div>
                    @if($cmsUser->can('customer-orders.view'))
                        <a href="{{ route('cms.customer-orders.index') }}" class="btn btn-sm btn-outline-primary">View All</a>
                    @endif
                </div>
                <div class="table-responsive">
                    <table class="table commerce-table mb-0">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentOrders as $order)
                                <tr>
                                    <td>
                                        @if($cmsUser->can('customer-orders.view'))
                                            <a href="{{ route('cms.customer-orders.show', $order) }}" class="fw-semibold">{{ $order->display_order_number }}</a>
                                        @else
                                            <span class="fw-semibold">{{ $order->display_order_number }}</span>
                                        @endif
                                        <small class="d-block text-muted">{{ collect($order->items ?? [])->sum('quantity') }} items</small>
                                    </td>
                                    <td>
                                        <span class="fw-semibold">{{ $order->name }}</span>
                                        <small class="d-block text-muted">{{ $order->phone }}</small>
                                    </td>
                                    <td>{{ $money($order->total) }}</td>
                                    <td><span class="badge bg-{{ $statusClass($order->status) }}">{{ $label($order->status) }}</span></td>
                                    <td><span class="badge bg-{{ ($order->payment_status ?? 'pending') === 'paid' ? 'success' : 'warning' }} text-dark">{{ $label($order->payment_status ?? 'pending') }}</span></td>
                                    <td>{{ $order->created_at?->format('d M Y h:i A') }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center text-muted py-4">No orders yet.</td>
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
                        <p>Latest contact form messages.</p>
                    </div>
                    @if($cmsUser->can('enquiries.view') && Route::has('cms.enquiries.index'))
                        <a href="{{ route('cms.enquiries.index') }}" class="btn btn-sm btn-outline-primary">View All</a>
                    @endif
                </div>
                <div class="table-responsive">
                    <table class="table commerce-table mb-0">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentEnquiries as $enquiry)
                                <tr>
                                    <td>{{ $enquiry->name }}</td>
                                    <td>{{ $enquiry->email }}</td>
                                    <td>{{ $enquiry->phone ?: '-' }}</td>
                                    <td>{{ $enquiry->created_at?->diffForHumans() }}</td>
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
        <div class="col-xl-4">
            <div class="commerce-panel mb-4">
                <div class="commerce-panel-header">
                    <div>
                        <h5>Top Selling Items</h5>
                        <p>Best movers by quantity.</p>
                    </div>
                </div>
                <div class="top-items">
                    @forelse($topItems as $item)
                        <div class="top-item-row">
                            <div>
                                <strong>{{ $item['name'] }}</strong>
                                <small>{{ $money($item['sales']) }} sales</small>
                            </div>
                            <span>{{ $item['quantity'] }}</span>
                        </div>
                    @empty
                        <div class="empty-state">No item sales yet.</div>
                    @endforelse
                </div>
            </div>
            <div class="commerce-panel">
                <div class="commerce-panel-header">
                    <div>
                        <h5>Store Signals</h5>
                        <p>Content and customer interest.</p>
                    </div>
                </div>
                <div class="signal-grid">
                    <div><span>Enquiries</span><strong>{{ $stats['enquiries'] }}</strong></div>
                    <div><span>Newsletter</span><strong>{{ $stats['newsletter_signups'] }}</strong></div>
                    <div><span>Coupons</span><strong>{{ $stats['active_coupons'] }} / {{ $stats['coupons'] }}</strong></div>
                    <div><span>Reviews</span><strong>{{ $stats['testimonials'] }}</strong></div>
                </div>
            </div>

            <div class="commerce-panel mt-4">
                <div class="commerce-panel-header">
                    <div>
                        <h5>Quick Actions</h5>
                        <p>Common ecommerce tasks.</p>
                    </div>
                </div>
                <div class="d-grid gap-2">
                    @if($cmsUser->can('customer-orders.view'))
                        <a href="{{ route('cms.customer-orders.index') }}" class="btn btn-primary text-start"><i class="fas fa-receipt me-2"></i> Manage Orders</a>
                    @endif
                    @if(config('cms-kit.common.modules.menus', true) && $cmsUser->can('menus.view'))
                        <a href="{{ route('cms.menus.items.index') }}" class="btn btn-primary text-start"><i class="fas fa-utensils me-2"></i> Manage Menu Items</a>
                    @endif
                    @if(config('cms-kit.common.modules.coupons', true) && $cmsUser->can('coupons.view'))
                        <a href="{{ route('cms.coupons.index') }}" class="btn btn-primary text-start"><i class="fas fa-ticket-alt me-2"></i> Manage Coupons</a>
                    @endif
                    @if($cmsUser->can('site-information.view'))
                        <a href="{{ route('cms.site-information.index') }}" class="btn btn-primary text-start"><i class="fas fa-cog me-2"></i> Site Settings</a>
                    @endif
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

    .commerce-kpi {
        align-items: center;
        display: flex;
        gap: 1rem;
        justify-content: space-between;
        min-height: 122px;
        padding: 1.35rem 1.45rem;
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
        font-size: 1.72rem;
        line-height: 1.2;
        margin-top: .45rem;
    }

    .commerce-kpi small {
        color: var(--muted-text-color);
        display: block;
        margin-top: .35rem;
    }

    .commerce-kpi i {
        color: rgba(var(--primary-rgb), .75);
        font-size: 2rem;
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

    .status-stack,
    .top-items,
    .orders-chart {
        padding: 1.25rem 1.35rem;
    }

    .chart-total {
        background: rgba(var(--primary-rgb), 0.14);
        border: 1px solid rgba(var(--primary-rgb), 0.3);
        border-radius: 999px;
        color: var(--primary-color);
        font-size: .78rem;
        font-weight: 800;
        padding: .45rem .75rem;
        text-transform: uppercase;
    }

    .orders-chart {
        min-height: 290px;
    }

    .orders-line-chart {
        display: block;
        height: 230px;
        overflow: visible;
        width: 100%;
    }

    .orders-grid-line {
        stroke: rgba(255, 255, 255, .08);
        stroke-width: 1;
    }

    .orders-area {
        fill: url(#ordersLineFill);
    }

    .orders-line {
        fill: none;
        stroke: var(--primary-color);
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 5;
    }

    .orders-point circle {
        fill: var(--surface-color);
        stroke: var(--primary-color);
        stroke-width: 4;
    }

    .orders-point text {
        fill: var(--text-color);
        font-size: 13px;
        font-weight: 800;
    }

    .orders-chart-axis {
        display: grid;
        gap: .75rem;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        margin-top: .45rem;
    }

    .orders-chart-axis div {
        min-width: 0;
        text-align: center;
    }

    .orders-chart-axis strong {
        color: var(--text-color);
        display: block;
        font-size: .78rem;
        font-weight: 800;
        white-space: nowrap;
    }

    .orders-chart-axis span {
        color: var(--muted-text-color);
        display: block;
        font-size: .72rem;
        margin-top: .25rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .status-row + .status-row,
    .top-item-row + .top-item-row {
        margin-top: 1rem;
    }

    .status-row span,
    .status-row strong,
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

    @media (max-width: 991.98px) {
        .commerce-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
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

        .orders-line-chart,
        .orders-chart-axis {
            min-width: 620px;
        }

        .commerce-panel-header {
            align-items: flex-start;
            flex-direction: column;
        }
    }
</style>
@endsection
