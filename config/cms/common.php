<?php

return [
    'name' => 'B.back',
    'theme' => [
        /*
         * Theme colors are inspired by the B.black restaurant frontend:
         * charcoal surfaces, flame-orange actions, and warm cream text.
         * Update these values here to re-theme the admin CMS.
         */
        'primary_color' => '#FF7A00',
        'primary_gradient' => 'linear-gradient(135deg, #FF8A00 0%, #FF5A00 100%)',
        'secondary_color' => '#F5D5A0',
        'background_color' => '#090D0E',
        'sidebar_color' => '#050708',
        'surface_color' => '#111719',
        'surface_alt_color' => '#172022',
        'text_color' => '#F7EFE3',
        'muted_text_color' => '#A99D8F',
        'border_color' => '#2D241B',
        'success_color' => '#8DC63F',
        'danger_color' => '#FF4D3D',
        'warning_color' => '#FFC857',
        'info_color' => '#F5D5A0',
    ],


    'auth' => [
        'admin_name' => env('CMS_ADMIN_NAME', 'Admin User'),
        'admin_email' => env('CMS_ADMIN_EMAIL', 'admin@example.com'),
        'prefix' => 'admin',
        'middleware' => ['web'],
    ],

    'modules' => [
        'testimonials' => true,
        'languages' => false,
        'metadata' => true,
        'site-information' => true,
        'sitemap' => true,
        'banners' => true,
        'about-us' => true,
        'menus' => true,
        'signature-items' => true,
        'order-process' => true,
        'offers' => true,
        'coupons' => true,
        'delivery-tax' => true,
        'customer-orders' => true,
        'faqs' => false,
        'enquiries' => true,
        'locations' => false,
        'brands' => false,
        'newsletter-signups' => true,
        'blogs' => false,
        'careers' => false,
    ],

    'careers' => [
        'common_section' => true,
        'vacancies' => true,
        'departments' => true,
        'candidates' => true,
    ],

    'tinymce' => [
        'selector' => '.tinymce-editor',
        'plugins' => 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
        'toolbar' => 'undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
    ],
];
