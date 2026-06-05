@php
    $showLanguageUi = config('cms-kit.common.modules.languages', true);
    $translations = old('translations', $item?->translations ?? []);
    $imageConfig = config('cms-kit.images.menus.item_image', []);
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
                <li class="nav-item" role="presentation"><button class="nav-link {{ $loop->first ? 'active' : '' }} px-4 py-2 fw-medium" data-bs-toggle="tab" data-bs-target="#item-{{ $lang->code }}" type="button"><i class="fas fa-language me-2 opacity-75"></i>{{ $lang->name }}</button></li>
                @endforeach
            </ul>
            @endif

            <div class="{{ $showLanguageUi ? 'tab-content language-switcher-content' : '' }} mb-4">
                @foreach($visibleLanguages as $lang)
                @php $trans = $translations[$lang->code] ?? []; @endphp
                <div class="{{ $showLanguageUi ? 'tab-pane fade ' . ($loop->first ? 'show active' : '') : '' }}" id="item-{{ $lang->code }}">
                    <div class="border rounded-4 p-4">
                        <div class="row g-4">
                            <div class="col-lg-6">
                            <label class="form-label fw-bold">Item Name{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <input type="text" name="translations[{{ $lang->code }}][name]" class="form-control" value="{{ $trans['name'] ?? $item?->name }}">
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
                    <label class="form-label fw-bold">Category</label>
                    <select name="menu_category_id" class="form-select">
                        <option value="">Select Category</option>
                        @foreach($categories as $category)
                            <option value="{{ $category->id }}" @selected(old('menu_category_id', $item?->menu_category_id) == $category->id)>{{ $category->getTranslation('name') }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col-lg-3 col-md-6">
                    <label class="form-label fw-bold">Food Type</label>
                    <select name="food_type" class="form-select">
                        <option value="veg" @selected(old('food_type', $item?->food_type ?? 'veg') === 'veg')>Veg</option>
                        <option value="non_veg" @selected(old('food_type', $item?->food_type) === 'non_veg')>Non Veg</option>
                    </select>
                </div>
                <div class="col-lg-3 col-md-6">
                    <label class="form-label fw-bold">Price</label>
                    <input type="number" step="0.01" min="0" name="price" class="form-control" value="{{ old('price', $item?->price ?? 0) }}">
                </div>
                <div class="col-lg-6">
                    <label class="form-label fw-bold">Image</label>
                    @if($item?->image)
                        <div class="mb-2"><img src="{{ asset('storage/' . $item->image) }}" class="img-thumbnail" style="height:90px;"></div>
                        <div class="form-check mb-2"><input class="form-check-input" type="checkbox" name="remove_image" value="1" id="removeItemImage"><label class="form-check-label" for="removeItemImage">Remove current image</label></div>
                    @endif
                    <input type="file" name="image" class="form-control" accept="{{ $imageConfig['accept'] ?? '' }}">
                    <small class="text-muted">Recommended: {{ $imageConfig['width'] ?? 700 }}x{{ $imageConfig['height'] ?? 700 }}px. Max {{ $imageConfig['max_size'] ?? 2048 }} KB.</small>
                </div>
                @foreach($visibleLanguages as $lang)
                @php $trans = $translations[$lang->code] ?? []; @endphp
                <div class="col-lg-6 {{ $showLanguageUi ? 'language-alt-field language-alt-field-' . $lang->code . ($loop->first ? '' : ' d-none') : '' }}">
                    <label class="form-label fw-bold">Image Alt Text{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                    <input type="text" name="translations[{{ $lang->code }}][image_alt]" class="form-control" value="{{ $trans['image_alt'] ?? $item?->image_alt }}">
                </div>
                @endforeach
                <div class="col-lg-3 col-md-6">
                    <label class="form-label fw-bold">Display Order</label>
                    <input type="number" name="sort_order" class="form-control" value="{{ old('sort_order', $item?->sort_order ?? $nextOrder ?? 1) }}" min="1" {{ $item ? 'readonly aria-readonly=true' : '' }}>
                </div>
                <div class="col-lg-3 col-md-6">
                    <div class="d-flex flex-wrap align-items-center gap-4 h-100 pt-4">
                        <div class="form-check form-switch mb-0">
                            <input class="form-check-input" type="checkbox" name="spicy" id="itemSpicy" {{ old('spicy', $item?->spicy ?? false) ? 'checked' : '' }}>
                            <label class="form-check-label fw-bold" for="itemSpicy">Spicy</label>
                        </div>
                        <div class="form-check form-switch mb-0">
                            <input class="form-check-input" type="checkbox" name="status" id="itemStatus" {{ old('status', $item?->status ?? true) ? 'checked' : '' }}>
                            <label class="form-check-label fw-bold" for="itemStatus">Active Status</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 d-flex gap-2">
                <button type="submit" class="btn btn-primary px-4">{{ $submitLabel }}</button>
                <a href="{{ route('cms.menus.items.index') }}" class="btn btn-outline-secondary px-4">Cancel</a>
            </div>
        </form>
    </div>
</div>

@if($showLanguageUi)
@push('scripts')
<script>
    document.querySelectorAll('[data-bs-target^="#item-"]').forEach((tab) => {
        tab.addEventListener('shown.bs.tab', (event) => {
            const languageCode = event.target.getAttribute('data-bs-target').replace('#item-', '');
            document.querySelectorAll('.language-alt-field').forEach((field) => {
                field.classList.toggle('d-none', !field.classList.contains(`language-alt-field-${languageCode}`));
            });
        });
    });
</script>
@endpush
@endif
