<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $siteInfo->company_name ?? config('cms-kit.common.name', 'CMS Kit') }} - @yield('title', 'Admin Dashboard')</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @if(!empty($siteInfo->favicon))
    <link rel="icon" type="image/png" href="{{ asset('storage/' . $siteInfo->favicon) }}">
    @endif
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    @php
        $theme = config('cms-kit.common.theme', []);
        $primaryColor = $theme['primary_color'] ?? '#dc3545';
        $primaryGradient = $theme['primary_gradient'] ?? null;
        $primaryFill = $primaryGradient ?: $primaryColor;
        $normalizedPrimary = ltrim($primaryColor, '#');
        if (strlen($normalizedPrimary) === 3) {
            $normalizedPrimary = collect(str_split($normalizedPrimary))->map(fn ($char) => $char . $char)->implode('');
        }
        [$primaryRed, $primaryGreen, $primaryBlue] = sscanf($normalizedPrimary, '%02x%02x%02x') ?: [220, 53, 69];
    @endphp
    <style>
        :root {
            --primary-color: {{ $primaryColor }};
            --primary-gradient: {{ $primaryGradient ?: $primaryColor }};
            --primary-fill: {{ $primaryFill }};
            --heading-gradient: {{ $primaryFill }};
            --theme-success-color: {{ $theme['success_color'] ?? '#8DC63F' }};
            --theme-danger-color: {{ $theme['danger_color'] ?? '#FF4D3D' }};
            --theme-warning-color: {{ $theme['warning_color'] ?? '#FFC857' }};
            --theme-info-color: {{ $theme['info_color'] ?? '#F5D5A0' }};
            --theme-status-success-bg: color-mix(in srgb, var(--theme-success-color) 16%, transparent);
            --theme-status-success-text: var(--theme-success-color);
            --theme-status-danger-bg: color-mix(in srgb, var(--theme-danger-color) 16%, transparent);
            --theme-status-danger-text: var(--theme-danger-color);
            --primary-rgb: {{ $primaryRed }}, {{ $primaryGreen }}, {{ $primaryBlue }};
            --secondary-color: {{ $theme['secondary_color'] ?? '#212529' }};
            --bg-color: {{ $theme['background_color'] ?? '#f4f7f6' }};
            --sidebar-color: {{ $theme['sidebar_color'] ?? '#1a1d21' }};
            --text-color: {{ $theme['text_color'] ?? '#495057' }};
            --muted-text-color: {{ $theme['muted_text_color'] ?? '#6c757d' }};
            --surface-color: {{ $theme['surface_color'] ?? '#ffffff' }};
            --surface-alt-color: {{ $theme['surface_alt_color'] ?? '#f8f9fa' }};
            --theme-border-base: {{ $theme['border_color'] ?? '#dee2e6' }};
            --theme-border-color: color-mix(in srgb, var(--theme-border-base) 82%, var(--primary-color) 18%);
            --theme-border-strong: rgba({{ $primaryRed }}, {{ $primaryGreen }}, {{ $primaryBlue }}, 0.45);
            --theme-soft-bg: rgba({{ $primaryRed }}, {{ $primaryGreen }}, {{ $primaryBlue }}, 0.08);
            --theme-focus-ring: 0 0 0 0.2rem rgba({{ $primaryRed }}, {{ $primaryGreen }}, {{ $primaryBlue }}, 0.15);
            --card-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
            --header-bg: color-mix(in srgb, var(--surface-color) 88%, transparent);
            --sidebar-width: 280px;
        }

        .top-header .breadcrumb,
        .top-header .breadcrumb a,
        .top-header .breadcrumb-item,
        .top-header .breadcrumb-item.active {
            color: rgba(247, 239, 227, 0.72) !important;
        }

        .top-header .breadcrumb a:hover {
            color: var(--primary-color) !important;
        }

        .top-header .breadcrumb-item + .breadcrumb-item::before {
            color: rgba(247, 239, 227, 0.42) !important;
        }
    </style>
    <link rel="stylesheet" href="{{ asset('vendor/cms-kit/css/cms-premium.css') }}">
    <link rel="stylesheet" href="{{ asset('vendor/cms-kit/css/sitemap.css') }}">
    <link rel="stylesheet" href="{{ asset('vendor/cms-kit/css/cms-modules.css') }}">
    <script src="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js" referrerpolicy="origin"></script>

    {{-- TinyMCE initialized in specific views --}}
    @stack('styles')
