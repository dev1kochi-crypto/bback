@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item active" aria-current="page">Offers</li>
@endsection

@section('content')
<div class="card">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Offers</h5>
        <a href="{{ route('cms.offers.create') }}" class="btn btn-primary btn-sm"><i class="fas fa-plus me-1"></i>Add Offer</a>
    </div>
    <div class="card-body p-4">
        <div class="table-responsive">
            <table class="table premium-table mb-0 w-100" id="offersTable">
                <thead>
                    <tr>
                        <th style="width:50px;">#</th>
                        <th style="width:120px;">Image</th>
                        <th>Menu Item</th>
                        <th style="width:110px;">Offer %</th>
                        <th style="width:120px;">Offer Price</th>
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
    const table = $('#offersTable').DataTable({
        processing: true,
        serverSide: true,
        ajax: "{{ route('cms.offers.index') }}",
        columns: [
            {data: 'DT_RowIndex', orderable: false, searchable: false},
            {data: 'image_preview', orderable: false, searchable: false},
            {data: 'menu_item_text', orderable: false},
            {data: 'offer_percent_text', name: 'offer_percent'},
            {data: 'offer_price_text', name: 'offer_price'},
            {data: 'alt_text_value', name: 'alt_text'},
            {data: 'order', orderable: false, searchable: false},
            {data: 'status', orderable: false, searchable: false, className: 'text-center'},
            {data: 'action', orderable: false, searchable: false, className: 'text-end pe-4'}
        ]
    });

    $(document).on('change', '.toggle-status', function() {
        $.post("{{ url(config('cms-kit.common.auth.prefix', 'admin')) }}/offers/" + $(this).data('id') + "/toggle-status", {_token: "{{ csrf_token() }}"}).fail(() => table.ajax.reload(null, false));
    });
    $(document).on('change', '.reorder-input', function() {
        $.post("{{ route('cms.offers.reorder') }}", {id: $(this).data('id'), sort_order: $(this).val(), _token: "{{ csrf_token() }}"}, () => table.ajax.reload(null, false));
    });
    $(document).on('click', '.delete-item', function() {
        if (!confirm('Delete this offer?')) return;
        $.ajax({url: "{{ url(config('cms-kit.common.auth.prefix', 'admin')) }}/offers/" + $(this).data('id'), type: 'DELETE', data: {_token: "{{ csrf_token() }}"}, success: () => table.ajax.reload(null, false)});
    });
});
</script>
@endpush
