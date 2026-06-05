@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.menus.signature-items.index') }}">Signature Items</a></li>
    <li class="breadcrumb-item active" aria-current="page">Add Signature Item</li>
@endsection

@section('content')
@include('cms-kit::menus.signature-items.form', [
    'title' => 'Add Signature Item',
    'action' => route('cms.menus.signature-items.store'),
    'method' => 'POST',
    'item' => null,
    'submitLabel' => 'Save Item',
])
@endsection
