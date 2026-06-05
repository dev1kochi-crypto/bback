@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.menus.items.index') }}">Menu Items</a></li>
    <li class="breadcrumb-item active" aria-current="page">Add Item</li>
@endsection

@section('content')
@include('cms-kit::menus.items.form', [
    'item' => null,
    'action' => route('cms.menus.items.store'),
    'method' => 'POST',
    'title' => 'Add Menu Item',
    'submitLabel' => 'Save Item',
])
@endsection
