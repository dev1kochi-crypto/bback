<?php

namespace App\Providers;

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
use App\Observers\FrontendCacheObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $observer = FrontendCacheObserver::class;
        $models = [
            SiteInformation::class,
            Banner::class,
            AboutUs::class,
            WhyChooseUsItem::class,
            MenuCategory::class,
            MenuItem::class,
            MenuSignatureItem::class,
            OrderProcessItem::class,
            Offer::class,
            Testimonial::class,
            Metadata::class,
            SectionLabel::class,
        ];

        foreach ($models as $model) {
            $model::observe($observer);
        }
    }
}
