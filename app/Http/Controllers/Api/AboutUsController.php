<?php

namespace App\Http\Controllers\Api;

use App\Models\CmsKit\AboutUs;
use App\Models\CmsKit\SectionLabel;
use App\Models\CmsKit\SiteInformation;
use App\Models\CmsKit\WhyChooseUsItem;
use App\Support\SitePayloadBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Schema;

class AboutUsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $locale = app()->getLocale();
        $fallbackLocale = config('app.fallback_locale', 'en');
        $siteInformation = SiteInformation::query()->first();
        $aboutTableExists = Schema::hasTable('about_us');
        $itemsTableExists = Schema::hasTable('why_choose_us_items');

        $about = $aboutTableExists
            ? AboutUs::query()->where('is_active', true)->first()
            : null;

        $whyChooseSection = $itemsTableExists
            ? SectionLabel::query()->where('section_key', 'why_choose_us')->first()
            : null;

        $items = $itemsTableExists
            ? WhyChooseUsItem::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (WhyChooseUsItem $item) => [
                    'id' => $item->id,
                    'icon' => $item->icon ? $this->publicStorageUrl($item->icon) : null,
                    'icon_alt' => $item->icon_alt,
                    'line_1' => $this->translatedValue($item->translations ?? [], 'line_1', $locale, $fallbackLocale, $item->line_1),
                    'line_2' => $this->translatedValue($item->translations ?? [], 'line_2', $locale, $fallbackLocale, $item->line_2),
                    'sort_order' => $item->sort_order,
                ])
                ->values()
            : collect();

        $aboutPayload = $about ? [
                'line_1' => $this->translatedValue($about->translations ?? [], 'line_1', $locale, $fallbackLocale, $about->line_1),
                'line_2' => $this->translatedValue($about->translations ?? [], 'line_2', $locale, $fallbackLocale, $about->line_2),
                'about_page_title' => $this->translatedValue($about->translations ?? [], 'about_page_title', $locale, $fallbackLocale, $about->about_page_title),
                'short_description' => $this->translatedValue($about->translations ?? [], 'short_description', $locale, $fallbackLocale, $about->short_description),
                'long_description' => $this->translatedValue($about->translations ?? [], 'long_description', $locale, $fallbackLocale, $about->long_description),
                'button_text' => $this->translatedValue($about->translations ?? [], 'button_text', $locale, $fallbackLocale, $about->button_text),
                'button_url' => $about->button_url,
                'video_type' => $about->video_type,
                'video_url' => $about->video_url,
                'video_file' => $about->video_file ? $this->publicStorageUrl($about->video_file) : null,
                'video_thumbnail' => $about->video_thumbnail ? $this->publicStorageUrl($about->video_thumbnail) : null,
                'mission' => $this->translatedValue($about->translations ?? [], 'mission', $locale, $fallbackLocale, $about->mission),
                'vision' => $this->translatedValue($about->translations ?? [], 'vision', $locale, $fallbackLocale, $about->vision),
                'core_value' => $this->translatedValue($about->translations ?? [], 'core_value', $locale, $fallbackLocale, $about->core_value),
                'display_home' => (bool) data_get($about->extra_fields, 'display_home', false),
            ] : null;

        return response()->json([
            'about' => $this->hasAboutContent($aboutPayload) ? $aboutPayload : null,
            'why_choose_us' => ($whyChooseSection?->status && $items->isNotEmpty()) ? [
                'title' => $this->translatedValue($whyChooseSection->translations ?? [], 'title', $locale, $fallbackLocale),
                'description' => $this->translatedValue($whyChooseSection->translations ?? [], 'description', $locale, $fallbackLocale),
                'home_title' => $this->translatedValue($whyChooseSection->translations ?? [], 'home_title', $locale, $fallbackLocale),
                'home_description' => $this->translatedValue($whyChooseSection->translations ?? [], 'home_description', $locale, $fallbackLocale),
                'display_home' => (bool) data_get($whyChooseSection->extra_fields, 'display_home', false),
                'items' => $items,
            ] : null,
            'site' => SitePayloadBuilder::build($siteInformation),
        ]);
    }

    private function translatedValue(array $translations, string $field, string $locale, string $fallbackLocale, ?string $default = null): ?string
    {
        return $translations[$locale][$field]
            ?? ($translations[$fallbackLocale][$field] ?? null)
            ?? $default;
    }

    private function hasAboutContent(?array $about): bool
    {
        if (! $about) {
            return false;
        }

        foreach (['line_1', 'line_2', 'about_page_title', 'short_description', 'long_description', 'button_text', 'video_url', 'video_file', 'video_thumbnail', 'mission', 'vision', 'core_value'] as $field) {
            if ($this->hasMeaningfulValue($about[$field] ?? null)) {
                return true;
            }
        }

        return false;
    }

    private function hasMeaningfulValue(?string $value): bool
    {
        return trim(html_entity_decode(strip_tags($value ?? ''))) !== '';
    }

    private function publicStorageUrl(string $path): string
    {
        return request()->getSchemeAndHttpHost() . '/storage/' . ltrim($path, '/');
    }
}
