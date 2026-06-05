@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.about-us.index') }}" class="text-decoration-none text-muted">About Us</a></li>
    <li class="breadcrumb-item active" aria-current="page">Why Choose Us</li>
@endsection

@section('content')
@php
    $showLanguageUi = config('cms-kit.common.modules.languages', true);
    $maxItems = config('cms-kit.database.about-us.why_choose_us.max_items', 6);
    $canAddItem = \App\Models\CmsKit\WhyChooseUsItem::count() < $maxItems;
@endphp

<div class="card mb-4 border-0 shadow-sm">
    <div class="card-header bg-white py-3">
        <h5 class="mb-0">Why Choose Us Section</h5>
    </div>
    <div class="card-body p-4">
        <form action="{{ route('cms.about-us.why-choose-section.update') }}" method="POST">
            @csrf
            @if($showLanguageUi)
            <ul class="nav nav-pills mb-4 bg-light p-2 rounded-4 language-switcher-tabs" role="tablist">
                @foreach($languages as $lang)
                <li class="nav-item" role="presentation">
                    <button class="nav-link {{ $loop->first ? 'active' : '' }} px-4 py-2 fw-medium" data-bs-toggle="tab" data-bs-target="#why-{{ $lang->code }}" type="button">
                        <i class="fas fa-language me-2 opacity-75"></i>{{ $lang->name }}
                    </button>
                </li>
                @endforeach
            </ul>
            @endif
            <div class="tab-content language-switcher-content">
                @foreach($languages as $lang)
                <div class="tab-pane fade {{ $loop->first ? 'show active' : '' }}" id="why-{{ $lang->code }}">
                    <div class="row g-4">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Title</label>
                            <input type="text" name="translations[{{ $lang->code }}][title]" class="form-control" value="{{ old("translations.{$lang->code}.title", $whyChooseSection->translations[$lang->code]['title'] ?? '') }}">
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold">Description</label>
                            <textarea name="translations[{{ $lang->code }}][description]" class="form-control" rows="3">{{ old("translations.{$lang->code}.description", $whyChooseSection->translations[$lang->code]['description'] ?? '') }}</textarea>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Home Page Title</label>
                            <input type="text" name="translations[{{ $lang->code }}][home_title]" class="form-control" value="{{ old("translations.{$lang->code}.home_title", $whyChooseSection->translations[$lang->code]['home_title'] ?? '') }}">
                            <small class="text-muted d-block mt-1">Frontend supports <code>&lt;br&gt;</code> for manual line breaks.</small>
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold">Home Page Description</label>
                            <textarea name="translations[{{ $lang->code }}][home_description]" class="form-control" rows="3">{{ old("translations.{$lang->code}.home_description", $whyChooseSection->translations[$lang->code]['home_description'] ?? '') }}</textarea>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <div class="mt-4 pt-4 border-top d-flex justify-content-between align-items-center">
                <div class="d-flex flex-column gap-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="status" id="whySectionStatus" value="1" {{ old('status', $whyChooseSection->status) ? 'checked' : '' }}>
                        <label class="form-check-label fw-bold" for="whySectionStatus">Show section</label>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="display_home" id="whySectionDisplayHome" value="1" {{ old('display_home', data_get($whyChooseSection->extra_fields, 'display_home', false)) ? 'checked' : '' }}>
                        <label class="form-check-label fw-bold" for="whySectionDisplayHome">Display on Home</label>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary px-4">Save Why Choose Us</button>
            </div>
        </form>
    </div>
</div>

<div class="card border-0 shadow-sm">
    <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 class="mb-0">Why Choose Us Items</h5>
        @if($canAddItem)
            <a href="{{ route('cms.about-us.items.create') }}" class="btn btn-primary btn-sm"><i class="fas fa-plus me-1"></i>Add Item</a>
        @else
            <span class="badge bg-warning text-dark">Maximum 6 items allowed.</span>
        @endif
    </div>
    <div class="card-body p-4">
        <div class="table-responsive">
            <table class="table premium-table mb-0 w-100" id="whyChooseItemsTable">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Icon</th>
                        <th>Line 1</th>
                        <th>Line 2</th>
                        <th>Order</th>
                        <th class="text-center">Status</th>
                        <th class="text-end">Actions</th>
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
    $(function () {
        const table = $('#whyChooseItemsTable').DataTable({
            processing: true,
            serverSide: true,
            ajax: "{{ route('cms.about-us.why-choose.index') }}",
            columns: [
                {data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false},
                {data: 'icon_preview', name: 'icon_preview', orderable: false, searchable: false},
                {data: 'line_1_text', name: 'line_1_text'},
                {data: 'line_2_text', name: 'line_2_text'},
                {data: 'order', name: 'order', orderable: false, searchable: false},
                {data: 'status', name: 'status', orderable: false, searchable: false, className: 'text-center'},
                {data: 'action', name: 'action', orderable: false, searchable: false, className: 'text-end'},
            ],
            order: [[0, 'asc']],
        });

        $(document).on('change', '.toggle-status', function () {
            const id = $(this).data('id');
            $.post(`{{ url(config('cms-kit.common.auth.prefix', 'admin')) }}/about-us/items/${id}/toggle-status`, {
                _token: '{{ csrf_token() }}'
            }).fail(() => table.ajax.reload(null, false));
        });

        $(document).on('change', '.reorder-input', function () {
            $.post("{{ route('cms.about-us.items.reorder') }}", {
                id: $(this).data('id'),
                sort_order: $(this).val(),
                _token: '{{ csrf_token() }}'
            }, function () {
                table.ajax.reload(null, false);
            });
        });

        $(document).on('click', '.delete-item', function () {
            if (!confirm('Delete this item?')) return;

            const id = $(this).data('id');
            $.ajax({
                url: `{{ url(config('cms-kit.common.auth.prefix', 'admin')) }}/about-us/items/${id}`,
                type: 'DELETE',
                data: { _token: '{{ csrf_token() }}' },
                success: function () {
                    table.ajax.reload(null, false);
                }
            });
        });
    });
</script>
@endpush
