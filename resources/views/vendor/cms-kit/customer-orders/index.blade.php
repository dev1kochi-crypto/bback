@extends('cms-kit::layouts.cms')

@section('title', 'Orders')

@section('breadcrumbs')
    <li class="breadcrumb-item active">Orders</li>
@endsection

@section('content')
<div class="card border-0 shadow-sm mb-4 orders-filter-card">
    <div class="card-body">
        <form method="GET" action="{{ route('cms.customer-orders.index') }}" class="row g-3 align-items-end">
            <div class="col-md-3">
                <label class="form-label fw-semibold">Search</label>
                <input type="text" name="search" value="{{ $filters['search'] ?? '' }}" class="form-control" placeholder="Order, name, phone, email">
            </div>
            <div class="col-md-2">
                <label class="form-label fw-semibold">Status</label>
                <select name="status" class="form-select">
                    <option value="">All statuses</option>
                    @foreach($statuses as $value => $label)
                        <option value="{{ $value }}" @selected(($filters['status'] ?? '') === $value)>{{ $label }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label fw-semibold">From</label>
                <input type="date" name="date_from" value="{{ $filters['date_from'] ?? '' }}" class="form-control">
            </div>
            <div class="col-md-2">
                <label class="form-label fw-semibold">To</label>
                <input type="date" name="date_to" value="{{ $filters['date_to'] ?? '' }}" class="form-control">
            </div>
            <div class="col-md-3 d-flex gap-2">
                <button type="submit" class="btn btn-primary flex-fill">Filter</button>
                <a href="{{ route('cms.customer-orders.index') }}" class="btn btn-light border">Reset</a>
                <a href="{{ route('cms.customer-orders.export', request()->query()) }}" class="btn btn-success">
                    <i class="fas fa-file-export me-1"></i> Export
                </a>
            </div>
        </form>
    </div>
</div>

<div class="card border-0 shadow-sm">
    <div class="card-header bg-white">
        <h5 class="mb-0">Order Listing</h5>
    </div>
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table align-middle mb-0 order-admin-table">
                <thead>
                    <tr>
                        <th style="width: 160px;">Order</th>
                        <th style="width: 230px;">Customer</th>
                        <th style="width: 170px;">Amount</th>
                        <th style="width: 190px;">Status</th>
                        <th style="width: 190px;">Payment Status</th>
                        <th>Address</th>
                        <th style="width: 170px;">Date</th>
                        <th style="width: 90px;" class="text-end">Action</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($orders as $order)
                        <tr>
                            <td>
                                <div class="fw-bold">{{ $order->display_order_number }}</div>
                                <small class="text-muted">{{ collect($order->items ?? [])->sum('quantity') }} items</small>
                            </td>
                            <td>
                                <div class="fw-semibold">{{ $order->name }}</div>
                                <small class="text-muted d-block">{{ $order->phone }}</small>
                                <small class="text-muted">{{ $order->email }}</small>
                            </td>
                            <td>
                                <div class="fw-bold">{{ number_format((float) $order->total, 2) }}</div>
                                <small class="text-muted d-block">Products: {{ number_format((float) $order->subtotal, 2) }}</small>
                                <small class="text-muted d-block">Delivery: {{ number_format((float) $order->delivery_charge_amount, 2) }}</small>
                                <small class="text-muted">Tax: {{ number_format((float) $order->tax_amount, 2) }}</small>
                            </td>
                            <td>
                                <form method="POST" action="{{ route('cms.customer-orders.update-status', $order) }}" class="order-status-form">
                                    @csrf
                                    @method('PUT')
                                    <select name="status" class="form-select form-select-sm order-status-select">
                                        @foreach($statuses as $value => $label)
                                            <option value="{{ $value }}" @selected($order->status === $value)>{{ $label }}</option>
                                        @endforeach
                                    </select>
                                </form>
                            </td>
                            <td>
                                <form method="POST" action="{{ route('cms.customer-orders.update-payment-status', $order) }}" class="order-status-form">
                                    @csrf
                                    @method('PUT')
                                    <select name="payment_status" class="form-select form-select-sm order-status-select">
                                        @foreach($paymentStatuses as $value => $label)
                                            <option value="{{ $value }}" @selected(($order->payment_status ?? 'pending') === $value)>{{ $label }}</option>
                                        @endforeach
                                    </select>
                                </form>
                                <small class="text-muted d-block mt-1">Cash on Delivery</small>
                            </td>
                            <td>
                                <div>{{ $order->address_line_1 }}</div>
                                <small class="text-muted">{{ collect([$order->address_line_2, $order->city, $order->postal_code])->filter()->implode(', ') }}</small>
                            </td>
                            <td>{{ $order->created_at?->format('d M Y h:i A') }}</td>
                            <td class="text-end">
                                <a href="{{ route('cms.customer-orders.show', $order) }}" class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-eye me-1"></i> View
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center py-5 text-muted">No orders found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @if($orders->hasPages())
        <div class="card-footer bg-white">
            {{ $orders->links() }}
        </div>
    @endif
</div>
@endsection

@push('styles')
<style>
    .orders-filter-card .card-body {
        padding: 1.4rem 1.5rem;
    }

    .order-admin-table th,
    .order-admin-table td {
        padding: 1rem 1.35rem;
        vertical-align: middle;
    }

    .order-admin-table tbody tr {
        min-height: 92px;
    }

    .order-admin-table .form-select {
        min-height: 38px;
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
