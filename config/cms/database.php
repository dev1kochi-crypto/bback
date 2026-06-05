<?php

/**
 * CMS KIT DATABASE CONFIGURATION
 *
 * Extra-field field reference moved to:
 *   docs/extra-fields.md
 *
 * Add/modify banner extra fields in:
 *   config/cms/database.php -> banners.items.extra_fields
 */
return [
    'languages' => [
        'items' => [
            'flag' => true,
            'flag_alt' => true,
            'required' => [],
        ],
    ],
    'enquiries' => [
        'columns' => [
            'name' => true,
            'email' => true,
            'phone' => true,
            'company' => true,
            'country' => true,
            'page_source' => true,
            'page_url' => true,
            'message' => true,
            'subject' => true,
            'created_at' => true,
        ],
       
    ],
    'testimonials' => [
        'section' => [
            'title' => true,
            'sub_heading_1' => true,
            'sub_heading_2' => false,
            'section_image' => false,
            'section_image_alt' => false,
            'banner' => false,
            'banner_alt' => false,
            'description' => true,
            'display_home' => true,
            'extra_fields' => [],
            'required' => ['title'], // Section fields that are mandatory
        ],
        'items' => [
            'name' => true,
            'designation' => true,
            'content' => true,
            'rating' => false,
            'order' => true,
            'status' => true,
            'image' => true,
            'image_alt' => true,
            'extra_fields' => [],
            'required' => ['name', 'content'], // Fields that are mandatory
        ],
    ],
    'banners' => [
        'max_items' => 4, // Dynamic limit for banners
        'allowed_types' => ['image'], // Available banner types
        'items' => [
            'banner_type' => true, // New: image, video toggle
            'line_1' => true,
            'line_2' => true,
            'content' => true,
            'image' => true,
            'video_url' => false, // New: for video banners
            'video_file' => false, // New: for video file uploads
            'image_alt' => true,
            'buttons' => true, // New: JSON array of buttons
            'additional_buttons'=> false, // New: toggle for additional buttons
            'google_review_text' => false, // New
            'google_rating' => false, // New
            'google_review_count' => false, // New
            'google_avatars' => false, // New: for the avatars in screenshot
            'google_avatars_alt' => false, // New: alt text for avatars
            'order' => true,
            'status' => true,
            'extra_fields' => [],
            'required' => ['line_1'], // Mandatory fields
        ],
    ],
    'about-us' => [
        'singleton' => [
            'line_1' => true,
            'line_2' => true,
            'about_page_title' => true,
            'short_description' => true,
            'long_description' => true,
            'button_text' => true,
            'button_url' => true,
            'video_type' => true,
            'video_url' => true,
            'video_file' => true,
            'mission' => true,
            'vision' => true,
            'core_value' => true,
            'status' => true,
        ],
        'why_choose_us' => [
            'max_items' => 6,
            'section' => [
                'title' => true,
                'description' => true,
                'home_title' => true,
                'home_description' => true,
                'display_home' => true,
                'status' => true,
            ],
            'items' => [
                'icon' => true,
                'icon_alt' => true,
                'line_1' => true,
                'line_2' => true,
                'sort_order' => true,
                'status' => true,
                'required' => [],
            ],
        ],
    ],
    'menus' => [
        'section' => [
            'line_1' => true,
            'line_2' => true,
            'short_description' => true,
            'button_text' => true,
            'button_url' => true,
            'listing_title' => true,
            'listing_description' => true,
            'display_home' => true,
            'status' => true,
        ],
        'categories' => [
            'icon' => true,
            'icon_alt' => true,
            'name' => true,
            'sort_order' => true,
            'status' => true,
            'required' => ['name'],
        ],
        'items' => [
            'image' => true,
            'image_alt' => true,
            'name' => true,
            'category' => true,
            'description' => true,
            'spicy' => true,
            'food_type' => true,
            'price' => true,
            'sort_order' => true,
            'status' => true,
            'required' => ['name', 'price'],
        ],
        'signature_items' => [
            'max_items' => 4,
        ],
    ],
    'order-process' => [
        'max_items' => 3,
        'section' => [
            'line_1' => true,
            'title' => true,
            'description' => true,
            'image' => true,
            'image_alt' => true,
            'display_home' => true,
            'status' => true,
        ],
    ],
    'offers' => [
        'items' => [
            'image' => true,
            'alt_text' => true,
            'sort_order' => true,
            'status' => true,
            'required' => ['image'],
        ],
    ],
    'metadata' => [
        'required' => ['meta_title', 'meta_description'], // SEO fields that are mandatory
    ],
    'site-information' => [
        'company_name' => true,
        'address' => true,
        'country' => true,
        'po_box' => false,
        'fax' => false,
        'phone_1' => true,
        'phone_2' => false,
        'phone_3' => false,
        'phone_4' => false,
        'whatsapp_number' => true,
        'google_map_link' => true,
        'opening_hours' => true,
        'email_1' => true,
        'email_2' => false,
        'email_3' => false,
        'email_4' => false,
        'receipt_email' => true,
        'privacy_policy' => true,
        'terms_and_conditions' => true,
        'disclaimer' => true,
        'logo' => true,
        'logo_alt' => true,
        'footer_logo' => false,
        'footer_logo_alt' => false,
        'footer_description' => false,
        'facebook' => true,
        'twitter' => true,
        'linkedin' => true,
        'instagram' => true,
        'tiktok' => false,
        'snapchat' => false,
        'pinterest' => false,
        'youtube' => true,
        'skype' => false,
        'whatsapp_social' => true,
        'vimeo' => false,
        'gtag' => true,
        'custom_head_script' => true,
        'custom_body_script' => true,
        'extra_fields' => [
            'google_map_link' => [
                'label' => 'Google Map Link',
                'type' => 'url',
                'translatable' => false,
                'placeholder' => 'https://maps.google.com/...',
            ],
            'opening_hours' => [
                'label' => 'Opening Hours',
                'type' => 'textarea',
                'translatable' => true,
                'rows' => 3,
                'placeholder' => "Monday - Friday: 9.00 - 20.00\nSaturday - Sunday: 8.00 - 22.00\nHoliday: 10.00 - 18.00",
            ],
        ],
        'required' => ['company_name', 'address', 'phone_1', 'email_1', 'receipt_email', 'logo', 'favicon'], // Fields that are mandatory
    ],
    'locations' => [
        'section' => [
            'title' => true,
            'description' => true,
            'status' => true,
            'extra_fields' => [],
        ],
        'items' => [
            'title' => true,
            'image' => true,
            'flag' => true,
            'phone' => true,
            'whatsapp' => true,
            'fax' => true,
            'emails' => true,
            'address' => true,
            'country' => true,
            'map_link' => true,
            'order' => true,
            'status' => true,
            'extra_fields' => [],
            'required' => ['title', 'address'],

        ],
    ],
    'brands' => [
        'items' => [
            'image' => true,
            'image_alt' => true,
            'order' => true,
            'status' => true,
            'extra_fields' => [],
            'required' => ['image', 'image_alt'],
        ],
    ],
    'blogs' => [
        'section' => [
            'title' => true,
            'listing_title' => true,
            'description' => true,
            'banner' => true,
            'banner_alt' => true,
            'status' => true,
            'display_home' => true,
            'extra_fields' => [],
            'required' => ['title'],
        ],
        'items' => [
            'title' => true,
            'slug' => true,
            'content' => true,
            'published_at' => true,
            'feature_image' => true,
            'feature_image_alt' => true,
            'detail_image' => true,
            'detail_image_alt' => true,
            'banner_image' => true,
            'banner_alt' => true,
            'image_3' => true,
            'image_3_alt' => true,
            'image_4' => true,
            'image_4_alt' => true,
            'order' => true,
            'status' => true,
            'extra_fields' => [],
            'required' => ['title', 'content', 'published_at', 'feature_image', 'feature_image_alt'],
        ],
    ],
    'careers' => [
        'section' => [
            'title' => true,
            'description' => true,
            'banner' => true,
            'banner_alt' => true,
            'filter_enabled' => true,
            'filters' => true,
            'filterable_columns' => ['job_type', 'department', 'location', 'country', 'base'],
            'extra_fields' => [],
            'required' => ['title'],
        ],
        'items' => [
            'columns' => [
                'title' => true,
                'job_type' => true,
                'department' => true,
                'location' => true,
                'published_date' => true,
                'order' => true,
                'status' => true,
            ],
            'title' => true,
            'slug' => true,
            'short_description' => true,
            'job_type' => true,
            'job_type_options' => [
                'full_time' => [
                    'en' => 'Full Time',
                ],
                'part_time' => [
                    'en' => 'Part Time',
                ],
                'remote' => [
                    'en' => 'Remote',
                ],
            ],
            'department' => true,
            'location' => true,
            'country' => true,
            'base' => true,
            'base_options' => [
                'temporary' => [
                    'en' => 'Temporary',
                ],
                'permanent' => [
                    'en' => 'Permanent',
                ],
                'contract' => [
                    'en' => 'Contract',
                ],
            ],
            'about' => true,
            'responsibilities' => true,
            'requirements' => true,
            'join_the_team' => true,
            'published_date' => true,
            'order' => true,
            'status' => true,
            'extra_fields' => [],
            'required' => ['title', 'job_type', 'department', 'location', 'published_date'],
        ],
        'departments' => [
            'columns' => [
                'title' => true,
                'description' => true,
                'order' => true,
                'status' => true,
            ],
            'title' => true,
            'description' => true,
            'stats' => false,
            'order' => true,
            'status' => true,
            'extra_fields' => [],
            'required' => ['title'],
        ],
        'candidates' => [
            'columns' => [
                'name' => true,
                'email' => true,
                'phone' => true,
                'state' => true,
                'country' => true,
                'apply_for' => true,
                'experience' => true,
                'designation' => true,
                'additional_information' => true,
                'attachment' => true,
                'privacy' => true,
                'submitted_at' => true,
            ],
            'name' => true,
            'email' => true,
            'phone' => true,
            'state' => true,
            'country' => true,
            'apply_for' => true,
            'experience' => true,
            'designation' => true,
            'submitted' => true,
            'additional_information' => true,
            'attachment' => true,
            'privacy' => true,
            'extra_fields' => [],
        ],
    ],
    'faqs' => [
        'section' => [
            'title' => true,
            'description' => true,
            'status' => true,
            'extra_fields' => [],
            'required' => ['title'],
        ],
        'items' => [
            'question' => true,
            'answer' => true,
            'order' => true,
            'status' => true,
            'required' => ['question', 'answer'],
        ],
    ],
];
