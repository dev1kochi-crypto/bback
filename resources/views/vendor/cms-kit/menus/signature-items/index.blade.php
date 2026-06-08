@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item active" aria-current="page">Signature Items</li>
@endsection

@section('content')
@php
    $showLanguageUi = config('cms-kit.common.modules.languages', true);
    $translations = $section->translations ?? [];
    $defaultLanguage = $languages->firstWhere('is_default', true) ?? $languages->first();
    $visibleLanguages = $showLanguageUi ? $languages : collect($defaultLanguage ? [$defaultLanguage] : []);
    $maxItems = config('cms-kit.database.menus.signature_items.max_items', 4);
    $canAddItem = \App\Models\CmsKit\MenuSignatureItem::where('status', true)->count() < $maxItems;
@endphp

<div class="card mb-4">
    <div class="card-header bg-white py-3">
        <h5 class="mb-0">Signature Items Common Section</h5>
    </div>
    <div class="card-body p-4">
        <form action="{{ route('cms.menus.signature-items.section.update') }}" method="POST">
            @csrf

            @if($showLanguageUi)
            <ul class="nav nav-pills mb-4 bg-light p-2 rounded-4 language-switcher-tabs" role="tablist">
                @foreach($visibleLanguages as $lang)
                <li class="nav-item" role="presentation">
                    <button class="nav-link {{ $loop->first ? 'active' : '' }} px-4 py-2 fw-medium" data-bs-toggle="tab" data-bs-target="#signature-section-{{ $lang->code }}" type="button" role="tab">
                        <i class="fas fa-language me-2 opacity-75"></i>{{ $lang->name }}
                    </button>
                </li>
                @endforeach
            </ul>
            @endif

            <div class="{{ $showLanguageUi ? 'tab-content language-switcher-content' : '' }} mb-4">
                @foreach($visibleLanguages as $lang)
                @php $trans = $translations[$lang->code] ?? []; @endphp
                <div class="{{ $showLanguageUi ? 'tab-pane fade ' . ($loop->first ? 'show active' : '') : '' }}" id="signature-section-{{ $lang->code }}" role="tabpanel">
                    <div class="row g-3">
                        <div class="col-12">
                            <label class="form-label fw-bold">Title{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <input type="text" name="translations[{{ $lang->code }}][line_2]" class="form-control" value="{{ old("translations.{$lang->code}.line_2", $trans['line_2'] ?? '') }}">
                            <small class="text-muted d-block mt-1">Frontend supports <code>&lt;br&gt;</code> for manual line breaks.</small>
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold">Description{{ $showLanguageUi ? ' (' . strtoupper($lang->code) . ')' : '' }}</label>
                            <textarea name="translations[{{ $lang->code }}][short_description]" class="form-control" rows="3">{{ old("translations.{$lang->code}.short_description", $trans['short_description'] ?? '') }}</textarea>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <div class="d-flex flex-wrap align-items-center gap-3">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" name="status" id="signatureSectionStatus" {{ $section->status ? 'checked' : '' }}>
                    <label class="form-check-label fw-bold" for="signatureSectionStatus">Active Status</label>
                </div>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" name="display_home" id="signatureDisplayHome" value="1" {{ old('display_home', data_get($section->extra_fields, 'display_home', false)) ? 'checked' : '' }}>
                    <label class="form-check-label fw-bold" for="signatureDisplayHome">Display on Home Page</label>
                </div>
                <button type="submit" class="btn btn-primary px-4">Save Section</button>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Signature Items</h5>
        @if($canAddItem)
            <a href="{{ route('cms.menus.signature-items.create') }}" class="btn btn-primary btn-sm"><i class="fas fa-plus me-1"></i>Add Signature Item</a>
        @else
            <span class="badge bg-warning text-dark">Already 4 signature items selected.</span>
        @endif
    </div>
    <div class="card-body p-4">
        <div class="table-responsive">
            <table class="table premium-table mb-0 w-100" id="menuSignatureItemsTable">
                <thead>
                    <tr>
                        <th style="width:50px;">#</th>
                        <th style="width:90px;">Image</th>
                        <th>Name</th>
                        <th>Menu Item</th>
                        <th>Alt Text</th>
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
    const table = $('#menuSignatureItemsTable').DataTable({
        processing: true,
        serverSide: true,
        ajax: "{{ route('cms.menus.signature-items.index') }}",
        columns: [
            {data: 'DT_RowIndex', orderable: false, searchable: false},
            {data: 'image_preview', orderable: false, searchable: false},
            {data: 'title_text', name: 'title'},
            {data: 'menu_item_text', orderable: false},
            {data: 'alt_text_value', orderable: false},
            {data: 'order', orderable: false, searchable: false},
            {data: 'status', orderable: false, searchable: false, className: 'text-center'},
            {data: 'action', orderable: false, searchable: false, className: 'text-end pe-4'}
        ]
    });

    $(document).on('change', '#menuSignatureItemsTable .toggle-status', function() {
        $.post("{{ url(config('cms-kit.common.auth.prefix', 'admin')) }}/signature-items/" + $(this).data('id') + "/toggle-status", {_token: "{{ csrf_token() }}"})
            .fail((xhr) => {
                alert(xhr.responseJSON?.message || 'Already 4 signature items selected.');
                table.ajax.reload(null, false);
            });
    });
    $(document).on('change', '#menuSignatureItemsTable .reorder-input', function() {
        $.post("{{ route('cms.menus.signature-items.reorder') }}", {id: $(this).data('id'), sort_order: $(this).val(), _token: "{{ csrf_token() }}"}, () => table.ajax.reload(null, false));
    });
    $(document).on('click', '#menuSignatureItemsTable .delete-item', function() {
        if (!confirm('Delete this signature item?')) return;
        $.ajax({url: "{{ url(config('cms-kit.common.auth.prefix', 'admin')) }}/signature-items/" + $(this).data('id'), type: 'DELETE', data: {_token: "{{ csrf_token() }}"}, success: () => table.ajax.reload(null, false)});
    });
});
</script>
@endpush
