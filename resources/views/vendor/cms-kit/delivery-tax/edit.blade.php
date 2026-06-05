@extends('cms-kit::layouts.cms')

@section('title', 'Delivery Charge & Tax')

@section('breadcrumbs')
    <li class="breadcrumb-item active">Delivery Charge & Tax</li>
@endsection

@section('content')
<div class="card border-0 shadow-sm">
    <div class="card-header bg-white d-flex align-items-center justify-content-between">
        <div>
            <h5 class="mb-1">Delivery Charge & Tax</h5>
            <p class="text-muted small mb-0">These values are used in cart, checkout, and order totals.</p>
        </div>
    </div>
    <div class="card-body">
        <form method="POST" action="{{ route('cms.delivery-tax.update') }}" class="row g-4">
            @csrf
            @method('PUT')

            <div class="col-md-4">
                <label class="form-label fw-semibold">Free delivery above amount</label>
                <input type="number" step="0.01" min="0" name="delivery_free_above_amount" class="form-control @error('delivery_free_above_amount') is-invalid @enderror" value="{{ old('delivery_free_above_amount', $siteInformation->delivery_free_above_amount ?? 0) }}">
                <div class="form-text text-white-50">Example: enter 500. Orders of 500 or above get free delivery; below 500, delivery charge is added.</div>
                @error('delivery_free_above_amount') <div class="invalid-feedback">{{ $message }}</div> @enderror
            </div>

            <div class="col-md-4">
                <label class="form-label fw-semibold">Delivery charge amount</label>
                <input type="number" step="0.01" min="0" name="delivery_charge_amount" class="form-control @error('delivery_charge_amount') is-invalid @enderror" value="{{ old('delivery_charge_amount', $siteInformation->delivery_charge_amount ?? 0) }}">
                @error('delivery_charge_amount') <div class="invalid-feedback">{{ $message }}</div> @enderror
            </div>

            <div class="col-md-4">
                <label class="form-label fw-semibold">Tax amount</label>
                <input type="number" step="0.01" min="0" name="tax_amount" class="form-control @error('tax_amount') is-invalid @enderror" value="{{ old('tax_amount', $siteInformation->tax_amount ?? 0) }}">
                @error('tax_amount') <div class="invalid-feedback">{{ $message }}</div> @enderror
            </div>

            <div class="col-12">
                <button type="submit" class="btn btn-primary px-4">
                    <i class="fas fa-save me-1"></i> Save Settings
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
