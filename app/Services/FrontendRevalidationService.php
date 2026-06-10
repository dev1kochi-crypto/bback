<?php

namespace App\Services;

use App\Models\CmsKit\AboutUs;
use App\Models\CmsKit\Banner;
use App\Models\CmsKit\MenuCategory;
use App\Models\CmsKit\MenuItem;
use App\Models\CmsKit\MenuSignatureItem;
use App\Models\CmsKit\Metadata;
use App\Models\CmsKit\Offer;
use App\Models\CmsKit\OrderProcessItem;
use App\Models\CmsKit\SectionLabel;
use App\Models\CmsKit\SiteInformation;
use App\Models\CmsKit\Testimonial;
use App\Models\CmsKit\WhyChooseUsItem;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FrontendRevalidationService
{
    private const MODEL_TAGS = [
        SiteInformation::class => ['api-site', 'api-contact'],
        Banner::class => ['api-banners'],
        AboutUs::class => ['api-about-us'],
        WhyChooseUsItem::class => ['api-about-us'],
        MenuCategory::class => ['api-menus'],
        MenuItem::class => ['api-menus'],
        MenuSignatureItem::class => ['api-menus'],
        OrderProcessItem::class => ['api-order-process'],
        Offer::class => ['api-offers'],
        Testimonial::class => ['api-testimonials'],
    ];

    private const SECTION_TAGS = [
        'menus' => ['api-menus'],
        'menu_signature_items' => ['api-menus'],
        'order_process' => ['api-order-process'],
        'testimonials' => ['api-testimonials'],
        'why_choose_us' => ['api-about-us'],
    ];

    public function revalidateFor(object $model): void
    {
        $this->revalidate($this->tagsFor($model));
    }

    public function revalidate(?array $tags = null): void
    {
        $url = config('services.frontend.url');
        $secret = config('services.frontend.revalidate_secret');

        if (! $url || ! $secret) {
            Log::info('Frontend revalidation skipped: WEB_URL/FRONTEND_URL or FRONTEND_REVALIDATE_SECRET is not configured.');

            return;
        }

        $endpoint = rtrim($url, '/').'/api/revalidate';
        $payload = ['tags' => $tags ?? ['cms-data']];

        dispatch(static function () use ($endpoint, $secret, $payload): void {
            try {
                $response = Http::timeout(10)
                    ->withHeaders(['x-revalidate-secret' => $secret])
                    ->post($endpoint, $payload);

                if (! $response->successful()) {
                    Log::warning('Frontend revalidation failed.', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Throwable $exception) {
                Log::warning('Frontend revalidation request failed.', [
                    'message' => $exception->getMessage(),
                ]);
            }
        })->afterResponse();
    }

    private function tagsFor(object $model): array
    {
        if ($model instanceof Metadata) {
            return ['api-metadata', "api-metadata-{$model->page_key}"];
        }

        if ($model instanceof SectionLabel) {
            return self::SECTION_TAGS[$model->section_key] ?? ['cms-data'];
        }

        return self::MODEL_TAGS[$model::class] ?? ['cms-data'];
    }
}
