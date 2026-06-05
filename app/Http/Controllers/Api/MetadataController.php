<?php

namespace App\Http\Controllers\Api;

use App\Models\CmsKit\Metadata;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class MetadataController extends Controller
{
    public function show(string $pageKey): JsonResponse
    {
        $metadata = Metadata::query()->where('page_key', $pageKey)->first();

        if (! $metadata) {
            return response()->json(null);
        }

        $locale = app()->getLocale();
        $fallbackLocale = config('app.fallback_locale', 'en');

        return response()->json([
            'page_key' => $metadata->page_key,
            'page_name' => $this->translatedValue($metadata, 'page_name', $locale, $fallbackLocale),
            'canonical_url' => $this->translatedValue($metadata, 'canonical_url', $locale, $fallbackLocale),
            'meta_title' => $this->translatedValue($metadata, 'meta_title', $locale, $fallbackLocale),
            'meta_description' => $this->translatedValue($metadata, 'meta_description', $locale, $fallbackLocale),
            'meta_keywords' => $this->translatedValue($metadata, 'meta_keywords', $locale, $fallbackLocale),
            'og_title' => $this->translatedValue($metadata, 'og_title', $locale, $fallbackLocale),
            'og_description' => $this->translatedValue($metadata, 'og_description', $locale, $fallbackLocale),
            'og_image' => $metadata->og_image ? $this->publicStorageUrl($metadata->og_image) : null,
            'other_meta_tags' => $this->translatedValue($metadata, 'other_meta_tags', $locale, $fallbackLocale),
        ]);
    }

    private function translatedValue(Metadata $metadata, string $attribute, string $locale, string $fallbackLocale): ?string
    {
        $value = $metadata->{$attribute};

        if (! is_array($value)) {
            return $value ?: null;
        }

        return $value[$locale] ?? ($value[$fallbackLocale] ?? null);
    }

    private function publicStorageUrl(string $path): string
    {
        return request()->getSchemeAndHttpHost() . '/storage/' . ltrim($path, '/');
    }
}
