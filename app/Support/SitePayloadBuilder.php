<?php

namespace App\Support;

use App\Models\CmsKit\SiteInformation;

final class SitePayloadBuilder
{
    public static function build(?SiteInformation $siteInformation = null): array
    {
        $siteInformation ??= SiteInformation::query()->first();
        $locale = app()->getLocale();
        $fallbackLocale = config('app.fallback_locale', 'en');
        $translations = $siteInformation?->translations ?? [];
        $extraFields = $siteInformation?->extra_fields ?? [];

        $address = self::translatedValue($siteInformation, $translations, 'address', $locale, $fallbackLocale);
        $googleMapLink = $extraFields['google_map_link'] ?? null;

        return [
            'logo' => $siteInformation?->logo ? self::publicStorageUrl($siteInformation->logo) : '/app/images/logo.svg',
            'logo_alt' => $siteInformation?->logo_alt ?? 'B.back',
            'company_name' => self::translatedValue($siteInformation, $translations, 'company_name', $locale, $fallbackLocale) ?? 'B.back',
            'phone' => $siteInformation?->phone_1,
            'email' => $siteInformation?->email_1,
            'whatsapp' => $siteInformation?->whatsapp_number,
            'address' => $address,
            'google_map_link' => $googleMapLink,
            'opening_hours' => data_get($translations, "{$locale}.extra_fields.opening_hours")
                ?? data_get($translations, "{$fallbackLocale}.extra_fields.opening_hours")
                ?? data_get($extraFields, 'opening_hours'),
            'delivery_free_above_amount' => number_format((float) ($siteInformation?->delivery_free_above_amount ?? 0), 2, '.', ''),
            'delivery_charge_amount' => number_format((float) ($siteInformation?->delivery_charge_amount ?? 0), 2, '.', ''),
            'tax_amount' => number_format((float) ($siteInformation?->tax_amount ?? 0), 2, '.', ''),
            'privacy_policy' => self::translatedValue($siteInformation, $translations, 'privacy_policy', $locale, $fallbackLocale),
            'terms_and_conditions' => self::translatedValue($siteInformation, $translations, 'terms_and_conditions', $locale, $fallbackLocale),
            'nav_items' => FrontendNavigation::items(),
            'footer' => [
                'description' => self::translatedValue($siteInformation, $translations, 'footer_description', $locale, $fallbackLocale),
                'privacy_policy_url' => self::translatedValue($siteInformation, $translations, 'privacy_policy', $locale, $fallbackLocale) ? '/privacy-policy' : null,
                'terms_url' => self::translatedValue($siteInformation, $translations, 'terms_and_conditions', $locale, $fallbackLocale) ? '/terms-and-conditions' : null,
                'menu_links' => [
                    ['label' => 'Sandwich', 'url' => '#menu'],
                    ['label' => 'Burger', 'url' => '#menu'],
                    ['label' => 'Plates', 'url' => '#menu'],
                    ['label' => 'Pizza', 'url' => '#menu'],
                    ['label' => 'Snacks', 'url' => '#menu'],
                    ['label' => 'Appetizers & Salads', 'url' => '#menu'],
                    ['label' => 'Sauces', 'url' => '#menu'],
                ],
                'social' => array_filter([
                    'facebook' => $siteInformation?->facebook,
                    'instagram' => $siteInformation?->instagram,
                    'twitter' => $siteInformation?->twitter,
                    'linkedin' => $siteInformation?->linkedin,
                    'youtube' => $siteInformation?->youtube,
                    'whatsapp' => $siteInformation?->whatsapp_social ?: $siteInformation?->whatsapp_number,
                ]),
            ],
            'seo' => [
                'gtm_container_ids' => self::gtmContainerIds($siteInformation?->gtag),
                'custom_head_script' => $siteInformation?->custom_head_script,
                'custom_body_script' => $siteInformation?->custom_body_script,
            ],
        ];
    }

    private static function gtmContainerIds(?string $value): array
    {
        if (! $value) {
            return [];
        }

        return collect(preg_split('/\r\n|\r|\n|,/', $value))
            ->map(fn ($id) => trim($id))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private static function translatedValue(
        ?SiteInformation $siteInformation,
        array $translations,
        string $field,
        string $locale,
        string $fallbackLocale,
    ): ?string {
        if (! $siteInformation) {
            return null;
        }

        return $translations[$locale][$field]
            ?? ($translations[$fallbackLocale][$field] ?? null)
            ?? $siteInformation->{$field};
    }

    private static function publicStorageUrl(string $path): string
    {
        return request()->getSchemeAndHttpHost() . '/storage/' . ltrim($path, '/');
    }
}
