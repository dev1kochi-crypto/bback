<?php

namespace App\Http\Controllers\Api;

use App\Models\CmsKit\OrderProcessItem;
use App\Models\CmsKit\SectionLabel;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class OrderProcessController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $section = SectionLabel::query()
            ->where('section_key', 'order_process')
            ->where('status', true)
            ->first();

        $items = OrderProcessItem::query()
            ->active()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        if (!$section || !$section->section_image || $items->isEmpty()) {
            return response()->json([
                'section' => null,
                'items' => [],
            ]);
        }

        return response()->json([
            'section' => [
                'line_1' => $section->getTranslation('line_1'),
                'title' => $section->getTranslation('title'),
                'description' => $section->getTranslation('description'),
                'image' => $this->publicStorageUrl($section->section_image),
                'image_alt' => $section->section_image_alt,
                'display_home' => (bool) data_get($section->extra_fields, 'display_home', false),
            ],
            'items' => $items->map(fn (OrderProcessItem $item) => [
                'id' => $item->id,
                'icon' => $item->icon ? $this->publicStorageUrl($item->icon) : null,
                'icon_alt' => $item->icon_alt,
                'title' => $item->getTranslation('title'),
                'description' => $item->getTranslation('description'),
                'sort_order' => $item->sort_order,
            ])->values(),
        ]);
    }

    private function publicStorageUrl(string $path): string
    {
        return request()->getSchemeAndHttpHost() . '/storage/' . ltrim($path, '/');
    }
}
