@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.coupons.index') }}">Coupons</a></li>
    <li class="breadcrumb-item active" aria-current="page">Create</li>
@endsection

@section('content')
<div class="card">
    <div class="card-header bg-white py-3">
        <h5 class="mb-0">Create Coupon</h5>
    </div>
    <div class="card-body p-4">
        <form action="{{ route('cms.coupons.store') }}" method="POST">
            @include('cms-kit::coupons.form')
            <div class="mt-4 d-flex gap-2">
                <button type="submit" class="btn btn-primary">Save Coupon</button>
                <a href="{{ route('cms.coupons.index') }}" class="btn btn-outline-secondary">Cancel</a>
            </div>
        </form>
    </div>
</div>
@endsection
