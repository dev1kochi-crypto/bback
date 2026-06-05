<?php

namespace App\Http\Controllers\Api;

use App\Models\CmsKit\MenuCategory;
use App\Models\CmsKit\MenuItem;
use App\Models\CmsKit\MenuSignatureItem;
use App\Models\CmsKit\SectionLabel;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class MenuController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $section = SectionLabel::query()
            ->where('section_key', 'menus')
            ->where('status', true)
            ->first();
        $signatureSection = SectionLabel::query()
            ->where('section_key', 'menu_signature_items')
            ->where('status', true)
            ->first();

        $categories = MenuCategory::query()
            ->active()
            ->whereHas('items', fn ($query) => $query->active())
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $items = MenuItem::query()
            ->active()
            ->whereHas('category', fn ($query) => $query->active())
            ->with('category')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $signatureItems = MenuSignatureItem::query()
            ->active()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        if (! $section || $categories->isEmpty() || $items->isEmpty()) {
            return response()->json([
                'section' => null,
                'categories' => [],
                'items' => [],
                'signature_section' => $this->formatSignatureSection($signatureSection),
                'signature_items' => $this->formatSignatureItems($signatureItems),
            ]);
        }

        return response()->json([
            'section' => [
                'line_1' => $section->getTranslation('line_1'),
                'line_2' => $section->getTranslation('line_2'),
                'short_description' => $section->getTranslation('short_description'),
                'button_text' => $section->getTranslation('button_text'),
                'button_url' => $section->extra_fields['button_url'] ?? '/menu',
                'listing_title' => $section->getTranslation('listing_title'),
                'listing_description' => $section->getTranslation('listing_description'),
                'display_home' => (bool) data_get($section->extra_fields, 'display_home', false),
            ],
            'categories' => $categories->map(fn (MenuCategory $category) => [
                'id' => $category->id,
                'name' => $category->getTranslation('name'),
                'icon' => $category->icon ? $this->publicStorageUrl($category->icon) : null,
                'icon_alt' => $category->getTranslation('icon_alt') ?? $category->icon_alt,
                'sort_order' => $category->sort_order,
            ])->values(),
            'items' => $items->map(fn (MenuItem $item) => [
                'id' => $item->id,
                'category_id' => $item->menu_category_id,
                'category_name' => $item->category?->getTranslation('name'),
                'image' => $item->image ? $this->publicStorageUrl($item->image) : null,
                'image_alt' => $item->getTranslation('image_alt') ?? $item->image_alt,
                'name' => $item->getTranslation('name'),
                'description' => $item->getTranslation('description'),
                'food_type' => $item->food_type,
                'spicy' => $item->spicy,
                'price' => number_format((float) $item->price, 2, '.', ''),
                'sort_order' => $item->sort_order,
            ])->values(),
            'signature_section' => $this->formatSignatureSection($signatureSection),
            'signature_items' => $this->formatSignatureItems($signatureItems),
        ]);
    }

    private function formatSignatureSection(?SectionLabel $section): ?array
    {
        if (! $section) {
            return null;
        }

        return [
            'line_1' => null,
            'line_2' => $section->getTranslation('line_2'),
            'short_description' => $section->getTranslation('short_description'),
            'display_home' => (bool) data_get($section->extra_fields, 'display_home', false),
        ];
    }

    private function formatSignatureItems($items)
    {
        return $items->map(fn (MenuSignatureItem $item) => [
            'id' => $item->id,
            'image' => $item->image ? $this->publicStorageUrl($item->image) : null,
            'image_alt' => $item->getTranslation('image_alt') ?? $item->image_alt,
            'title' => $item->getTranslation('title'),
            'sort_order' => $item->sort_order,
        ])->values();
    }

    private function publicStorageUrl(string $path): string
    {
        return request()->getSchemeAndHttpHost() . '/storage/' . ltrim($path, '/');
    }
}
