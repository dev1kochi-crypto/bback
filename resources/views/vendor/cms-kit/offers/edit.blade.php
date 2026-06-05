@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item"><a href="{{ route('cms.offers.index') }}">Offers</a></li>
    <li class="breadcrumb-item active" aria-current="page">Edit Offer</li>
@endsection

@section('content')
@include('cms-kit::offers.form', [
    'offer' => $offer,
    'action' => route('cms.offers.update', $offer->id),
    'method' => 'PUT',
    'title' => 'Edit Offer',
    'submitLabel' => 'Update Offer',
])
@endsection
