@extends('cms-kit::layouts.cms')

@section('breadcrumbs')
    <li class="breadcrumb-item active" aria-current="page">About Us</li>
@endsection

@section('content')
@php $showLanguageUi = config('cms-kit.common.modules.languages', true); @endphp

<div class="card mb-4 border-0 shadow-sm">
    <div class="card-header bg-white py-3">
        <h5 class="mb-0">About Us Content</h5>
    </div>
    <div class="card-body p-4">
        <form action="{{ route('cms.about-us.update') }}" method="POST" enctype="multipart/form-data" id="aboutUsForm">
            @csrf

            @if ($errors->any())
                <div class="alert alert-danger">
                    <ul class="mb-0">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            @if($showLanguageUi)
            <ul class="nav nav-pills mb-4 bg-light p-2 rounded-4 language-switcher-tabs" role="tablist">
                @foreach($languages as $lang)
                <li class="nav-item" role="presentation">
                    <button class="nav-link {{ $loop->first ? 'active' : '' }} px-4 py-2 fw-medium" data-bs-toggle="tab" data-bs-target="#about-{{ $lang->code }}" type="button">
                        <i class="fas fa-language me-2 opacity-75"></i>{{ $lang->name }}
                    </button>
                </li>
                @endforeach
            </ul>
            @endif

            <div class="tab-content mb-4 language-switcher-content">
                @foreach($languages as $lang)
                <div class="tab-pane fade {{ $loop->first ? 'show active' : '' }}" id="about-{{ $lang->code }}">
                    <div class="row g-4">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Line 1</label>
                            <input type="text" name="translations[{{ $lang->code }}][line_1]" class="form-control" value="{{ old("translations.{$lang->code}.line_1", $aboutUs->translations[$lang->code]['line_1'] ?? $aboutUs->line_1) }}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Line 2</label>
                            <input type="text" name="translations[{{ $lang->code }}][line_2]" class="form-control" value="{{ old("translations.{$lang->code}.line_2", $aboutUs->translations[$lang->code]['line_2'] ?? $aboutUs->line_2) }}">
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold">About Page Title</label>
                            <input type="text" name="translations[{{ $lang->code }}][about_page_title]" class="form-control" value="{{ old("translations.{$lang->code}.about_page_title", $aboutUs->translations[$lang->code]['about_page_title'] ?? $aboutUs->about_page_title) }}">
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold">Short Description</label>
                            <textarea name="translations[{{ $lang->code }}][short_description]" class="form-control" rows="3">{{ old("translations.{$lang->code}.short_description", $aboutUs->translations[$lang->code]['short_description'] ?? $aboutUs->short_description) }}</textarea>
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold">Long Description</label>
                            <textarea name="translations[{{ $lang->code }}][long_description]" class="form-control tinymce-editor" rows="8">{{ old("translations.{$lang->code}.long_description", $aboutUs->translations[$lang->code]['long_description'] ?? $aboutUs->long_description) }}</textarea>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Button Text</label>
                            <input type="text" name="translations[{{ $lang->code }}][button_text]" class="form-control" value="{{ old("translations.{$lang->code}.button_text", $aboutUs->translations[$lang->code]['button_text'] ?? $aboutUs->button_text) }}">
                        </div>
                        @if($loop->first)
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Button URL</label>
                            <input type="text" name="button_url" class="form-control" value="{{ old('button_url', $aboutUs->button_url) }}">
                        </div>
                        @endif
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Mission</label>
                            <textarea name="translations[{{ $lang->code }}][mission]" class="form-control" rows="3">{{ old("translations.{$lang->code}.mission", $aboutUs->translations[$lang->code]['mission'] ?? $aboutUs->mission) }}</textarea>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Vision</label>
                            <textarea name="translations[{{ $lang->code }}][vision]" class="form-control" rows="3">{{ old("translations.{$lang->code}.vision", $aboutUs->translations[$lang->code]['vision'] ?? $aboutUs->vision) }}</textarea>
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold">Core Value</label>
                            <textarea name="translations[{{ $lang->code }}][core_value]" class="form-control" rows="3">{{ old("translations.{$lang->code}.core_value", $aboutUs->translations[$lang->code]['core_value'] ?? $aboutUs->core_value) }}</textarea>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <div class="row g-4">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Video Type</label>
                    <select name="video_type" id="videoType" class="form-select">
                        <option value="url" {{ old('video_type', $aboutUs->video_type) === 'url' ? 'selected' : '' }}>URL</option>
                        <option value="upload" {{ old('video_type', $aboutUs->video_type) === 'upload' ? 'selected' : '' }}>Upload File</option>
                    </select>
                </div>
                <div class="col-md-6 video-url-field">
                    <label class="form-label fw-bold">Video URL</label>
                    <input type="text" name="video_url" class="form-control" value="{{ old('video_url', $aboutUs->video_url) }}">
                </div>
                <div class="col-md-6 video-upload-field">
                    <label class="form-label fw-bold">Video Upload</label>
                    @if($aboutUs->video_file)
                        <div class="mb-2 small text-muted">Current: {{ basename($aboutUs->video_file) }}</div>
                        <div class="form-check mb-2">
                            <input type="checkbox" class="form-check-input" name="remove_video_file" id="remove_video_file" value="1">
                            <label for="remove_video_file" class="form-check-label">Remove current video</label>
                        </div>
                    @endif
                    <input type="file" name="video_file" class="form-control">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Video Thumbnail</label>
                    @if($aboutUs->video_thumbnail)
                        <div class="mb-2">
                            <img src="{{ asset('storage/' . $aboutUs->video_thumbnail) }}" alt="Video thumbnail" class="img-thumbnail" style="max-width: 220px;">
                        </div>
                        <div class="form-check mb-2">
                            <input type="checkbox" class="form-check-input" name="remove_video_thumbnail" id="remove_video_thumbnail" value="1">
                            <label for="remove_video_thumbnail" class="form-check-label">Remove current thumbnail</label>
                        </div>
                    @endif
                    <input
                        type="file"
                        name="video_thumbnail"
                        class="form-control"
                        accept="{{ config('cms-kit.images.about-us.video_thumbnail.accept', '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp') }}"
                    >
                    <div class="form-text">Recommended size: {{ config('cms-kit.images.about-us.video_thumbnail.width', 1480) }} x {{ config('cms-kit.images.about-us.video_thumbnail.height', 881) }}px.</div>
                </div>
                <div class="col-md-6 d-flex align-items-end">
                    <div class="d-flex flex-column gap-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" name="is_active" id="aboutStatus" value="1" {{ old('is_active', $aboutUs->is_active) ? 'checked' : '' }}>
                            <label class="form-check-label fw-bold" for="aboutStatus">Status (Active)</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" name="display_home" id="aboutDisplayHome" value="1" {{ old('display_home', data_get($aboutUs->extra_fields, 'display_home', false)) ? 'checked' : '' }}>
                            <label class="form-check-label fw-bold" for="aboutDisplayHome">Display on Home Page</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 border-top pt-4">
                <button type="submit" class="btn btn-primary px-4" id="aboutUsSubmitBtn">Save About Us</button>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
<script>
    tinymce.init({
        selector: '.tinymce-editor',
        height: 320,
        plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
        toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
    });

    document.addEventListener('DOMContentLoaded', function () {
        const aboutUsForm = document.getElementById('aboutUsForm');
        const submitButton = document.getElementById('aboutUsSubmitBtn');
        const videoType = document.getElementById('videoType');
        const urlField = document.querySelector('.video-url-field');
        const uploadField = document.querySelector('.video-upload-field');

        if (aboutUsForm && submitButton) {
            aboutUsForm.addEventListener('submit', function () {
                submitButton.dataset.originalText = submitButton.textContent.trim();
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait...';
            });
        }

        if (!videoType || !urlField || !uploadField) {
            return;
        }

        const toggleVideoFields = () => {
            const useUrl = videoType.value === 'url';
            urlField.style.display = useUrl ? '' : 'none';
            uploadField.style.display = useUrl ? 'none' : '';
        };

        toggleVideoFields();
        videoType.addEventListener('change', toggleVideoFields);
    });
</script>
@endpush
