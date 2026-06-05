@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item active" aria-current="page">Order Process</li>
@endsection

@section('content')
@php
    $showLanguageUi = config('cms-kit.common.modules.languages', true);
    $translations = $section->translations ?? [];
    $defaultLanguage = $languages->firstWhere('is_default', true) ?? $languages->first();
    $visibleLanguages = $showLanguageUi ? $languages : collect($defaultLanguage ? [$defaultLanguage] : []);
    $imageConfig = config('cms-kit.images.order-process.section_image', []);
    $maxItems = config('cms-kit.database.order-process.max_items', 3);
    $canAddItem = \App\Models\CmsKit\OrderProcessItem::count() < $maxItems;
@endphp

<div class="card mb-4">
    <div class="card-header bg-white py-3">
        <h5 class="mb-0">Order Process Common Section</h5>
    </div>
    <div class="card-body p-4">
        <form action="{{ route('cms.order-process.section.update') }}" method="POST" enctype="multipart/form-data">
            @csrf

            @if($showLanguageUi)
            <ul class="nav nav-pills mb-4 bg-light p-2 rounded-4 language-switcher-tabs" role="tablist">
                @foreach($visibleLanguages as $lang)
                <li class="nav-item" role="presentation">
                    <button class="nav-link {{ $loop->first ? 'active' : '' }} px-4 py-2 fw-medium" data-bs-toggle="tab" data-bs-target="#order-process-{{ $lang->code }}" type="button" role="tab">
                        <i class="fas fa-language me-2 opacity-75"></i>{{ $lang->name }}
                    </button>
                </li>
                @endforeach
            </ul>
            @endif

            <div class="{{ $showLanguageUi ? 'tab-content language-switcher-content' : '' }} mb-4">
                @foreach($visibleLanguages as $lang)
                @php $trans = $translations[$lang->code] ?? []; @endphp
                <div class="{{ $showLanguageUi ? 'tab-pane fade ' . ($loop->first ? 'show active' : '') : '' }}" id="order-process-{{ $lang->code }}" role="tabpanel">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Line 1{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <input type="text" name="translations[{{ $lang->code }}][line_1]" class="form-control" value="{{ old("translations.{$lang->code}.line_1", $trans['line_1'] ?? '') }}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Title{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <input type="text" name="translations[{{ $lang->code }}][title]" class="form-control" value="{{ old("translations.{$lang->code}.title", $trans['title'] ?? '') }}">
                            <small class="text-muted d-block mt-1">Frontend supports <code>&lt;br&gt;</code> for manual line breaks.</small>
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold">Description{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <textarea name="translations[{{ $lang->code }}][description]" class="form-control" rows="3">{{ old("translations.{$lang->code}.description", $trans['description'] ?? '') }}</textarea>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <div class="row g-4">
                <div class="col-lg-6">
                    <label class="form-label fw-bold">Section Image</label>
                    @if($section->section_image)
                        <div class="mb-2"><img src="{{ asset('storage/' . $section->section_image) }}" class="img-thumbnail" style="height:100px;"></div>
                        <div class="form-check mb-2"><input class="form-check-input" type="checkbox" name="remove_image" value="1" id="removeOrderProcessImage"><label class="form-check-label" for="removeOrderProcessImage">Remove current image</label></div>
                    @endif
                    <input type="file" name="image" class="form-control" accept="{{ $imageConfig['accept'] ?? '' }}">
                    <small class="text-muted">Recommended: {{ $imageConfig['width'] ?? 920 }}x{{ $imageConfig['height'] ?? 920 }}px. Max {{ $imageConfig['max_size'] ?? 4096 }} KB.</small>
                </div>
                <div class="col-lg-6">
                    <label class="form-label fw-bold">Image Alt Text</label>
                    <input type="text" name="image_alt" class="form-control" value="{{ old('image_alt', $section->section_image_alt) }}">
                </div>
            </div>

            <div class="mt-4 d-flex flex-wrap align-items-center gap-3">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" name="status" id="orderProcessSectionStatus" {{ old('status', $section->status) ? 'checked' : '' }}>
                    <label class="form-check-label fw-bold" for="orderProcessSectionStatus">Active Status</label>
                </div>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" name="display_home" id="orderProcessDisplayHome" value="1" {{ old('display_home', data_get($section->extra_fields, 'display_home', false)) ? 'checked' : '' }}>
                    <label class="form-check-label fw-bold" for="orderProcessDisplayHome">Display on Home Page</label>
                </div>
                <button type="submit" class="btn btn-primary px-4">Save Section</button>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Order Process Steps</h5>
        @if($canAddItem)
            <a href="{{ route('cms.order-process.items.create') }}" class="btn btn-primary btn-sm"><i class="fas fa-plus me-1"></i>Add Item</a>
        @else
            <span class="badge bg-warning text-dark">Maximum 3 items allowed.</span>
        @endif
    </div>
    <div class="card-body p-4">
        <div class="table-responsive">
            <table class="table premium-table mb-0 w-100" id="orderProcessItemsTable">
                <thead>
                    <tr>
                        <th style="width:50px;">#</th>
                        <th style="width:90px;">Icon</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th style="width:90px;">Order</th>
                        <th style="width:90px;" class="text-center">Status</th>
                        <th style="width:110px;" class="text-end pe-4">Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
<script>
$(function() {
    const table = $('#orderProcessItemsTable').DataTable({
        processing: true,
        serverSide: true,
        ajax: "{{ route('cms.order-process.index') }}",
        columns: [
            {data: 'DT_RowIndex', orderable: false, searchable: false},
            {data: 'icon_preview', orderable: false, searchable: false},
            {data: 'title_text', name: 'title'},
            {data: 'description_text', name: 'description'},
            {data: 'order', orderable: false, searchable: false},
            {data: 'status', orderable: false, searchable: false, className: 'text-center'},
            {data: 'action', orderable: false, searchable: false, className: 'text-end pe-4'}
        ]
    });

    $(document).on('change', '#orderProcessItemsTable .toggle-status', function() {
        $.post("{{ url(config('cms-kit.common.auth.prefix', 'admin')) }}/order-process/items/" + $(this).data('id') + "/toggle-status", {_token: "{{ csrf_token() }}"}).fail(() => table.ajax.reload(null, false));
    });
    $(document).on('change', '#orderProcessItemsTable .reorder-input', function() {
        $.post("{{ route('cms.order-process.items.reorder') }}", {id: $(this).data('id'), sort_order: $(this).val(), _token: "{{ csrf_token() }}"}, () => table.ajax.reload(null, false));
    });
    $(document).on('click', '#orderProcessItemsTable .delete-item', function() {
        if (!confirm('Delete this item?')) return;
        $.ajax({url: "{{ url(config('cms-kit.common.auth.prefix', 'admin')) }}/order-process/items/" + $(this).data('id'), type: 'DELETE', data: {_token: "{{ csrf_token() }}"}, success: () => table.ajax.reload(null, false)});
    });
});
</script>
@endpush
