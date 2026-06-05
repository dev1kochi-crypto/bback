<?php

return [
    'testimonials' => [
        'item_image' => [
            'max_size' => 512,
            'width' => 465,
            'height' => 592,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
        'section_image' => [
            'max_size' => 1024,
            'width' => 1920,
            'height' => 1080,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
        'banner' => [
            'max_size' => 2048,
            'width' => 1920,
            'height' => 400,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
    ],
    'banners' => [
        'main_image' => [
            'max_size' => 3072,
            'width' => 1400,
            'height' => 900,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
            'help_text' => 'Upload only the food cutout. The dark hero background, pattern, floating garnish images, buttons style, and animation are handled statically in the frontend.',
        ],
        'client_avatar' => [
            'width' => 100,
            'height' => 100,
            'max_size' => 512, // KB
        ],
        'banner_video' => [
            'max_size' => 10240, // 10MB default
        ],
    ],
    'about-us' => [
        'video_file' => [
            'max_size' => 20480,
        ],
        'video_thumbnail' => [
            'max_size' => 3072,
            'width' => 1480,
            'height' => 881,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
        'why_choose_us_icon' => [
            'max_size' => 2048,
            'width' => 256,
            'height' => 256,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp', 'svg'],
            'accept' => '.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml',
        ],
    ],
    'menus' => [
        'category_icon' => [
            'max_size' => 2048,
            'width' => 256,
            'height' => 256,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp', 'svg'],
            'accept' => '.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml',
        ],
        'item_image' => [
            'max_size' => 3072,
            'width' => 1024,
            'height' => 1024,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
        'signature_item_image' => [
            'max_size' => 3072,
            'width' => 520,
            'height' => 760,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
    ],
    'order-process' => [
        'section_image' => [
            'width' => 920,
            'height' => 920,
            'max_size' => 4096,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
        'item_icon' => [
            'width' => 64,
            'height' => 64,
            'max_size' => 2048,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp', 'svg'],
            'accept' => '.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml',
        ],
    ],
    'offers' => [
        'image' => [
            'max_size' => 3072,
            'width' => 1200,
            'height' => 1500,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
    ],
    'locations' => [
        'main_image' => [
            'width' => 851,
            'height' => 521,
            'max_size' => 2048, // Updated to 2MB
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
        'flag' => [
            'width' => 120,
            'height' => 80,
            'max_size' => 512, // Updated
            'mimes' => ['png', 'jpg', 'jpeg', 'webp', 'svg'],
            'accept' => '.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml',
        ],
    ],
    'brands' => [
        'logo' => [
            'width' => 250,
            'height' => 150,
            'max_size' => 1024, // 1MB
            'mimes' => ['png', 'jpg', 'jpeg', 'webp', 'svg'],
            'accept' => '.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml',
        ],
    ],
    'languages' => [
        'flag' => [
            'width' => 64,
            'height' => 48,
            'max_size' => 256,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp', 'svg'],
            'accept' => '.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml',
        ],
    ],
    'site-information' => [
        'logo' => [
            'width' => 2400,
            'height' => 1200,
            'max_size' => 2048,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp', 'svg'],
            'accept' => '.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml',
        ],
        'favicon' => [
            'width' => 64,
            'height' => 64,
            'max_size' => 1024,
            'mimes' => ['ico', 'png', 'jpg', 'jpeg', 'svg'],
            'accept' => '.ico,.png,.jpg,.jpeg,.svg,image/x-icon,image/png,image/jpeg,image/svg+xml',
        ],
        'footer_logo' => [
            'width' => 150,
            'height' => 50,
            'max_size' => 2048,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp', 'svg'],
            'accept' => '.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml',
        ],
    ],
    'blogs' => [
        'feature_image' => [
            'width' => 370,
            'height' => 450,
            'max_size' => 512,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
        'detail_image' => [
            'width' => 840,
            'height' => 450,
            'max_size' => 1024,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
        'banner_image' => [
            'width' => 1241,
            'height' => 400,
            'max_size' => 1024,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
        'image_3' => [
            'width' => 410,
            'height' => 324,
            'max_size' => 512,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
        'image_4' => [
            'width' => 410,
            'height' => 324,
            'max_size' => 512,
            'mimes' => ['png', 'jpg', 'jpeg', 'webp'],
            'accept' => '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp',
        ],
    ],
];
