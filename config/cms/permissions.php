<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Roles and Permissions
    |--------------------------------------------------------------------------
    |
    | This configuration defines the default roles and their module-level
    | permissions. The seeder uses this to populate the database.
    |
    */

    'roles' => [
        'superadmin' => [
            'name' => 'Super Admin',
            'permissions' => '*' // Special flag for all permissions
        ],
        'client' => [
            'name' => 'Client',
            'permissions' => [
                'testimonials.view',
                'testimonials.edit',
                'about-us.view',
                'about-us.edit',
                'menus.view',
                'menus.create',
                'menus.edit',
                'menus.delete',
                'signature-items.view',
                'signature-items.create',
                'signature-items.edit',
                'signature-items.delete',
                'order-process.view',
                'order-process.create',
                'order-process.edit',
                'order-process.delete',
                'offers.view',
                'offers.create',
                'offers.edit',
                'offers.delete',
                'coupons.view',
                'coupons.create',
                'coupons.edit',
                'coupons.delete',
                'delivery-tax.view',
                'delivery-tax.edit',
                'customer-orders.view',
                'customer-orders.edit',
                'site-information.view',
                'site-information.edit',
                'languages.view',
                'metadata.view',
                'faqs.view',
                'faqs.edit',
                'enquiries.view',
                'enquiries.edit',
                'careers.view',
            ]
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
        'extra_fields' => [
            'subject' => ['label' => 'Subject', 'type' => 'text'],
            'interested_in' => ['label' => 'Interested In', 'type' => 'text'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Users
    |--------------------------------------------------------------------------
    |
    | Seed these users automatically. 
    |
    */
    'users' => [
        [
            'name'     => 'Super Admin',
            'email'    => 'admin@example.com',
            'password' => 'password',
            'role'     => 'superadmin',
        ],
        [
            'name'     => 'Client User',
            'email'    => 'client@example.com',
            'password' => 'password',
            'role'     => 'client',
        ],
    ],

    'defaults' => [
        'view',
        'edit',
        'create',
        'delete'
    ]
];
