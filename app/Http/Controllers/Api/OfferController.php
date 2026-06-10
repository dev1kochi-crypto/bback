<?php

namespace App\Http\Controllers\Api;

use App\Models\CmsKit\Offer;
use App\Support\PublicStorageUrl;
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
            ->with('menuItem')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Offer $offer) => [
                'id' => $offer->id,
                'menu_item_id' => $offer->menu_item_id,
                'image' => PublicStorageUrl::make(
                    $offer->image ?: $offer->menuItem?->image,
                    $offer->image ? $offer->updated_at : $offer->menuItem?->updated_at,
                ),
                'offer_percent' => $offer->offer_percent !== null ? number_format((float) $offer->offer_percent, 2, '.', '') : null,
                'offer_price' => $offer->offer_price !== null ? number_format((float) $offer->offer_price, 2, '.', '') : null,
                'alt_text' => $this->translatedValue($offer->translations ?? [], 'alt_text', $locale, $fallbackLocale, $offer->alt_text)
                    ?? $offer->menuItem?->getTranslation('image_alt')
                    ?? $offer->menuItem?->getTranslation('name'),
                'menu_item' => $offer->menuItem ? [
                    'id' => $offer->menuItem->id,
                    'name' => $offer->menuItem->getTranslation('name'),
                    'description' => $offer->menuItem->getTranslation('description'),
                    'price' => number_format((float) $offer->menuItem->price, 2, '.', ''),
                    'food_type' => $offer->menuItem->food_type,
                    'spicy' => $offer->menuItem->spicy,
                ] : null,
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

}
