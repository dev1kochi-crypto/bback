<?php

namespace App\Http\Controllers\Api;

use App\Models\CmsKit\SectionLabel;
use App\Models\CmsKit\Testimonial;
use App\Support\PublicStorageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class TestimonialController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $section = SectionLabel::query()
            ->where('section_key', 'testimonials')
            ->where('status', true)
            ->first();

        $items = Testimonial::query()
            ->active()
            ->orderBy('order_index')
            ->orderBy('id')
            ->get();

        if (! $section || ! data_get($section->extra_fields, 'display_home', false) || $items->isEmpty()) {
            return response()->json([
                'section' => null,
                'items' => [],
            ]);
        }

        return response()->json([
            'section' => [
                'title' => $section->getTranslation('section_title'),
                'sub_heading_1' => $section->getTranslation('section_sub_heading_1'),
                'sub_heading_2' => $section->getTranslation('section_sub_heading_2'),
                'description' => $this->sectionDescription($section),
                'display_home' => true,
            ],
            'items' => $items->map(fn (Testimonial $testimonial) => [
                'id' => $testimonial->id,
                'name' => $testimonial->getTranslation('name'),
                'designation' => $testimonial->getTranslation('designation'),
                'content' => $testimonial->getTranslation('content'),
                'rating' => $testimonial->rating,
                'image' => PublicStorageUrl::fromModel($testimonial->image, $testimonial),
                'image_alt' => $testimonial->image_alt,
                'order_index' => $testimonial->order_index,
            ])->values(),
        ]);
    }

    private function sectionDescription(SectionLabel $section): ?string
    {
        $locale = app()->getLocale();
        $fallbackLocale = config('app.fallback_locale', 'en');

        return $section->description[$locale]
            ?? ($section->description[$fallbackLocale] ?? null);
    }

}
