@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.menus.items.index') }}">Menu Items</a></li>
    <li class="breadcrumb-item active" aria-current="page">Edit Item</li>
@endsection

@section('content')
@include('cms-kit::menus.items.form', [
    'item' => $item,
    'action' => route('cms.menus.items.update', $item->id),
    'method' => 'PUT',
    'title' => 'Edit Menu Item',
    'submitLabel' => 'Update Item',
])
@endsection
