@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.menus.categories.index') }}">Categories</a></li>
    <li class="breadcrumb-item active" aria-current="page">Edit Category</li>
@endsection

@section('content')
@include('cms-kit::menus.categories.form', [
    'category' => $category,
    'action' => route('cms.menus.categories.update', $category->id),
    'method' => 'PUT',
    'title' => 'Edit Menu Category',
    'submitLabel' => 'Update Category',
])
@endsection
