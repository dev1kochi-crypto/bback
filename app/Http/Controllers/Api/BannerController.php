<?php

namespace App\Http\Controllers\Api;

use App\Models\CmsKit\Banner;
use App\Models\CmsKit\SiteInformation;
use App\Support\FrontendNavigation;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class BannerController extends Controller
{
    private const DEFAULT_FLOATING_IMAGES = [
        '/app/images/revslider_h2-leaf 1.png',
        '/app/images/revslider_h2-leaf 2.png',
        '/app/images/revslider_h2-mushroom 1.png',
        '/app/images/revslider_h2-mushroom 2.png',
        '/app/images/revslider_h2-tomato 1.png',
    ];

    public function __invoke(): JsonResponse
    {
        $locale = app()->getLocale();
        $fallbackLocale = config('app.fallback_locale', 'en');
        $siteInformation = SiteInformation::first();
        $logoImage = $siteInformation?->logo
            ? $this->publicStorageUrl($siteInformation->logo)
            : '/app/images/logo.svg';
        $navigationItems = FrontendNavigation::items();

        $banners = Banner::query()
            ->where('status', true)
            ->orderBy('order_index')
            ->get()
            ->map(function (Banner $banner) use ($locale, $fallbackLocale, $siteInformation, $logoImage, $navigationItems) {
                $translation = $banner->translations[$locale]
                    ?? $banner->translations[$fallbackLocale]
                    ?? collect($banner->translations ?? [])->first()
                    ?? [];

                $buttons = collect($translation['buttons'] ?? [])
                    ->filter(fn ($button) => !empty($button['label']))
                    ->values();
                $primaryButton = $buttons->get(0, []);
                $secondaryButton = $buttons->get(1, []);

                $extra = $banner->extra_fields ?? [];

                return [
                    'id' => $banner->id,
                    'title' => $translation['line_1'] ?? '',
                    'subtitle' => $translation['line_2'] ?? '',
                    'description' => $translation['content'] ?? '',
                    'button_text' => $primaryButton['label'] ?? null,
                    'button_url' => $primaryButton['url'] ?? null,
                    'secondary_button_text' => $secondaryButton['label'] ?? null,
                    'secondary_button_url' => $secondaryButton['url'] ?? null,
                    'image' => $banner->image ? $this->publicStorageUrl($banner->image) : null,
                    'image_alt' => $banner->image_alt,
                    'secondary_image' => $extra['secondary_image'] ?? null,
                    'background_image' => $extra['background_image'] ?? '/app/images/Mask group (18).jpg',
                    'logo_image' => $logoImage,
                    'logo_alt' => $siteInformation?->logo_alt ?? $siteInformation?->company_name ?? 'B.black',
                    'nav_items' => $navigationItems,
                    'badge_image' => $extra['badge_image'] ?? '/app/images/modern-circular-grunge-frame-decorative-banner-design 1.png',
                    'crumb_image' => $extra['crumb_image'] ?? '/app/images/Object-1.png',
                    'floating_images' => $this->decodeFloatingImages($extra['floating_images'] ?? null) ?: self::DEFAULT_FLOATING_IMAGES,
                    'phone' => $siteInformation?->phone_1 ?? $extra['phone'] ?? '+995 511 73 377',
                    'email' => $siteInformation?->email_1 ?? $extra['email'] ?? 'info@bback.ae',
                    'food_layout' => $extra['food_layout'] ?? 'center',
                    'food_scale' => isset($extra['food_scale']) && $extra['food_scale'] !== ''
                        ? (int) $extra['food_scale']
                        : null,
                    'status' => $banner->status ? 1 : 0,
                    'order' => $banner->order_index,
                ];
            });

        return response()->json($banners);
    }

    private function decodeFloatingImages(?string $value): array
    {
        if (!$value) {
            return [];
        }

        $decoded = json_decode($value, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return array_values($decoded);
        }

        return collect(explode("\n", $value))
            ->map(fn ($path) => trim($path))
            ->filter()
            ->values()
            ->all();
    }

    private function publicStorageUrl(string $path): string
    {
        return request()->getSchemeAndHttpHost() . '/storage/' . ltrim($path, '/');
    }
}
