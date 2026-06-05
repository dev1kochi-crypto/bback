@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.order-process.index') }}">Order Process</a></li>
    <li class="breadcrumb-item active" aria-current="page">Add Item</li>
@endsection

@section('content')
@include('cms-kit::order-process.form', [
    'title' => 'Add Order Process Item',
    'action' => route('cms.order-process.items.store'),
    'method' => 'POST',
    'item' => null,
    'submitLabel' => 'Save Item',
])
@endsection