</head>
<body>
    <div class="min-vh-100">
        <!-- Sidebar -->
        <div class="sidebar d-none d-md-block">
            <div class="brand">
                <h4 class="fw-bold mb-0 text-white">{{ $siteInfo->company_name ?? config('cms-kit.common.name', 'CMS Kit') }}</h4>
                <small class="text-white-50">Control Panel</small>
            </div>
            
            <div class="mt-4">
                <nav class="nav flex-column">
                    <a class="nav-link @if(Route::is('cms.dashboard')) active @endif" href="{{ route('cms.dashboard') }}">
                        <i class="fas fa-th-large"></i> Dashboard
                    </a>
                    {{-- Site Settings Group --}}
                    @if((config('cms-kit.common.modules.languages', true) && $cmsUser->can('languages.view')) || $cmsUser->can('site-information.view'))
                        <div class="nav-item sidebar-group">
                            <a class="nav-link d-flex align-items-center sidebar-group-toggle @if(request()->routeIs('cms.languages.*') || request()->routeIs('cms.site-information.*')) active @endif" 
                            data-bs-toggle="collapse" href="#settingsMenu" role="button" 
                            aria-expanded="@if(request()->routeIs('cms.languages.*') || request()->routeIs('cms.site-information.*')) true @else false @endif">
                                <i class="fas fa-cog"></i>
                                <span>General Settings</span>
                                <i class="fas fa-chevron-down ms-auto sidebar-chevron"></i>
                            </a>
                            <div class="collapse sidebar-submenu @if(request()->routeIs('cms.languages.*') || request()->routeIs('cms.site-information.*')) show @endif" id="settingsMenu">
                                <nav class="nav flex-column">
                                    @if(config('cms-kit.common.modules.languages', true) && $cmsUser->can('languages.view'))
                                    <a class="nav-link py-2 @if(request()->routeIs('cms.languages.index') || request()->routeIs('cms.languages.static-texts.*') || request()->routeIs('cms.languages.translations*')) active @endif" href="{{ route('cms.languages.index') }}">
                                        Languages
                                    </a>
                                    @endif
                                    @if($cmsUser->can('site-information.view'))
                                    <a class="nav-link py-2 @if(request()->routeIs('cms.site-information.*')) active @endif" href="{{ route('cms.site-information.index') }}">
                                        Site Information
                                    </a>
                                    @endif
                                </nav>
                            </div>
                        </div>
                    @endif

                    {{-- SEO Group --}}
                    @if((config('cms-kit.common.modules.metadata', true) && $cmsUser->can('metadata.view')) || $cmsUser->can('sitemap.view') || $cmsUser->can('robots-txt.view') || $cmsUser->can('llms-txt.view') || $cmsUser->can('url-redirects.view') || $cmsUser->can('url-miss-logs.view'))
                    <div class="nav-item sidebar-group">
                        <a class="nav-link d-flex align-items-center sidebar-group-toggle @if(request()->routeIs('cms.metadata.*') || request()->routeIs('cms.sitemap.*') || request()->routeIs('cms.robots-txt.*') || request()->routeIs('cms.llms-txt.*') || request()->routeIs('cms.url-redirects.*') || request()->routeIs('cms.url-miss-logs.*')) active @endif" 
                           data-bs-toggle="collapse" href="#seoMenu" role="button" 
                           aria-expanded="@if(request()->routeIs('cms.metadata.*') || request()->routeIs('cms.sitemap.*') || request()->routeIs('cms.robots-txt.*') || request()->routeIs('cms.llms-txt.*') || request()->routeIs('cms.url-redirects.*') || request()->routeIs('cms.url-miss-logs.*')) true @else false @endif">
                            <i class="fas fa-search"></i>
                            <span>SEO Management</span>
                            <i class="fas fa-chevron-down ms-auto sidebar-chevron"></i>
                        </a>
                        <div class="collapse sidebar-submenu @if(request()->routeIs('cms.metadata.*') || request()->routeIs('cms.sitemap.*') || request()->routeIs('cms.robots-txt.*') || request()->routeIs('cms.llms-txt.*') || request()->routeIs('cms.url-redirects.*') || request()->routeIs('cms.url-miss-logs.*')) show @endif" id="seoMenu">
                            <nav class="nav flex-column">
                                @if(config('cms-kit.common.modules.metadata', true) && $cmsUser->can('metadata.view'))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.metadata.*')) active @endif" href="{{ route('cms.metadata.index') }}">
                                    Metadata
                                </a>
                                @endif
                                @if($cmsUser->can('sitemap.view'))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.sitemap.*')) active @endif" href="{{ route('cms.sitemap.index') }}">
                                    Sitemap Generator
                                </a>
                                @endif
                                @if($cmsUser->can('robots-txt.view'))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.robots-txt.*')) active @endif" href="{{ route('cms.robots-txt.index') }}">
                                    Robots.txt Editor
                                </a>
                                @endif
                                @if($cmsUser->can('llms-txt.view'))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.llms-txt.*')) active @endif" href="{{ route('cms.llms-txt.index') }}">
                                    LLMs.txt Generator
                                </a>
                                @endif
                                @if($cmsUser->can('url-redirects.view'))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.url-redirects.*')) active @endif" href="{{ route('cms.url-redirects.index') }}">
                                    URL redirects
                                </a>
                                @endif
                                @if($cmsUser->can('url-miss-logs.view'))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.url-miss-logs.*')) active @endif" href="{{ route('cms.url-miss-logs.index') }}">
                                    404 log
                                </a>
                                @endif
                            </nav>
                        </div>
                    </div>
                    @endif
                    
                    {{-- Home Group --}}
                    @if(config('cms-kit.common.modules.banners', true) && $cmsUser->can('banners.view'))
                    <div class="nav-item sidebar-group">
                        <a class="nav-link d-flex align-items-center sidebar-group-toggle @if(request()->routeIs('cms.banners.*')) active @endif" 
                           data-bs-toggle="collapse" href="#homeMenu" role="button" 
                           aria-expanded="@if(request()->routeIs('cms.banners.*')) true @else false @endif">
                            <i class="fas fa-home"></i>
                            <span>Home</span>
                            <i class="fas fa-chevron-down ms-auto sidebar-chevron"></i>
                        </a>
                        <div class="collapse sidebar-submenu @if(request()->routeIs('cms.banners.*')) show @endif" id="homeMenu">
                            <nav class="nav flex-column">
                                <a class="nav-link py-2 @if(request()->routeIs('cms.banners.*')) active @endif" href="{{ route('cms.banners.index') }}">
                                    Banner
                                </a>
                            </nav>
                        </div>
                    </div>
                    @endif
                    
                    @if(config('cms-kit.common.modules.testimonials', true) && $cmsUser->can('testimonials.view'))
                    <a class="nav-link @if(Route::is('cms.testimonials.*')) active @endif" href="{{ route('cms.testimonials.index') }}">
                        <i class="fas fa-comment-dots"></i> Testimonials
                    </a>
                    @endif

                    @if(config('cms-kit.common.modules.about-us', true) && $cmsUser->can('about-us.view'))
                    <div class="nav-item sidebar-group">
                        <a class="nav-link d-flex align-items-center sidebar-group-toggle @if(request()->routeIs('cms.about-us.*')) active @endif" 
                           data-bs-toggle="collapse" href="#aboutUsMenu" role="button" 
                           aria-expanded="@if(request()->routeIs('cms.about-us.*')) true @else false @endif">
                            <i class="fas fa-address-card"></i>
                            <span>About Us</span>
                            <i class="fas fa-chevron-down ms-auto sidebar-chevron"></i>
                        </a>
                        <div class="collapse sidebar-submenu @if(request()->routeIs('cms.about-us.*')) show @endif" id="aboutUsMenu">
                            <nav class="nav flex-column">
                                <a class="nav-link py-2 @if(request()->routeIs('cms.about-us.index')) active @endif" href="{{ route('cms.about-us.index') }}">
                                    About Content
                                </a>
                                <a class="nav-link py-2 @if(request()->routeIs('cms.about-us.why-choose.index') || request()->routeIs('cms.about-us.items.*')) active @endif" href="{{ route('cms.about-us.why-choose.index') }}">
                                    Why Choose Us
                                </a>
                            </nav>
                        </div>
                    </div>
                    @endif

                    @php
                        $isMenusRoute = request()->routeIs('cms.menus.*') && !request()->routeIs('cms.menus.signature-items.*');
                    @endphp
                    @if(config('cms-kit.common.modules.menus', true) && $cmsUser->can('menus.view'))
                    <div class="nav-item sidebar-group">
                        <a class="nav-link d-flex align-items-center sidebar-group-toggle @if($isMenusRoute) active @endif"
                           data-bs-toggle="collapse" href="#menusMenu" role="button"
                           aria-expanded="@if($isMenusRoute) true @else false @endif">
                            <i class="fas fa-utensils"></i>
                            <span>Menus</span>
                            <i class="fas fa-chevron-down ms-auto sidebar-chevron"></i>
                        </a>
                        <div class="collapse sidebar-submenu @if($isMenusRoute) show @endif" id="menusMenu">
                            <nav class="nav flex-column">
                                <a class="nav-link py-2 @if(request()->routeIs('cms.menus.common')) active @endif" href="{{ route('cms.menus.common') }}">
                                    Common Section
                                </a>
                                <a class="nav-link py-2 @if(request()->routeIs('cms.menus.categories.*')) active @endif" href="{{ route('cms.menus.categories.index') }}">
                                    Categories
                                </a>
                                <a class="nav-link py-2 @if(request()->routeIs('cms.menus.items.*')) active @endif" href="{{ route('cms.menus.items.index') }}">
                                    Menu Items
                                </a>
                               
                            </nav>
                        </div>
                    </div>
                    @endif
                   @if(config('cms-kit.common.modules.signature-items', true) && $cmsUser->can('signature-items.view'))
                    <a class="nav-link @if(Route::is('cms.menus.signature-items.*')) active @endif" href="{{ route('cms.menus.signature-items.index') }}">
                        <i class="fas fa-star"></i> Signature Items
                    </a>
                    @endif
                    @if(config('cms-kit.common.modules.order-process', true) && $cmsUser->can('order-process.view'))
                    <a class="nav-link @if(Route::is('cms.order-process.*')) active @endif" href="{{ route('cms.order-process.index') }}">
                        <i class="fas fa-motorcycle"></i> Order Process
                    </a>
                    @endif
                    @if(config('cms-kit.common.modules.offers', true) && $cmsUser->can('offers.view'))
                    <a class="nav-link @if(Route::is('cms.offers.*')) active @endif" href="{{ route('cms.offers.index') }}">
                        <i class="fas fa-percent"></i> Offers
                    </a>
                    @endif
                    @if(config('cms-kit.common.modules.coupons', true) && $cmsUser->can('coupons.view'))
                    <a class="nav-link @if(Route::is('cms.coupons.*')) active @endif" href="{{ route('cms.coupons.index') }}">
                        <i class="fas fa-ticket-alt"></i> Coupons
                    </a>
                    @endif
                    @if(config('cms-kit.common.modules.delivery-tax', true) && $cmsUser->can('delivery-tax.view'))
                    <a class="nav-link @if(Route::is('cms.delivery-tax.*')) active @endif" href="{{ route('cms.delivery-tax.edit') }}">
                        <i class="fas fa-truck"></i> Delivery Charge & Tax
                    </a>
                    @endif
                    @if(config('cms-kit.common.modules.customer-orders', true) && $cmsUser->can('customer-orders.view'))
                    <a class="nav-link @if(Route::is('cms.customer-orders.*')) active @endif" href="{{ route('cms.customer-orders.index') }}">
                        <i class="fas fa-receipt"></i> Orders
                    </a>
                    @endif

                    @if(config('cms-kit.common.modules.faqs', true) && $cmsUser->can('faqs.view'))
                    <a class="nav-link @if(Route::is('cms.faqs.*')) active @endif" href="{{ route('cms.faqs.index') }}">
                        <i class="fas fa-question-circle"></i> FAQs
                    </a>
                    @endif

                    @if(config('cms-kit.common.modules.brands', true) && $cmsUser->can('brands.view'))
                    <a class="nav-link @if(Route::is('cms.brands.*')) active @endif" href="{{ route('cms.brands.index') }}">
                        <i class="fas fa-tag"></i> Brands
                    </a>
                    @endif

                    @if(config('cms-kit.common.modules.locations', true) && $cmsUser->can('locations.view'))
                    <a class="nav-link @if(Route::is('cms.locations.*')) active @endif" href="{{ route('cms.locations.index') }}">
                        <i class="fas fa-map-marker-alt"></i> Locations
                    </a>
                    @endif


                    @if(config('cms-kit.common.modules.enquiries', true) && $cmsUser->can('enquiries.view'))
                    <div class="nav-item sidebar-group">
                        <a class="nav-link d-flex align-items-center sidebar-group-toggle @if(request()->routeIs('cms.enquiries.*') || request()->routeIs('cms.newsletter-signups.*')) active @endif" 
                           data-bs-toggle="collapse" href="#enquiryMenu" role="button" 
                           aria-expanded="@if(request()->routeIs('cms.enquiries.*') || request()->routeIs('cms.newsletter-signups.*')) true @else false @endif">
                            <i class="fas fa-envelope"></i>
                            <span>Enquiries</span>
                            <i class="fas fa-chevron-down ms-auto sidebar-chevron"></i>
                        </a>
                        <div class="collapse sidebar-submenu @if(request()->routeIs('cms.enquiries.*') || request()->routeIs('cms.newsletter-signups.*')) show @endif" id="enquiryMenu">
                            <nav class="nav flex-column">
                                <a class="nav-link py-2 @if(request()->routeIs('cms.enquiries.*')) active @endif" href="{{ route('cms.enquiries.index') }}">
                                    Form Enquiries
                                </a>
                                @if(config('cms-kit.common.modules.newsletter-signups', true) && $cmsUser->can('newsletter.view'))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.newsletter-signups.*')) active @endif" href="{{ route('cms.newsletter-signups.index') }}">
                                    Newsletter Signups
                                </a>
                                @endif
                            </nav>
                        </div>
                    </div>
                    @endif

                    @if(config('cms-kit.common.modules.blogs', true) && $cmsUser->can('blogs.view'))
                    <a class="nav-link @if(Route::is('cms.blogs.*')) active @endif" href="{{ route('cms.blogs.index') }}">
                        <i class="fas fa-blog"></i> Blogs
                    </a>
                    @endif

                    @if(config('cms-kit.common.modules.careers', true) && $cmsUser->can('careers.view'))
                    <div class="nav-item sidebar-group">
                        <a class="nav-link d-flex align-items-center sidebar-group-toggle @if(request()->routeIs('cms.careers.*')) active @endif" 
                           data-bs-toggle="collapse" href="#careersMenu" role="button" 
                           aria-expanded="@if(request()->routeIs('cms.careers.*')) true @else false @endif">
                            <i class="fas fa-briefcase"></i>
                            <span>Careers</span>
                            <i class="fas fa-chevron-down ms-auto sidebar-chevron"></i>
                        </a>
                        <div class="collapse sidebar-submenu @if(request()->routeIs('cms.careers.*')) show @endif" id="careersMenu">
                            <nav class="nav flex-column">
                                @if(config('cms-kit.common.careers.common_section', true))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.careers.common')) active @endif" href="{{ route('cms.careers.common') }}">
                                    Common Section
                                </a>
                                @endif
                                @if(config('cms-kit.common.careers.vacancies', true))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.careers.vacancies.index') || request()->routeIs('cms.careers.create') || request()->routeIs('cms.careers.edit')) active @endif" href="{{ route('cms.careers.vacancies.index') }}">
                                    Vacancies
                                </a>
                                @endif
                                @if(config('cms-kit.common.careers.departments', true))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.careers.departments.*')) active @endif" href="{{ route('cms.careers.departments.index') }}">
                                    Departments
                                </a>
                                @endif
                                @if(config('cms-kit.common.careers.candidates', true))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.careers.candidates.*')) active @endif" href="{{ route('cms.careers.candidates.index') }}">
                                    Candidates
                                </a>
                                @endif
                            </nav>
                        </div>
                    </div>
                    @endif

                    {{-- User Management Group --}}
                    @if($cmsUser->hasRole('superadmin') || $cmsUser->can('users.view') || $cmsUser->can('roles.view'))
                    <div class="nav-item sidebar-group">
                        <a class="nav-link d-flex align-items-center sidebar-group-toggle @if(request()->routeIs('cms.admins.*') || request()->routeIs('cms.roles.*') || request()->routeIs('cms.permissions.*')) active @endif" 
                           data-bs-toggle="collapse" href="#userMenu" role="button" 
                           aria-expanded="@if(request()->routeIs('cms.admins.*') || request()->routeIs('cms.roles.*') || request()->routeIs('cms.permissions.*')) true @else false @endif">
                            <i class="fas fa-users-cog"></i>
                            <span>User Management</span>
                            <i class="fas fa-chevron-down ms-auto sidebar-chevron"></i>
                        </a>
                        <div class="collapse sidebar-submenu @if(request()->routeIs('cms.admins.*') || request()->routeIs('cms.roles.*') || request()->routeIs('cms.permissions.*')) show @endif" id="userMenu">
                            <nav class="nav flex-column">
                                @if($cmsUser->hasRole('superadmin') || $cmsUser->can('users.view'))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.admins.*')) active @endif" href="{{ route('cms.admins.index') }}">
                                    Administrators
                                </a>
                                @endif
                                @if($cmsUser->hasRole('superadmin') || $cmsUser->can('roles.view'))
                                <a class="nav-link py-2 @if(request()->routeIs('cms.roles.*')) active @endif" href="{{ route('cms.roles.index') }}">
                                    Roles & Permissions
                                </a>
                                <a class="nav-link py-2 @if(request()->routeIs('cms.permissions.*')) active @endif" href="{{ route('cms.permissions.index') }}">
                                    Permissions List
                                </a>
                                @endif
                            </nav>
                        </div>
                    </div>
                    @endif
                </nav>
            </div>

            {{-- Logout moved to header --}}
        </div>

        <!-- Main Wrapper -->
        <div class="main-wrapper flex-grow-1">
            <!-- Top Header -->
            <header class="top-header">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb mb-0">
                        <li class="breadcrumb-item"><a href="#" class="text-decoration-none text-muted">Dashboard</a></li>
                        @yield('breadcrumbs')
                    </ol>
                </nav>

                <div class="d-flex align-items-center gap-3">
                    <a href="{{ rtrim((string) (config('services.frontend.url') ?: config('app.url')), '/') }}" target="_blank" rel="noopener noreferrer" class="btn btn-premium btn-view-site btn-sm">
                        <i class="fas fa-external-link-alt me-2"></i> View Site
                    </a>
                    
                    <div class="dropdown">
                        <div class="user-profile dropdown-toggle" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            @php
                                $adminName = $cmsUser->name ?? config('cms-kit.common.auth.admin_name', 'Admin');
                                $initials = collect(explode(' ', $adminName))->map(fn($n) => mb_substr($n, 0, 1))->take(2)->join('');
                            @endphp
                            <div class="user-avatar">{{ strtoupper($initials) }}</div>
                            <div class="d-none d-lg-block">
                                <div class="fw-bold small lh-1">{{ $adminName }}</div>
                                <small class="text-muted" style="font-size: 0.75rem;">{{ $cmsUser->email ?? config('cms-kit.common.auth.admin_email') }}</small>
                            </div>
                        </div>
                        <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg mt-2" aria-labelledby="userDropdown" style="border-radius: 12px; min-width: 180px;">
                            <li class="px-3 py-2 border-bottom d-lg-none">
                                <div class="fw-bold small lh-1 text-dark">{{ $adminName }}</div>
                                <small class="text-muted" style="font-size: 0.75rem;">{{ $cmsUser->email ?? config('cms-kit.common.auth.admin_email') }}</small>
                            </li>
                            <li>
                                <form action="{{ route('cms.logout') }}" method="POST">
                                    @csrf
                                    <button type="submit" class="dropdown-item text-danger d-flex align-items-center gap-2 py-2">
                                        <i class="fas fa-sign-out-alt small"></i>
                                        <span>Logout</span>
                                    </button>
                                </form>
                            </li>
                        </ul>
                    </div>
                </div>
            </header>

            <!-- Content Area -->
            <div class="main-content">
            @if(session('success'))
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    {{ session('success') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif

            @yield('content')
            </div> <!-- end main-content -->
        </div> <!-- end main-wrapper -->
    </div> <!-- end d-flex -->

    <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        if (typeof tinymce !== 'undefined' && !tinymce.__cmsThemePatched) {
            const cmsTinyMceContentStyle = `
                body {
                    background: {{ $theme['surface_color'] ?? '#111719' }};
                    color: {{ $theme['text_color'] ?? '#F7EFE3' }};
                    font-family: Inter, Arial, sans-serif;
                    line-height: 1.6;
                }
                a { color: {{ $primaryColor }}; }
                p, li, td, th, h1, h2, h3, h4, h5, h6 { color: {{ $theme['text_color'] ?? '#F7EFE3' }}; }
                blockquote {
                    border-left: 4px solid {{ $primaryColor }};
                    color: {{ $theme['muted_text_color'] ?? '#A99D8F' }};
                    margin-left: 0;
                    padding-left: 1rem;
                }
                table, td, th { border-color: {{ $theme['border_color'] ?? '#2D241B' }}; }
            `;
            const cmsOriginalTinyMceInit = tinymce.init.bind(tinymce);

            tinymce.init = function (options) {
                const existingContentStyle = options?.content_style ? `${options.content_style}\n` : '';

                return cmsOriginalTinyMceInit({
                    branding: false,
                    promotion: false,
                    ...options,
                    content_style: `${existingContentStyle}${cmsTinyMceContentStyle}`,
                });
            };

            tinymce.__cmsThemePatched = true;
        }

        document.addEventListener('DOMContentLoaded', function () {
            if (typeof tinymce === 'undefined' || !document.querySelector('.tinymce-extra-field')) {
                return;
            }

            tinymce.init({
                selector: '.tinymce-extra-field',
                height: 350,
                plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
                toolbar: 'undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                branding: false,
                promotion: false
            });
        });

        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('form').forEach((form) => {
                let clickedSubmit = null;

                form.querySelectorAll('button[type="submit"], input[type="submit"]').forEach((button) => {
                    button.addEventListener('click', () => {
                        clickedSubmit = button;
                    });
                });

                form.addEventListener('submit', (event) => {
                    if (event.defaultPrevented || form.dataset.submitting === '1' || form.dataset.disableSubmitLoading === '1') {
                        return;
                    }

                    form.dataset.submitting = '1';

                    const submitButton = clickedSubmit || form.querySelector('button[type="submit"], input[type="submit"]');

                    if (submitButton) {
                        submitButton.dataset.originalText = submitButton.tagName === 'INPUT'
                            ? submitButton.value
                            : submitButton.innerHTML;

                        if (submitButton.tagName === 'INPUT') {
                            submitButton.value = 'Please wait...';
                        } else {
                            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait...';
                        }
                    }

                    form.querySelectorAll('button[type="submit"], input[type="submit"]').forEach((button) => {
                        button.disabled = true;
                    });
                });
            });
        });
    </script>
    @stack('scripts')
</body>
</html>
