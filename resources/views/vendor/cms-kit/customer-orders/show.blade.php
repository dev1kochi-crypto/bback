@extends('cms-kit::layouts.cms')

@section('title', 'Order Details')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.customer-orders.index') }}">Orders</a></li>
    <li class="breadcrumb-item active">{{ $order->display_order_number }}</li>
@endsection

@section('content')
<div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
    <div>
        <h1 class="h3 mb-1">{{ $order->display_order_number }}</h1>
        <div class="text-white-50">{{ $order->created_at?->format('d M Y h:i A') }}</div>
    </div>
    <div class="d-flex align-items-center gap-2">
        <a href="{{ route('cms.customer-orders.invoice', $order) }}" class="btn btn-primary">
            <i class="fas fa-download me-1"></i> Invoice
        </a>
        <form method="POST" action="{{ route('cms.customer-orders.update-status', $order) }}">
            @csrf
            @method('PUT')
            <select name="status" class="form-select order-status-select">
                @foreach($statuses as $value => $label)
                    <option value="{{ $value }}" @selected($order->status === $value)>{{ $label }}</option>
                @endforeach
            </select>
        </form>
        <form method="POST" action="{{ route('cms.customer-orders.update-payment-status', $order) }}">
            @csrf
            @method('PUT')
            <select name="payment_status" class="form-select order-status-select">
                @foreach($paymentStatuses as $value => $label)
                    <option value="{{ $value }}" @selected(($order->payment_status ?? 'pending') === $value)>Payment {{ $label }}</option>
                @endforeach
            </select>
        </form>
        <a href="{{ route('cms.customer-orders.index') }}" class="btn btn-light border">Back</a>
    </div>
</div>

<div class="row g-4">
    <div class="col-lg-8 d-flex flex-column">
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white">
                <h5 class="mb-0">Order Items</h5>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table align-middle mb-0 order-admin-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th class="text-center">Qty</th>
                                <th class="text-end">Unit Price</th>
                                <th class="text-end">Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($order->items ?? [] as $item)
                                <tr>
                                    <td>
                                        <div class="fw-semibold">{{ $item['name'] ?? 'Menu item' }}</div>
                                        <small class="text-muted">{{ $item['category_name'] ?? '' }}</small>
                                    </td>
                                    <td class="text-center">{{ $item['quantity'] ?? 1 }}</td>
                                    <td class="text-end">{{ number_format((float) ($item['unit_price'] ?? 0), 2) }}</td>
                                    <td class="text-end fw-semibold">{{ number_format((float) ($item['line_total'] ?? 0), 2) }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm flex-grow-1 order-notes-card">
            <div class="card-header bg-white">
                <h5 class="mb-0">Order Notes</h5>
            </div>
            <div class="card-body">
                <p class="mb-0 text-white-50">{{ $order->notes ?: 'No notes added.' }}</p>
            </div>
        </div>
    </div>

    <div class="col-lg-4">
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white">
                <h5 class="mb-0">Amount Summary</h5>
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-between py-2"><span>Products Amount</span><strong>{{ number_format((float) $order->subtotal, 2) }}</strong></div>
                <div class="d-flex justify-content-between py-2"><span>Discount</span><strong>{{ number_format((float) $order->discount_amount, 2) }}</strong></div>
                <div class="d-flex justify-content-between py-2"><span>Delivery Charge</span><strong>{{ number_format((float) $order->delivery_charge_amount, 2) }}</strong></div>
                <div class="d-flex justify-content-between py-2"><span>Tax</span><strong>{{ number_format((float) $order->tax_amount, 2) }}</strong></div>
                <div class="d-flex justify-content-between border-top mt-2 pt-3 fs-5"><span>Total</span><strong>{{ number_format((float) $order->total, 2) }}</strong></div>
                <div class="mt-3 badge bg-warning text-dark">Cash on Delivery</div>
                <div class="mt-2 badge bg-primary">Payment {{ $paymentStatuses[$order->payment_status ?? 'pending'] ?? 'Pending' }}</div>
            </div>
        </div>

        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white">
                <h5 class="mb-0">Customer</h5>
            </div>
            <div class="card-body">
                <div class="fw-semibold">{{ $order->name }}</div>
                <div class="text-white-50">{{ $order->phone }}</div>
                <div class="text-white-50">{{ $order->email }}</div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
                <h5 class="mb-0">Delivery Address</h5>
            </div>
            <div class="card-body">
                <div>{{ $order->address_line_1 }}</div>
                @foreach([$order->address_line_2, $order->city, $order->postal_code] as $line)
                    @if($line)
                        <div class="text-white-50">{{ $line }}</div>
                    @endif
                @endforeach
                @if($order->landmark)
                    <div class="mt-2 text-white-50">Landmark: {{ $order->landmark }}</div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
<style>
    .order-admin-table th,
    .order-admin-table td {
        padding: 1rem 1.35rem;
        vertical-align: middle;
    }

    .order-notes-card .card-body {
        min-height: 220px;
        padding: 1.5rem;
    }

    .card .card-body {
        padding: 1.35rem 1.5rem;
    }

    .card .card-header {
        padding: 1rem 1.5rem;
    }
</style>
@endpush

@push('scripts')
<script>
    document.querySelectorAll('.order-status-select').forEach((select) => {
        select.addEventListener('change', () => {
            select.closest('form').submit();
        });
    });
</script>
@endpush
