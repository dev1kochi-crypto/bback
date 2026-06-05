<?php

use App\Http\Controllers\Api\AboutUsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\MetadataController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\OfferController;
use App\Http\Controllers\Api\OrderProcessController;
use App\Http\Controllers\Api\SiteController;
use App\Http\Controllers\Api\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::get('/site', SiteController::class);
Route::get('/banners', BannerController::class);
Route::get('/about-us', AboutUsController::class);
Route::get('/contact', [ContactController::class, 'show']);
Route::post('/contact/enquiries', [ContactController::class, 'store']);
Route::post('/newsletter-signups', [NewsletterController::class, 'store']);
Route::get('/offers', OfferController::class);
Route::get('/menus', MenuController::class);
Route::get('/order-process', OrderProcessController::class);
Route::get('/testimonials', TestimonialController::class);
Route::get('/metadata/{pageKey}', [MetadataController::class, 'show']);
Route::get('/location/reverse-geocode', [LocationController::class, 'reverseGeocode']);

Route::prefix('auth')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/login/send-otp', [AuthController::class, 'sendLoginOtp']);
    Route::post('/login/verify-otp', [AuthController::class, 'verifyLoginOtp']);
    Route::post('/forgot-password', [AuthController::class, 'sendPasswordOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyPasswordOtp']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/social/{provider}', [AuthController::class, 'socialRedirect']);
});

Route::prefix('cart')->group(function (): void {
    Route::get('/', [CartController::class, 'show']);
    Route::get('/addresses', [CartController::class, 'addresses']);
    Route::post('/addresses', [CartController::class, 'storeAddress']);
    Route::post('/sync', [CartController::class, 'sync']);
    Route::post('/coupon', [CartController::class, 'applyCoupon']);
    Route::post('/checkout', [CartController::class, 'checkout']);
    Route::post('/checkout/verify-otp', [CartController::class, 'verifyCheckoutOtp']);
});

Route::prefix('orders')->group(function (): void {
    Route::get('/', [CustomerOrderController::class, 'index']);
    Route::get('/{orderNumber}/reorder', [CustomerOrderController::class, 'reorder']);
    Route::get('/{orderNumber}/invoice', [CustomerOrderController::class, 'invoice']);
    Route::get('/{orderNumber}', [CustomerOrderController::class, 'show']);
});
