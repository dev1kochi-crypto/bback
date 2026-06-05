@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item active" aria-current="page">Menus</li>
@endsection

@section('content')
@php
    $showLanguageUi = config('cms-kit.common.modules.languages', true);
    $translations = $section->translations ?? [];
    $extraFields = $section->extra_fields ?? [];
@endphp
<div class="card">
    <div class="card-header bg-white py-3">
        <h5 class="mb-0">Menus Common Section</h5>
    </div>
    <div class="card-body p-4">
        <form action="{{ route('cms.menus.common.update') }}" method="POST">
            @csrf

            @if($showLanguageUi)
            <ul class="nav nav-pills mb-4 bg-light p-2 rounded-4 language-switcher-tabs" role="tablist">
                @foreach($languages as $lang)
                <li class="nav-item" role="presentation">
                    <button class="nav-link {{ $loop->first ? 'active' : '' }} px-4 py-2 fw-medium" data-bs-toggle="tab" data-bs-target="#menu-section-{{ $lang->code }}" type="button" role="tab">
                        <i class="fas fa-language me-2 opacity-75"></i>{{ $lang->name }}
                    </button>
                </li>
                @endforeach
            </ul>
            @endif

            <div class="tab-content mb-4 language-switcher-content">
                @foreach($languages as $lang)
                @php $trans = $translations[$lang->code] ?? []; @endphp
                <div class="tab-pane fade {{ $loop->first ? 'show active' : '' }}" id="menu-section-{{ $lang->code }}" role="tabpanel">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Line 1{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <input type="text" name="translations[{{ $lang->code }}][line_1]" class="form-control" value="{{ old("translations.{$lang->code}.line_1", $trans['line_1'] ?? '') }}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Line 2{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <input type="text" name="translations[{{ $lang->code }}][line_2]" class="form-control" value="{{ old("translations.{$lang->code}.line_2", $trans['line_2'] ?? '') }}">
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold">Short Description{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <textarea name="translations[{{ $lang->code }}][short_description]" class="form-control" rows="3">{{ old("translations.{$lang->code}.short_description", $trans['short_description'] ?? '') }}</textarea>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Button Text{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <input type="text" name="translations[{{ $lang->code }}][button_text]" class="form-control" value="{{ old("translations.{$lang->code}.button_text", $trans['button_text'] ?? '') }}">
                        </div>
                        @if($loop->first)
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Button URL</label>
                            <input type="text" name="extra_fields[button_url]" class="form-control" value="{{ old('extra_fields.button_url', $extraFields['button_url'] ?? '') }}">
                        </div>
                        @endif
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Listing Title{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <input type="text" name="translations[{{ $lang->code }}][listing_title]" class="form-control" value="{{ old("translations.{$lang->code}.listing_title", $trans['listing_title'] ?? '') }}">
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold">Listing Description{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <textarea name="translations[{{ $lang->code }}][listing_description]" class="form-control" rows="3">{{ old("translations.{$lang->code}.listing_description", $trans['listing_description'] ?? '') }}</textarea>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <div class="row g-3">
                <div class="col-md-4 d-flex align-items-end pb-2">
                    <div class="d-flex flex-column gap-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" name="status" id="menuSectionStatus" {{ $section->status ? 'checked' : '' }}>
                            <label class="form-check-label fw-bold" for="menuSectionStatus">Active Status</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" name="display_home" id="menuDisplayHome" value="1" {{ old('display_home', data_get($section->extra_fields, 'display_home', false)) ? 'checked' : '' }}>
                            <label class="form-check-label fw-bold" for="menuDisplayHome">Display on Home Page</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4">
                <button type="submit" class="btn btn-primary px-4">Save Section</button>
            </div>
        </form>
    </div>
</div>
@endsection
