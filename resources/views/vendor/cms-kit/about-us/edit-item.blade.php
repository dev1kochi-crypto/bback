@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.about-us.index') }}">About Us</a></li>
    <li class="breadcrumb-item"><a href="{{ route('cms.about-us.why-choose.index') }}">Why Choose Us</a></li>
    <li class="breadcrumb-item active">Edit Why Choose Us Item</li>
@endsection

@section('content')
@php
    $showLanguageUi = config('cms-kit.common.modules.languages', true);
    $formLanguages = $showLanguageUi ? $languages : $languages->take(1);
@endphp
<div class="card border-0 shadow-sm">
    <div class="card-header bg-white py-3">
        <h5 class="mb-0">Edit Why Choose Us Item</h5>
    </div>
    <div class="card-body p-4">
        <form action="{{ route('cms.about-us.items.update', $item->id) }}" method="POST" enctype="multipart/form-data">
            @csrf
            @method('PUT')

            @if($showLanguageUi)
            <ul class="nav nav-pills mb-4 bg-light p-2 rounded-4 language-switcher-tabs">
                @foreach($formLanguages as $lang)
                <li class="nav-item">
                    <button class="nav-link {{ $loop->first ? 'active' : '' }}" data-bs-toggle="tab" data-bs-target="#item-{{ $lang->code }}" type="button">{{ $lang->name }}</button>
                </li>
                @endforeach
            </ul>
            @endif

            <div class="tab-content mb-4">
                @foreach($formLanguages as $lang)
                <div class="tab-pane fade {{ $loop->first ? 'show active' : '' }}" id="item-{{ $lang->code }}">
                    <div class="row g-4">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Line 1</label>
                            <input type="text" name="translations[{{ $lang->code }}][line_1]" class="form-control" value="{{ old("translations.{$lang->code}.line_1", $item->translations[$lang->code]['line_1'] ?? $item->line_1) }}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Line 2</label>
                            <input type="text" name="translations[{{ $lang->code }}][line_2]" class="form-control" value="{{ old("translations.{$lang->code}.line_2", $item->translations[$lang->code]['line_2'] ?? $item->line_2) }}">
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <div class="row g-4">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Icon</label>
                    @if($item->icon)
                        <div class="mb-2"><img src="{{ asset('storage/' . $item->icon) }}" class="img-thumbnail" style="height: 80px;"></div>
                        <div class="form-check mb-2">
                            <input type="checkbox" class="form-check-input" name="remove_icon" id="remove_icon" value="1">
                            <label for="remove_icon" class="form-check-label">Remove current icon</label>
                        </div>
                    @endif
                    <input type="file" name="icon" class="form-control">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Icon Alt Text</label>
                    <input type="text" name="icon_alt" class="form-control" value="{{ old('icon_alt', $item->icon_alt) }}">
                </div>
                <div class="col-md-6 d-flex align-items-end">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="is_active" id="itemStatus" value="1" {{ old('is_active', $item->is_active) ? 'checked' : '' }}>
                        <label class="form-check-label fw-bold" for="itemStatus">Status (Active)</label>
                    </div>
                </div>
            </div>

            <div class="mt-4 border-top pt-4">
                <button type="submit" class="btn btn-primary px-4">Update Item</button>
                <a href="{{ route('cms.about-us.why-choose.index') }}" class="btn btn-outline-secondary px-4">Cancel</a>
            </div>
        </form>
    </div>
</div>
@endsection
