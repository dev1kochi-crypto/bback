@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.order-process.index') }}">Order Process</a></li>
    <li class="breadcrumb-item active" aria-current="page">Edit Item</li>
@endsection

@section('content')
@include('cms-kit::order-process.form', [
    'title' => 'Edit Order Process Item',
    'action' => route('cms.order-process.items.update', $item->id),
    'method' => 'PUT',
    'item' => $item,
    'submitLabel' => 'Update Item',
])
@endsection
