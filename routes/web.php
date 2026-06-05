<?php

use App\Http\Controllers\CmsKit\AboutUsController;
use App\Http\Controllers\CmsKit\CouponController;
use App\Http\Controllers\CmsKit\CustomerOrderController;
use App\Http\Controllers\CmsKit\DashboardController;
use App\Http\Controllers\CmsKit\DeliveryTaxController;
use App\Http\Controllers\CmsKit\MenuController;
use App\Http\Controllers\CmsKit\OfferController;
use App\Http\Controllers\CmsKit\OrderProcessController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['web'])->group(function () {
    Route::prefix(config('cms-kit.common.auth.prefix', 'admin'))
        ->middleware(['cms.auth'])
        ->group(function () {
            Route::get('/', [DashboardController::class, 'index'])->name('cms.dashboard');

            if (config('cms-kit.common.modules.about-us', true)) {
                Route::middleware(['cms.permission:about-us.view'])->group(function () {
                    Route::get('/about-us', [AboutUsController::class, 'index'])->name('cms.about-us.index');
                    Route::get('/about-us/why-choose-us', [AboutUsController::class, 'whyChooseUs'])->name('cms.about-us.why-choose.index');
                    Route::post('/about-us', [AboutUsController::class, 'update'])->middleware('cms.permission:about-us.edit')->name('cms.about-us.update');
                    Route::post('/about-us/why-choose-section', [AboutUsController::class, 'updateWhyChooseSection'])->middleware('cms.permission:about-us.edit')->name('cms.about-us.why-choose-section.update');

                    Route::get('/about-us/items/create', [AboutUsController::class, 'createItem'])->middleware('cms.permission:about-us.edit')->name('cms.about-us.items.create');
                    Route::post('/about-us/items', [AboutUsController::class, 'storeItem'])->middleware('cms.permission:about-us.edit')->name('cms.about-us.items.store');
                    Route::get('/about-us/items/{id}/edit', [AboutUsController::class, 'editItem'])->middleware('cms.permission:about-us.edit')->name('cms.about-us.items.edit');
                    Route::put('/about-us/items/{id}', [AboutUsController::class, 'updateItem'])->middleware('cms.permission:about-us.edit')->name('cms.about-us.items.update');
                    Route::delete('/about-us/items/{id}', [AboutUsController::class, 'destroyItem'])->middleware('cms.permission:about-us.delete')->name('cms.about-us.items.destroy');
                    Route::post('/about-us/items/{id}/toggle-status', [AboutUsController::class, 'toggleItemStatus'])->middleware('cms.permission:about-us.edit')->name('cms.about-us.items.toggle-status');
                    Route::post('/about-us/items/reorder', [AboutUsController::class, 'reorderItem'])->middleware('cms.permission:about-us.edit')->name('cms.about-us.items.reorder');
                });
            }

            if (config('cms-kit.common.modules.menus', true)) {
                Route::middleware(['cms.permission:menus.view'])->group(function () {
                    Route::get('/menus', [MenuController::class, 'common'])->name('cms.menus.common');
                    Route::post('/menus', [MenuController::class, 'updateCommon'])->middleware('cms.permission:menus.edit')->name('cms.menus.common.update');

                    Route::get('/menus/categories', [MenuController::class, 'categories'])->name('cms.menus.categories.index');
                    Route::get('/menus/categories/create', [MenuController::class, 'createCategory'])->middleware('cms.permission:menus.create')->name('cms.menus.categories.create');
                    Route::post('/menus/categories', [MenuController::class, 'storeCategory'])->middleware('cms.permission:menus.create')->name('cms.menus.categories.store');
                    Route::get('/menus/categories/{id}/edit', [MenuController::class, 'editCategory'])->middleware('cms.permission:menus.edit')->name('cms.menus.categories.edit');
                    Route::put('/menus/categories/{id}', [MenuController::class, 'updateCategory'])->middleware('cms.permission:menus.edit')->name('cms.menus.categories.update');
                    Route::delete('/menus/categories/{id}', [MenuController::class, 'destroyCategory'])->middleware('cms.permission:menus.delete')->name('cms.menus.categories.destroy');
                    Route::post('/menus/categories/{id}/toggle-status', [MenuController::class, 'toggleCategoryStatus'])->middleware('cms.permission:menus.edit')->name('cms.menus.categories.toggle-status');
                    Route::post('/menus/categories/reorder', [MenuController::class, 'reorderCategory'])->middleware('cms.permission:menus.edit')->name('cms.menus.categories.reorder');

                    Route::get('/menus/items', [MenuController::class, 'items'])->name('cms.menus.items.index');
                    Route::get('/menus/items/create', [MenuController::class, 'createItem'])->middleware('cms.permission:menus.create')->name('cms.menus.items.create');
                    Route::post('/menus/items', [MenuController::class, 'storeItem'])->middleware('cms.permission:menus.create')->name('cms.menus.items.store');
                    Route::get('/menus/items/{id}/edit', [MenuController::class, 'editItem'])->middleware('cms.permission:menus.edit')->name('cms.menus.items.edit');
                    Route::put('/menus/items/{id}', [MenuController::class, 'updateItem'])->middleware('cms.permission:menus.edit')->name('cms.menus.items.update');
                    Route::delete('/menus/items/{id}', [MenuController::class, 'destroyItem'])->middleware('cms.permission:menus.delete')->name('cms.menus.items.destroy');
                    Route::post('/menus/items/{id}/toggle-status', [MenuController::class, 'toggleItemStatus'])->middleware('cms.permission:menus.edit')->name('cms.menus.items.toggle-status');
                    Route::post('/menus/items/reorder', [MenuController::class, 'reorderItem'])->middleware('cms.permission:menus.edit')->name('cms.menus.items.reorder');

                });
            }

            if (config('cms-kit.common.modules.signature-items', true)) {
                Route::middleware(['cms.permission:signature-items.view'])->group(function () {
                    Route::get('/signature-items', [MenuController::class, 'signatureItems'])->name('cms.menus.signature-items.index');
                    Route::post('/signature-items/section', [MenuController::class, 'updateSignatureSection'])->middleware('cms.permission:signature-items.edit')->name('cms.menus.signature-items.section.update');
                    Route::get('/signature-items/create', [MenuController::class, 'createSignatureItem'])->middleware('cms.permission:signature-items.create')->name('cms.menus.signature-items.create');
                    Route::post('/signature-items', [MenuController::class, 'storeSignatureItem'])->middleware('cms.permission:signature-items.create')->name('cms.menus.signature-items.store');
                    Route::get('/signature-items/{id}/edit', [MenuController::class, 'editSignatureItem'])->middleware('cms.permission:signature-items.edit')->name('cms.menus.signature-items.edit');
                    Route::put('/signature-items/{id}', [MenuController::class, 'updateSignatureItem'])->middleware('cms.permission:signature-items.edit')->name('cms.menus.signature-items.update');
                    Route::delete('/signature-items/{id}', [MenuController::class, 'destroySignatureItem'])->middleware('cms.permission:signature-items.delete')->name('cms.menus.signature-items.destroy');
                    Route::post('/signature-items/{id}/toggle-status', [MenuController::class, 'toggleSignatureItemStatus'])->middleware('cms.permission:signature-items.edit')->name('cms.menus.signature-items.toggle-status');
                    Route::post('/signature-items/reorder', [MenuController::class, 'reorderSignatureItem'])->middleware('cms.permission:signature-items.edit')->name('cms.menus.signature-items.reorder');
                });
            }

            if (config('cms-kit.common.modules.order-process', true)) {
                Route::middleware(['cms.permission:order-process.view'])->group(function () {
                    Route::get('/order-process', [OrderProcessController::class, 'index'])->name('cms.order-process.index');
                    Route::post('/order-process/section', [OrderProcessController::class, 'updateSection'])->middleware('cms.permission:order-process.edit')->name('cms.order-process.section.update');
                    Route::get('/order-process/items/create', [OrderProcessController::class, 'createItem'])->middleware('cms.permission:order-process.create')->name('cms.order-process.items.create');
                    Route::post('/order-process/items', [OrderProcessController::class, 'storeItem'])->middleware('cms.permission:order-process.create')->name('cms.order-process.items.store');
                    Route::get('/order-process/items/{id}/edit', [OrderProcessController::class, 'editItem'])->middleware('cms.permission:order-process.edit')->name('cms.order-process.items.edit');
                    Route::put('/order-process/items/{id}', [OrderProcessController::class, 'updateItem'])->middleware('cms.permission:order-process.edit')->name('cms.order-process.items.update');
                    Route::delete('/order-process/items/{id}', [OrderProcessController::class, 'destroyItem'])->middleware('cms.permission:order-process.delete')->name('cms.order-process.items.destroy');
                    Route::post('/order-process/items/{id}/toggle-status', [OrderProcessController::class, 'toggleItemStatus'])->middleware('cms.permission:order-process.edit')->name('cms.order-process.items.toggle-status');
                    Route::post('/order-process/items/reorder', [OrderProcessController::class, 'reorderItem'])->middleware('cms.permission:order-process.edit')->name('cms.order-process.items.reorder');
                });
            }

            if (config('cms-kit.common.modules.offers', true)) {
                Route::middleware(['cms.permission:offers.view'])->group(function () {
                    Route::get('/offers', [OfferController::class, 'index'])->name('cms.offers.index');
                    Route::get('/offers/create', [OfferController::class, 'create'])->middleware('cms.permission:offers.create')->name('cms.offers.create');
                    Route::post('/offers', [OfferController::class, 'store'])->middleware('cms.permission:offers.create')->name('cms.offers.store');
                    Route::get('/offers/{id}/edit', [OfferController::class, 'edit'])->middleware('cms.permission:offers.edit')->name('cms.offers.edit');
                    Route::put('/offers/{id}', [OfferController::class, 'update'])->middleware('cms.permission:offers.edit')->name('cms.offers.update');
                    Route::delete('/offers/{id}', [OfferController::class, 'destroy'])->middleware('cms.permission:offers.delete')->name('cms.offers.destroy');
                    Route::post('/offers/{id}/toggle-status', [OfferController::class, 'toggleStatus'])->middleware('cms.permission:offers.edit')->name('cms.offers.toggle-status');
                    Route::post('/offers/reorder', [OfferController::class, 'reorder'])->middleware('cms.permission:offers.edit')->name('cms.offers.reorder');
                });
            }

            if (config('cms-kit.common.modules.coupons', true)) {
                Route::middleware(['cms.permission:coupons.view'])->group(function () {
                    Route::get('/coupons', [CouponController::class, 'index'])->name('cms.coupons.index');
                    Route::get('/coupons/create', [CouponController::class, 'create'])->middleware('cms.permission:coupons.create')->name('cms.coupons.create');
                    Route::post('/coupons', [CouponController::class, 'store'])->middleware('cms.permission:coupons.create')->name('cms.coupons.store');
                    Route::get('/coupons/{id}/edit', [CouponController::class, 'edit'])->middleware('cms.permission:coupons.edit')->name('cms.coupons.edit');
                    Route::put('/coupons/{id}', [CouponController::class, 'update'])->middleware('cms.permission:coupons.edit')->name('cms.coupons.update');
                    Route::delete('/coupons/{id}', [CouponController::class, 'destroy'])->middleware('cms.permission:coupons.delete')->name('cms.coupons.destroy');
                    Route::post('/coupons/{id}/toggle-status', [CouponController::class, 'toggleStatus'])->middleware('cms.permission:coupons.edit')->name('cms.coupons.toggle-status');
                });
            }

            Route::middleware(['cms.permission:delivery-tax.view'])->group(function () {
                Route::get('/delivery-tax', [DeliveryTaxController::class, 'edit'])->name('cms.delivery-tax.edit');
                Route::put('/delivery-tax', [DeliveryTaxController::class, 'update'])->middleware('cms.permission:delivery-tax.edit')->name('cms.delivery-tax.update');
            });

            Route::middleware(['cms.permission:customer-orders.view'])->group(function () {
                Route::get('/customer-orders', [CustomerOrderController::class, 'index'])->name('cms.customer-orders.index');
                Route::get('/customer-orders/export', [CustomerOrderController::class, 'export'])->name('cms.customer-orders.export');
                Route::get('/customer-orders/{order}/invoice', [CustomerOrderController::class, 'invoice'])->name('cms.customer-orders.invoice');
                Route::put('/customer-orders/{order}/status', [CustomerOrderController::class, 'updateStatus'])->middleware('cms.permission:customer-orders.edit')->name('cms.customer-orders.update-status');
                Route::put('/customer-orders/{order}/payment-status', [CustomerOrderController::class, 'updatePaymentStatus'])->middleware('cms.permission:customer-orders.edit')->name('cms.customer-orders.update-payment-status');
                Route::get('/customer-orders/{order}', [CustomerOrderController::class, 'show'])->name('cms.customer-orders.show');
            });
        });
});
