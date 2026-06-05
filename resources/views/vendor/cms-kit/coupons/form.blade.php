@csrf

<div class="row g-3">
    <div class="col-md-4">
        <label class="form-label fw-semibold">Coupon Code</label>
        <input type="text" name="code" class="form-control" value="{{ old('code', $coupon->code ?? '') }}" placeholder="BBACK10" required>
    </div>
    <div class="col-md-4">
        <label class="form-label fw-semibold">Discount Type</label>
        <select name="discount_type" class="form-select" required>
            @foreach(['fixed' => 'Fixed Amount', 'percent' => 'Percentage'] as $value => $label)
                <option value="{{ $value }}" @selected(old('discount_type', $coupon->discount_type ?? 'fixed') === $value)>{{ $label }}</option>
            @endforeach
        </select>
    </div>
    <div class="col-md-4">
        <label class="form-label fw-semibold">Discount Value</label>
        <input type="number" step="0.01" min="0.01" name="discount_value" class="form-control" value="{{ old('discount_value', $coupon->discount_value ?? '') }}" required>
    </div>
    <div class="col-md-4">
        <label class="form-label fw-semibold">Minimum Order Amount</label>
        <input type="number" step="0.01" min="0" name="minimum_order_amount" class="form-control" value="{{ old('minimum_order_amount', $coupon->minimum_order_amount ?? 0) }}">
    </div>
    <div class="col-md-4">
        <label class="form-label fw-semibold">Maximum Discount Amount</label>
        <input type="number" step="0.01" min="0" name="maximum_discount_amount" class="form-control" value="{{ old('maximum_discount_amount', $coupon->maximum_discount_amount ?? '') }}">
        <small class="text-muted">Useful for percentage coupons.</small>
    </div>
    <div class="col-md-4">
        <label class="form-label fw-semibold">Usage Limit</label>
        <input type="number" min="1" name="usage_limit" class="form-control" value="{{ old('usage_limit', $coupon->usage_limit ?? '') }}">
    </div>
    <div class="col-md-6">
        <label class="form-label fw-semibold">Target Category</label>
        <select name="menu_category_id" class="form-select">
            <option value="">All Categories</option>
            @foreach($categories as $category)
                <option value="{{ $category->id }}" @selected((string) old('menu_category_id', $coupon->menu_category_id ?? '') === (string) $category->id)>{{ $category->getTranslation('name') }}</option>
            @endforeach
        </select>
    </div>
    <div class="col-md-6">
        <label class="form-label fw-semibold">Target Item</label>
        <select name="menu_item_id" class="form-select">
            <option value="">All Items / Category Target</option>
            @foreach($items as $item)
                <option value="{{ $item->id }}" @selected((string) old('menu_item_id', $coupon->menu_item_id ?? '') === (string) $item->id)>{{ $item->getTranslation('name') }} @if($item->category) - {{ $item->category->getTranslation('name') }} @endif</option>
            @endforeach
        </select>
        <small class="text-muted">Item target overrides category target.</small>
    </div>
    <div class="col-md-6">
        <label class="form-label fw-semibold">Starts At</label>
        <input type="datetime-local" name="starts_at" class="form-control" value="{{ old('starts_at', optional($coupon->starts_at ?? null)->format('Y-m-d\TH:i')) }}">
    </div>
    <div class="col-md-6">
        <label class="form-label fw-semibold">Expires At</label>
        <input type="datetime-local" name="expires_at" class="form-control" value="{{ old('expires_at', optional($coupon->expires_at ?? null)->format('Y-m-d\TH:i')) }}">
    </div>
    <div class="col-12">
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" name="status" value="1" id="status" @checked(old('status', $coupon->status ?? true))>
            <label class="form-check-label fw-semibold" for="status">Active</label>
        </div>
    </div>
</div>
