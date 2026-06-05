@php
    $showLanguageUi = config('cms-kit.common.modules.languages', true);
    $translations = old('translations', $item?->translations ?? []);
    $iconConfig = config('cms-kit.images.order-process.item_icon', []);
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
                <li class="nav-item" role="presentation"><button class="nav-link {{ $loop->first ? 'active' : '' }} px-4 py-2 fw-medium" data-bs-toggle="tab" data-bs-target="#order-process-item-{{ $lang->code }}" type="button"><i class="fas fa-language me-2 opacity-75"></i>{{ $lang->name }}</button></li>
                @endforeach
            </ul>
            @endif

            <div class="{{ $showLanguageUi ? 'tab-content language-switcher-content' : '' }} mb-4">
                @foreach($visibleLanguages as $lang)
                @php $trans = $translations[$lang->code] ?? []; @endphp
                <div class="{{ $showLanguageUi ? 'tab-pane fade ' . ($loop->first ? 'show active' : '') : '' }}" id="order-process-item-{{ $lang->code }}">
                    <div class="border rounded-4 p-4">
                        <div class="row g-4">
                            <div class="col-lg-6">
                                <label class="form-label fw-bold">Title{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                                <input type="text" name="translations[{{ $lang->code }}][title]" class="form-control" value="{{ $trans['title'] ?? $item?->title }}">
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-bold">Description{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                                <textarea name="translations[{{ $lang->code }}][description]" class="form-control" rows="3">{{ $trans['description'] ?? $item?->description }}</textarea>
                            </div>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <div class="row g-4">
                <div class="col-lg-6">
                    <label class="form-label fw-bold">Icon</label>
                    @if($item?->icon)
                        <div class="mb-2"><img src="{{ asset('storage/' . $item->icon) }}" class="img-thumbnail" style="height:80px;"></div>
                        <div class="form-check mb-2"><input class="form-check-input" type="checkbox" name="remove_icon" value="1" id="removeOrderProcessIcon"><label class="form-check-label" for="removeOrderProcessIcon">Remove current icon</label></div>
                    @endif
                    <input type="file" name="icon" class="form-control" accept="{{ $iconConfig['accept'] ?? '' }}">
                    <small class="text-muted">Recommended: {{ $iconConfig['width'] ?? 64 }}x{{ $iconConfig['height'] ?? 64 }}px. Max {{ $iconConfig['max_size'] ?? 2048 }} KB.</small>
                </div>
                <div class="col-lg-6">
                    <label class="form-label fw-bold">Icon Alt Text</label>
                    <input type="text" name="icon_alt" class="form-control" value="{{ old('icon_alt', $item?->icon_alt) }}">
                </div>
                <div class="col-lg-3 col-md-6">
                    <label class="form-label fw-bold">Display Order</label>
                    <input type="number" name="sort_order" class="form-control" value="{{ old('sort_order', $item?->sort_order ?? $nextOrder ?? 1) }}" min="1" {{ $item ? 'readonly aria-readonly=true' : '' }}>
                </div>
                <div class="col-lg-3 col-md-6">
                    <div class="d-flex align-items-center h-100 pt-4">
                        <div class="form-check form-switch mb-0">
                            <input class="form-check-input" type="checkbox" name="status" id="orderProcessItemStatus" {{ old('status', $item?->status ?? true) ? 'checked' : '' }}>
                            <label class="form-check-label fw-bold" for="orderProcessItemStatus">Active Status</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 d-flex gap-2">
                <button type="submit" class="btn btn-primary px-4">{{ $submitLabel }}</button>
                <a href="{{ route('cms.order-process.index') }}" class="btn btn-outline-secondary px-4">Cancel</a>
            </div>
        </form>
    </div>
</div>
