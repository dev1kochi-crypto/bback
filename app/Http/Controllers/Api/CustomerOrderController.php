<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmsKit\MenuItem;
use App\Models\CmsKit\SiteInformation;
use App\Models\CustomerOrder;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->userFromBearerToken($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json([
            'orders' => $user->customerOrders()
                ->latest()
                ->get()
                ->map(fn (CustomerOrder $order) => $this->orderPayload($order, false))
                ->values(),
        ]);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $user = $this->userFromBearerToken($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $order = $user->customerOrders()
            ->where('order_number', ltrim($orderNumber, '#'))
            ->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json([
            'order' => $this->orderPayload($order, true),
        ]);
    }

    public function reorder(Request $request, string $orderNumber): JsonResponse
    {
        $user = $this->userFromBearerToken($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $order = $user->customerOrders()
            ->where('order_number', ltrim($orderNumber, '#'))
            ->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        $available = [];
        $unavailable = [];

        foreach (collect($order->items ?? []) as $item) {
            $menuItemId = $item['menu_item_id'] ?? null;
            $name = $item['name'] ?? 'Menu item';
            $quantity = max((int) ($item['quantity'] ?? 1), 1);

            if (! $menuItemId) {
                $unavailable[] = [
                    'name' => $name,
                    'reason' => 'unavailable',
                ];

                continue;
            }

            $menuItem = MenuItem::active()->find($menuItemId);

            if (! $menuItem) {
                $unavailable[] = [
                    'name' => $name,
                    'reason' => 'inactive_or_removed',
                ];

                continue;
            }

            $unitPrice = (float) $menuItem->price;

            $available[] = [
                'menu_item_id' => $menuItem->id,
                'category_id' => $menuItem->menu_category_id,
                'name' => $menuItem->getTranslation('name'),
                'category_name' => $menuItem->category?->getTranslation('name'),
                'image' => $menuItem->image ? request()->getSchemeAndHttpHost() . '/storage/' . ltrim($menuItem->image, '/') : null,
                'quantity' => $quantity,
                'unit_price' => number_format($unitPrice, 2, '.', ''),
                'line_total' => number_format($unitPrice * $quantity, 2, '.', ''),
            ];
        }

        $matchedAddressId = $user->customerAddresses()
            ->where('address_line_1', $order->address_line_1)
            ->value('id');

        $unavailableNames = collect($unavailable)->pluck('name')->filter()->values()->all();
        $notice = null;

        if ($unavailableNames !== []) {
            $notice = count($unavailableNames) === 1
                ? "{$unavailableNames[0]} is no longer available and was removed from your reorder."
                : 'Some items are no longer available and were removed from your reorder: ' . implode(', ', $unavailableNames) . '.';
        }

        return response()->json([
            'items' => $available,
            'unavailable_items' => $unavailable,
            'notice' => $notice,
            'address' => [
                'address_id' => $matchedAddressId ? (int) $matchedAddressId : null,
                'name' => $order->name,
                'email' => $order->email,
                'phone' => $order->phone,
                'city' => $order->city,
                'postal_code' => $order->postal_code,
                'address_line_1' => $order->address_line_1,
                'address_line_2' => $order->address_line_2,
                'landmark' => $order->landmark,
                'address_type' => $order->address_type ?? 'home',
                'latitude' => $order->latitude === null ? null : (float) $order->latitude,
                'longitude' => $order->longitude === null ? null : (float) $order->longitude,
                'notes' => $order->notes,
            ],
        ]);
    }

    public function invoice(Request $request, string $orderNumber)
    {
        $user = $this->userFromBearerToken($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $order = $user->customerOrders()
            ->where('order_number', ltrim($orderNumber, '#'))
            ->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return Pdf::loadView('invoices.customer-order', [
            'order' => $order,
            'logoSrc' => $this->invoiceLogoSrc(),
        ])->setPaper('a4')->download($this->invoiceFilename($order));
    }

    private function orderPayload(CustomerOrder $order, bool $withDetails): array
    {
        $items = collect($order->items ?? [])->map(function (array $item): array {
            return [
                'menu_item_id' => $item['menu_item_id'] ?? null,
                'category_id' => $item['category_id'] ?? null,
                'name' => $item['name'] ?? 'Menu item',
                'category_name' => $item['category_name'] ?? null,
                'image' => $item['image'] ?? null,
                'quantity' => (int) ($item['quantity'] ?? 1),
                'unit_price' => number_format((float) ($item['unit_price'] ?? 0), 2, '.', ''),
                'line_total' => number_format((float) ($item['line_total'] ?? 0), 2, '.', ''),
            ];
        })->values();

        $payload = [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'display_order_number' => $order->display_order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status ?? 'pending',
            'coupon_code' => $order->coupon_code,
            'subtotal' => number_format((float) $order->subtotal, 2, '.', ''),
            'discount_amount' => number_format((float) $order->discount_amount, 2, '.', ''),
            'delivery_charge_amount' => number_format((float) $order->delivery_charge_amount, 2, '.', ''),
            'tax_amount' => number_format((float) $order->tax_amount, 2, '.', ''),
            'total' => number_format((float) $order->total, 2, '.', ''),
            'items_count' => $items->sum('quantity'),
            'first_item' => $items->first(),
            'created_at' => $order->created_at?->toISOString(),
        ];

        if ($withDetails) {
            $payload += [
                'items' => $items->all(),
                'name' => $order->name,
                'email' => $order->email,
                'phone' => $order->phone,
                'city' => $order->city,
                'postal_code' => $order->postal_code,
                'address_line_1' => $order->address_line_1,
                'address_line_2' => $order->address_line_2,
                'landmark' => $order->landmark,
                'address_type' => $order->address_type,
                'notes' => $order->notes,
                'latitude' => $order->latitude === null ? null : (float) $order->latitude,
                'longitude' => $order->longitude === null ? null : (float) $order->longitude,
            ];
        }

        return $payload;
    }

    private function userFromBearerToken(Request $request): ?User
    {
        $token = $request->bearerToken() ?: $request->query('token');

        return $token ? User::query()->where('remember_token', $token)->first() : null;
    }

    private function invoiceLogoSrc(): ?string
    {
        $siteLogo = SiteInformation::query()->value('logo');
        $paths = array_filter([
            public_path('app/images/b-back-invoice-logo.svg'),
            public_path('app/images/b-back-black-logo.svg'),
            $siteLogo ? public_path('storage/' . ltrim($siteLogo, '/')) : null,
            base_path('frontend/public/app/images/logo.svg'),
        ]);

        foreach ($paths as $path) {
            if (is_file($path)) {
                $contents = file_get_contents($path);

                if ($contents === false) {
                    continue;
                }

                $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                $mime = match ($extension) {
                    'png' => 'image/png',
                    'jpg', 'jpeg' => 'image/jpeg',
                    'webp' => 'image/webp',
                    default => 'image/svg+xml',
                };

                return 'data:' . $mime . ';base64,' . base64_encode($contents);
            }
        }

        return null;
    }

    private function invoiceFilename(CustomerOrder $order): string
    {
        return 'invoice-' . str_replace('#', '', $order->display_order_number) . '.pdf';
    }
}
