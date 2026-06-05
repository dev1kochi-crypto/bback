<?php

namespace App\Http\Controllers\Api;

use App\Models\CmsKit\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class OfferController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $locale = app()->getLocale();
        $fallbackLocale = config('app.fallback_locale', 'en');

        $offers = Offer::query()
            ->active()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Offer $offer) => [
                'id' => $offer->id,
                'image' => $offer->image ? $this->publicStorageUrl($offer->image) : null,
                'alt_text' => $this->translatedValue($offer->translations ?? [], 'alt_text', $locale, $fallbackLocale, $offer->alt_text),
                'sort_order' => $offer->sort_order,
            ])
            ->values();

        return response()->json([
            'offers' => $offers,
        ]);
    }

    private function translatedValue(array $translations, string $field, string $locale, string $fallbackLocale, ?string $default = null): ?string
    {
        return $translations[$locale][$field]
            ?? ($translations[$fallbackLocale][$field] ?? null)
            ?? $default;
    }

    private function publicStorageUrl(string $path): string
    {
        return request()->getSchemeAndHttpHost() . '/storage/' . ltrim($path, '/');
    }
}
