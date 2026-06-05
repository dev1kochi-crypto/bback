@php
    $translations = old('translations', $offer?->translations ?? []);
    $imageConfig = config('cms-kit.images.offers.image', []);
    $showLanguageUi = config('cms-kit.common.modules.languages', true);
    $defaultLanguage = $languages->firstWhere('is_default', true) ?? $languages->first();
    $visibleLanguages = $showLanguageUi ? $languages : collect($defaultLanguage ? [$defaultLanguage] : []);
@endphp
<div class="card">
    <div class="card-header bg-white py-3"><h5 class="mb-0">{{ $title }}</h5></div>
    <div class="card-body p-4">
        @if ($errors->any())
            <div class="alert alert-danger"><ul class="mb-0">@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>
        @endif
        <form action="{{ $action }}" method="POST" enctype="multipart/form-data">
            @csrf
            @if($method !== 'POST') @method($method) @endif

            @if($showLanguageUi)
                <ul class="nav nav-pills mb-4 bg-light p-2 rounded-4 language-switcher-tabs" role="tablist">
                    @foreach($visibleLanguages as $lang)
                    <li class="nav-item" role="presentation"><button class="nav-link {{ $loop->first ? 'active' : '' }} px-4 py-2 fw-medium" data-bs-toggle="tab" data-bs-target="#offer-{{ $lang->code }}" type="button"><i class="fas fa-language me-2 opacity-75"></i>{{ $lang->name }}</button></li>
                    @endforeach
                </ul>
            @endif

            <div class="{{ $showLanguageUi ? 'tab-content' : '' }} mb-4">
                <div class="col-6">
                    <label class="form-label fw-bold">Image</label>
                    @if($offer?->image)
                        <div class="mb-2"><img src="{{ asset('storage/' . $offer->image) }}" class="img-thumbnail" style="height:100px;"></div>
                        <div class="form-check mb-2"><input class="form-check-input" type="checkbox" name="remove_image" value="1" id="removeOfferImage"><label class="form-check-label" for="removeOfferImage">Remove current image</label></div>
                    @endif
                    <input type="file" name="image" class="form-control" accept="{{ $imageConfig['accept'] ?? '' }}">
                    <small class="text-muted">Recommended: {{ $imageConfig['width'] ?? 900 }}x{{ $imageConfig['height'] ?? 520 }}px. Max {{ $imageConfig['max_size'] ?? 2048 }} KB.</small>
                </div>
                @foreach($visibleLanguages as $lang)
                @php $trans = $translations[$lang->code] ?? []; @endphp
                <div class="col-6 {{ $showLanguageUi ? 'tab-pane fade ' . ($loop->first ? 'show active' : '') : '' }}" id="offer-{{ $lang->code }}">
                    <label class="form-label fw-bold">Alt Text</label>
                    <input type="text" name="translations[{{ $lang->code }}][alt_text]" class="form-control" value="{{ $trans['alt_text'] ?? $offer?->alt_text }}">
                </div>
                @endforeach
            </div>

            <div class="row g-4">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Display Order</label>
                    <input type="number" name="sort_order" class="form-control" value="{{ old('sort_order', $offer?->sort_order ?? $nextOrder ?? 1) }}" min="1" {{ $offer ? 'disabled' : '' }}>
                </div>
                <div class="col-md-6 d-flex align-items-end pb-2">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="status" id="offerStatus" {{ old('status', $offer?->status ?? true) ? 'checked' : '' }}>
                        <label class="form-check-label fw-bold" for="offerStatus">Active Status</label>
                    </div>
                </div>
            </div>

            <div class="mt-4 d-flex gap-2">
                <button type="submit" class="btn btn-primary px-4">{{ $submitLabel }}</button>
                <a href="{{ route('cms.offers.index') }}" class="btn btn-outline-secondary px-4">Cancel</a>
            </div>
        </form>
    </div>
</div>
