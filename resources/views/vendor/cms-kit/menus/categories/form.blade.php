@php
    $showLanguageUi = config('cms-kit.common.modules.languages', true);
    $translations = old('translations', $category?->translations ?? []);
    $iconConfig = config('cms-kit.images.menus.category_icon', []);
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
                @foreach($languages as $lang)
                <li class="nav-item" role="presentation"><button class="nav-link {{ $loop->first ? 'active' : '' }} px-4 py-2 fw-medium" data-bs-toggle="tab" data-bs-target="#category-{{ $lang->code }}" type="button"><i class="fas fa-language me-2 opacity-75"></i>{{ $lang->name }}</button></li>
                @endforeach
            </ul>
            @endif

            <div class="tab-content mb-4 language-switcher-content">
                @foreach($languages as $lang)
                @php $trans = $translations[$lang->code] ?? []; @endphp
                <div class="tab-pane fade {{ $loop->first ? 'show active' : '' }}" id="category-{{ $lang->code }}">
                    <div class="row g-3">
                        <div class="col-md-12">
                            <label class="form-label fw-bold">Category Name{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <input type="text" name="translations[{{ $lang->code }}][name]" class="form-control" value="{{ $trans['name'] ?? $category?->name }}">
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <div class="row g-4">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Icon</label>
                    @if($category?->icon)
                        <div class="mb-2"><img src="{{ asset('storage/' . $category->icon) }}" class="img-thumbnail" style="height:80px;"></div>
                        <div class="form-check mb-2"><input class="form-check-input" type="checkbox" name="remove_icon" value="1" id="removeIcon"><label class="form-check-label" for="removeIcon">Remove current icon</label></div>
                    @endif
                    <input type="file" name="icon" class="form-control" accept="{{ $iconConfig['accept'] ?? '' }}">
                    <small class="text-muted">Recommended: {{ $iconConfig['width'] ?? 256 }}x{{ $iconConfig['height'] ?? 256 }}px. Max {{ $iconConfig['max_size'] ?? 2048 }} KB.</small>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Icon Alt Text</label>
                    <input type="text" name="translations[{{ $lang->code }}][icon_alt]" class="form-control" value="{{ $trans['icon_alt'] ?? $category?->icon_alt }}">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Display Order</label>
                    <input type="number" name="sort_order" class="form-control" value="{{ old('sort_order', $category?->sort_order ?? $nextOrder ?? 1) }}" min="1" {{ $category ? 'disabled' : '' }}>
                </div>
                <div class="col-md-6 d-flex align-items-end pb-2">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="status" id="categoryStatus" {{ old('status', $category?->status ?? true) ? 'checked' : '' }}>
                        <label class="form-check-label fw-bold" for="categoryStatus">Active Status</label>
                    </div>
                </div>
            </div>

            <div class="mt-4 d-flex gap-2">
                <button type="submit" class="btn btn-primary px-4">{{ $submitLabel }}</button>
                <a href="{{ route('cms.menus.categories.index') }}" class="btn btn-outline-secondary px-4">Cancel</a>
            </div>
        </form>
    </div>
</div>
