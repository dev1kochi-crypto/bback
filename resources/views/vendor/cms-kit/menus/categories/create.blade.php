@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.menus.categories.index') }}">Categories</a></li>
    <li class="breadcrumb-item active" aria-current="page">Add Category</li>
@endsection

@section('content')
@include('cms-kit::menus.categories.form', [
    'category' => null,
    'action' => route('cms.menus.categories.store'),
    'method' => 'POST',
    'title' => 'Add Menu Category',
    'submitLabel' => 'Save Category',
])
@endsection
