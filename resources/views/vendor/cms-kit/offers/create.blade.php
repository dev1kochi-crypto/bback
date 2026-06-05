@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.offers.index') }}">Offers</a></li>
    <li class="breadcrumb-item active" aria-current="page">Add Offer</li>
@endsection

@section('content')
@include('cms-kit::offers.form', [
    'offer' => null,
    'action' => route('cms.offers.store'),
    'method' => 'POST',
    'title' => 'Add Offer',
    'submitLabel' => 'Save Offer',
])
@endsection
