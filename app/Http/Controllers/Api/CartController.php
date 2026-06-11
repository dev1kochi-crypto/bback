<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CmsKit\SiteInformation;
use App\Models\Coupon;
use App\Models\CustomerAddress;
use App\Models\CustomerOrder;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $this->userFromBearerToken($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json($this->cartPayload($this->cartForUser($user)));
    }

    public function sync(Request $request): JsonResponse
    {
        $user = $this->userFromBearerToken($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $data = $request->validate([
            'items' => ['array'],
            'items.*.menu_item_id' => ['required', 'integer', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'coupon_code' => ['nullable', 'string', 'max:80'],
        ]);

        $cart = $this->cartForUser($user);
        $cart->items()->delete();

        foreach ($data['items'] ?? [] as $item) {
            $menuItem = \App\Models\CmsKit\MenuItem::active()->findOrFail($item['menu_item_id']);
            $cart->items()->create([
                'menu_item_id' => $menuItem->id,
                'quantity' => $item['quantity'],
                'unit_price' => $menuItem->price,
            ]);
        }

        $couponCode = strtoupper(trim((string) ($data['coupon_code'] ?? '')));

        $couponCode = $this->validCouponCodeForCart($cart->load('items.menuItem.category'), $couponCode);

        $cart->update(['coupon_code' => $couponCode]);

        return response()->json($this->cartPayload($cart->fresh(['items.menuItem.category'])));
    }

    public function applyCoupon(Request $request): JsonResponse
    {
        $user = $this->userFromBearerToken($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $data = $request->validate([
            'code' => ['nullable', 'string', 'max:80'],
        ]);

        $cart = $this->cartForUser($user);
        $code = strtoupper(trim((string) ($data['code'] ?? '')));

        if ($code !== '') {
            $this->calculateTotals($cart->load('items.menuItem.category'), $code);
        }

        $cart->update(['coupon_code' => $code ?: null]);

        return response()->json($this->cartPayload($cart->fresh(['items.menuItem.category'])));
    }

    public function addresses(Request $request): JsonResponse
    {
        $user = $this->userFromBearerToken($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json([
            'addresses' => $user->customerAddresses()
                ->latest('is_default')
                ->latest()
                ->get()
                ->map(fn (CustomerAddress $address) => $this->addressPayload($address))
                ->values(),
        ]);
    }

    public function storeAddress(Request $request): JsonResponse
    {
        $user = $this->userFromBearerToken($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $address = $this->saveAddress($user, $this->validatedAddress($request));

        return response()->json([
            'message' => 'Address saved successfully.',
            'address' => $this->addressPayload($address),
        ]);
    }

    public function checkout(Request $request): JsonResponse
    {
        $user = $this->userFromBearerToken($request);
        $data = $this->validatedCheckout($request);

        if (! $user) {
            return $this->sendGuestCheckoutOtp($data);
        }

        $result = $this->placeCheckoutOrder($user, $data);

        return response()->json([
            'message' => 'Order placed successfully.',
            'order_number' => $result['order']->order_number,
            'token' => null,
            'user' => null,
            'address' => $this->addressPayload($result['address']),
            'password_setup_required' => false,
            'otp_required' => false,
        ]);
    }

    public function verifyCheckoutOtp(Request $request): JsonResponse
    {
        $data = $this->validatedCheckout($request);
        $otpData = $request->validate([
            'otp' => ['required', 'digits:4'],
        ]);

        $phone = $this->normalizePhoneNumber($data['phone']);
        $user = User::query()->where('phone', $phone)->first();

        if (! $user || ! $user->phone_login_otp) {
            throw ValidationException::withMessages([
                'otp' => 'Invalid or expired OTP code.',
            ]);
        }

        if ($user->phone_login_otp_expires_at?->isPast()) {
            throw ValidationException::withMessages([
                'otp' => 'OTP code has expired. Please request a new code.',
            ]);
        }

        if (! Hash::check($otpData['otp'], $user->phone_login_otp)) {
            throw ValidationException::withMessages([
                'otp' => 'Invalid OTP code.',
            ]);
        }

        $result = $this->placeCheckoutOrder($user, $data);
        $token = Str::random(80);

        $user->forceFill([
            'remember_token' => $token,
            'phone_login_otp' => null,
            'phone_login_otp_expires_at' => null,
        ])->save();

        return response()->json([
            'message' => 'Order placed successfully.',
            'order_number' => $result['order']->order_number,
            'token' => $token,
            'user' => $this->userPayload($user),
            'address' => $this->addressPayload($result['address']),
            'password_setup_required' => true,
            'otp_required' => false,
        ]);
    }

    private function placeCheckoutOrder(User $user, array $data): array
    {
        $this->syncUserContactFromCheckout($user, $data);
        $this->syncCheckoutItems($user, $data['items'] ?? null, $data['coupon_code'] ?? null);

        $cart = $this->cartForUser($user)->load('items.menuItem.category');

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages(['cart' => 'Cart is empty.']);
        }

        $address = isset($data['address_id'])
            ? $user->customerAddresses()->find($data['address_id'])
            : null;

        if (isset($data['address_id']) && ! $address) {
            throw ValidationException::withMessages(['address_id' => 'Selected address was not found.']);
        }

        if (! $address) {
            $address = $this->saveAddress($user, $data);
        } elseif (($data['is_default'] ?? false) || ! $user->customerAddresses()->where('is_default', true)->exists()) {
            $this->setDefaultAddress($address);
        }

        $couponCode = $this->validCouponCodeForCart($cart, $cart->coupon_code);
        $totals = $this->calculateTotals($cart, $couponCode);
        $order = CustomerOrder::create([
            'user_id' => $user->id,
            'customer_address_id' => $address->id,
            'order_number' => $this->generateOrderNumber(),
            'items' => $totals['items'],
            'coupon_code' => $couponCode,
            'subtotal' => $totals['subtotal'],
            'discount_amount' => $totals['discount_amount'],
            'delivery_charge_amount' => $totals['delivery_charge_amount'],
            'tax_amount' => $totals['tax_amount'],
            'total' => $totals['total'],
            'name' => $address->name,
            'email' => $address->email,
            'phone' => $address->phone,
            'city' => $address->city,
            'postal_code' => $address->postal_code,
            'address_line_1' => $address->address_line_1,
            'address_line_2' => $address->address_line_2,
            'landmark' => $address->landmark,
            'address_type' => $address->address_type,
            'latitude' => $address->latitude,
            'longitude' => $address->longitude,
            'notes' => $data['notes'] ?? null,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        if ($couponCode) {
            Coupon::where('code', $couponCode)->increment('used_count');
        }

        $this->sendOrderWhatsappNotification($order);

        $cart->items()->delete();
        $cart->update(['coupon_code' => null]);

        return ['order' => $order, 'address' => $address];
    }

    private function sendGuestCheckoutOtp(array $data): JsonResponse
    {
        $phone = $this->normalizePhoneNumber($data['phone']);
        $user = User::query()->where('phone', $phone)->first();

        if (empty($data['items'])) {
            throw ValidationException::withMessages(['cart' => 'Cart is empty.']);
        }

        $otp = $this->generatePhoneOtp();
        $user ??= User::create([
            'name' => $data['name'],
            'email' => strtolower(trim((string) $data['email'])),
            'phone' => $phone,
            'password' => Str::random(40),
        ]);

        $user->forceFill([
            'phone' => $phone,
            'phone_login_otp' => Hash::make($otp),
            'phone_login_otp_expires_at' => now()->addMinutes(10),
        ])->save();

        if (! $this->phoneOtpTestEnabled()) {
            $this->sendSms(
                $phone,
                "Your B.back checkout OTP is {$otp}. This code expires in 10 minutes."
            );
        }

        return response()->json([
            'message' => 'OTP sent to your phone number.',
            'otp_required' => true,
        ], 202);
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'BB-' . random_int(100000, 999999);
        } while (CustomerOrder::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    private function syncUserContactFromCheckout(User $user, array $data): void
    {
        $updates = [];
        $email = strtolower(trim((string) ($data['email'] ?? '')));

        if ($email !== '' && blank($user->email)) {
            $updates['email'] = $email;
        }

        if (! empty($data['name']) && ($user->name === 'Customer' || trim((string) $user->name) === '')) {
            $updates['name'] = $data['name'];
        }

        if (! empty($data['phone']) && blank($user->phone)) {
            $updates['phone'] = $this->normalizePhoneNumber($data['phone']);
        }

        if ($updates !== []) {
            $user->forceFill($updates)->save();
        }
    }

    private function validatedCheckout(Request $request): array
    {
        return $request->validate([
            'address_id' => ['nullable', 'integer', 'exists:customer_addresses,id'],
            'items' => ['nullable', 'array'],
            'items.*.menu_item_id' => ['required', 'integer', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'coupon_code' => ['nullable', 'string', 'max:80'],
            ...$this->addressValidationRules(),
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
    }

    private function validatedAddress(Request $request): array
    {
        return $request->validate($this->addressValidationRules());
    }

    private function addressValidationRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['required', 'string', 'max:40'],
            'city' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:30'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'landmark' => ['nullable', 'string', 'max:255'],
            'address_type' => ['nullable', 'in:home,office,other'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }

    private function saveAddress(User $user, array $data): CustomerAddress
    {
        $address = $user->customerAddresses()->create([
            'name' => $data['name'],
            'email' => strtolower(trim((string) $data['email'])),
            'phone' => $this->normalizePhoneNumber($data['phone']),
            'city' => $data['city'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'address_line_1' => $data['address_line_1'],
            'address_line_2' => $data['address_line_2'] ?? null,
            'landmark' => $data['landmark'] ?? null,
            'address_type' => $data['address_type'] ?? 'home',
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'is_default' => (bool) ($data['is_default'] ?? false),
        ]);

        if ($address->is_default || ! $user->customerAddresses()->whereKeyNot($address->id)->exists()) {
            $this->setDefaultAddress($address);
        }

        return $address->fresh();
    }

    private function setDefaultAddress(CustomerAddress $address): void
    {
        CustomerAddress::query()
            ->where('user_id', $address->user_id)
            ->whereKeyNot($address->id)
            ->update(['is_default' => false]);

        $address->forceFill(['is_default' => true])->save();
    }

    private function syncCheckoutItems(User $user, ?array $items, ?string $couponCode): void
    {
        if ($items === null) {
            return;
        }

        $cart = $this->cartForUser($user);
        $cart->items()->delete();

        foreach ($items as $item) {
            $menuItem = \App\Models\CmsKit\MenuItem::active()->findOrFail($item['menu_item_id']);
            $cart->items()->create([
                'menu_item_id' => $menuItem->id,
                'quantity' => $item['quantity'],
                'unit_price' => $menuItem->price,
            ]);
        }

        $code = $this->validCouponCodeForCart($cart->load('items.menuItem.category'), $couponCode);

        $cart->update(['coupon_code' => $code]);
    }

    private function addressPayload(CustomerAddress $address): array
    {
        return [
            'id' => $address->id,
            'name' => $address->name,
            'email' => $address->email,
            'phone' => $address->phone,
            'city' => $address->city,
            'postal_code' => $address->postal_code,
            'address_line_1' => $address->address_line_1,
            'address_line_2' => $address->address_line_2,
            'landmark' => $address->landmark,
            'address_type' => $address->address_type,
            'latitude' => $address->latitude === null ? null : (float) $address->latitude,
            'longitude' => $address->longitude === null ? null : (float) $address->longitude,
            'is_default' => $address->is_default,
        ];
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
        ];
    }

    private function sendSms(string $to, string $body): void
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.from');

        if (! $sid || ! $token || ! $from) {
            throw ValidationException::withMessages([
                'phone' => 'Phone OTP service is not configured yet.',
            ]);
        }

        $response = Http::asForm()
            ->withBasicAuth($sid, $token)
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                'From' => $from,
                'To' => $to,
                'Body' => $body,
            ]);

        if ($response->failed()) {
            $twilioMessage = $response->json('message');

            throw ValidationException::withMessages([
                'phone' => $twilioMessage ? "Could not send OTP: {$twilioMessage}" : 'Could not send OTP to this phone number.',
            ]);
        }
    }

    private function sendOrderWhatsappNotification(CustomerOrder $order): void
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = $this->whatsappAddress(config('services.twilio.whatsapp_from'));
        $to = $this->whatsappAddress(SiteInformation::query()->value('whatsapp_number'));

        if (! $sid || ! $token || ! $from || ! $to) {
            report(new \RuntimeException('Order WhatsApp notification skipped: Twilio WhatsApp settings or Site Information Main WhatsApp Number is missing.'));

            return;
        }

        $response = Http::asForm()
            ->withBasicAuth($sid, $token)
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                'From' => $from,
                'To' => $to,
                'Body' => $this->orderWhatsappMessage($order),
            ]);

        if ($response->failed()) {
            report(new \RuntimeException('Could not send order WhatsApp notification: ' . ($response->json('message') ?? $response->body())));
        }
    }

    private function orderWhatsappMessage(CustomerOrder $order): string
    {
        $items = collect($order->items ?? [])
            ->map(function (array $item, int $index): string {
                $quantity = (int) ($item['quantity'] ?? 1);
                $unitPrice = number_format((float) ($item['unit_price'] ?? 0), 2);
                $lineTotal = number_format((float) ($item['line_total'] ?? 0), 2);
                $category = trim((string) ($item['category_name'] ?? ''));

                return ($index + 1) . ". " . ($item['name'] ?? 'Menu item')
                    . ($category !== '' ? " ({$category})" : '')
                    . "\n   Qty: {$quantity} | Unit: {$unitPrice} GEL | Total: {$lineTotal} GEL";
            })
            ->implode("\n");

        $address = collect([
            $order->address_line_1,
            $order->address_line_2,
            $order->city,
            $order->postal_code,
        ])->filter()->implode(', ');

        $mapLink = $order->latitude && $order->longitude
            ? 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($order->latitude . ',' . $order->longitude)
            : null;
        $location = $mapLink
            ? "Map: {$mapLink}\n"
            : '';
        $status = trim((string) $order->status) !== ''
            ? ucwords(str_replace('_', ' ', (string) $order->status))
            : 'Pending';
        $amountLines = [
            'Products: ' . number_format((float) $order->subtotal, 2) . ' GEL',
        ];

        if ((float) $order->discount_amount > 0) {
            $amountLines[] = 'Discount: ' . number_format((float) $order->discount_amount, 2) . ' GEL';
        }

        if ((float) $order->delivery_charge_amount > 0) {
            $amountLines[] = 'Delivery: ' . number_format((float) $order->delivery_charge_amount, 2) . ' GEL';
        }

        if ((float) $order->tax_amount > 0) {
            $amountLines[] = 'Tax: ' . number_format((float) $order->tax_amount, 2) . ' GEL';
        }

        $amountLines[] = 'Total: ' . number_format((float) $order->total, 2) . ' GEL';

        return trim("*New B.back Order Confirmed*\n\n"
            . "*Order*\n"
            . "Order ID: {$order->display_order_number}\n"
            . "Date: " . ($order->created_at?->format('d M Y h:i A') ?? now()->format('d M Y h:i A')) . "\n"
            . "Status: {$status}\n"
            . "Payment: Cash on Delivery\n\n"
            . "*Customer*\n"
            . "Name: {$order->name}\n"
            . "Phone: {$order->phone}\n"
            . "Email: " . ($order->email ?: 'Not provided') . "\n\n"
            . "*Delivery Address*\n"
            . ($address ?: 'Address not provided') . "\n"
            . ($order->landmark ? "Landmark: {$order->landmark}\n" : '')
            . $location
            . "\n*Items*\n{$items}\n\n"
            . "*Amount Summary*\n"
            . implode("\n", $amountLines) . "\n"
            . ($order->coupon_code ? "Coupon: {$order->coupon_code}\n" : '')
            . ($order->notes ? "\n*Order Notes*\n{$order->notes}" : ''));
    }

    private function whatsappAddress(?string $phone): ?string
    {
        $phone = trim((string) $phone);

        if ($phone === '') {
            return null;
        }

        if (str_starts_with($phone, 'whatsapp:')) {
            return $phone;
        }

        return 'whatsapp:' . $this->normalizePhoneNumber($phone);
    }

    private function normalizePhoneNumber(string $phone): string
    {
        $phone = trim($phone);

        if (str_starts_with($phone, '+')) {
            return $phone;
        }

        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if (strlen($digits) === 10) {
            return '+91' . $digits;
        }

        if (strlen($digits) === 12 && str_starts_with($digits, '91')) {
            return '+' . $digits;
        }

        return $phone;
    }

    private function generatePhoneOtp(): string
    {
        if ($this->phoneOtpTestEnabled()) {
            return $this->phoneOtpTestCode();
        }

        return (string) random_int(1000, 9999);
    }

    private function phoneOtpTestEnabled(): bool
    {
        return (bool) config('services.phone_otp.test_enabled');
    }

    private function phoneOtpTestCode(): string
    {
        $code = preg_replace('/\D+/', '', (string) config('services.phone_otp.test_code')) ?: '1234';

        return str_pad(substr($code, 0, 4), 4, '0');
    }

    private function cartForUser(User $user): Cart
    {
        return Cart::firstOrCreate(['user_id' => $user->id])->load('items.menuItem.category');
    }

    private function cartPayload(Cart $cart): array
    {
        $couponCode = $this->validCouponCodeForCart($cart, $cart->coupon_code);

        if ($couponCode === null && $cart->coupon_code) {
            $cart->update(['coupon_code' => null]);
        }

        $totals = $this->calculateTotals($cart, $couponCode, false);

        return [
            'items' => $totals['items'],
            'coupon_code' => $couponCode,
            'subtotal' => number_format($totals['subtotal'], 2, '.', ''),
            'discount_amount' => number_format($totals['discount_amount'], 2, '.', ''),
            'delivery_charge_amount' => number_format($totals['delivery_charge_amount'], 2, '.', ''),
            'tax_amount' => number_format($totals['tax_amount'], 2, '.', ''),
            'total' => number_format($totals['total'], 2, '.', ''),
        ];
    }

    private function calculateTotals(Cart $cart, ?string $couponCode = null, bool $throw = true): array
    {
        $items = $cart->items->map(function (CartItem $cartItem) {
            $menuItem = $cartItem->menuItem;
            $unitPrice = (float) $cartItem->unit_price;
            $quantity = $cartItem->quantity;

            return [
                'id' => $cartItem->id,
                'menu_item_id' => $menuItem->id,
                'category_id' => $menuItem->menu_category_id,
                'name' => $menuItem->getTranslation('name'),
                'category_name' => $menuItem->category?->getTranslation('name'),
                'image' => $menuItem->image ? request()->getSchemeAndHttpHost() . '/storage/' . ltrim($menuItem->image, '/') : null,
                'quantity' => $quantity,
                'unit_price' => number_format($unitPrice, 2, '.', ''),
                'line_total' => number_format($unitPrice * $quantity, 2, '.', ''),
            ];
        })->values()->all();

        $subtotal = collect($items)->sum(fn ($item) => (float) $item['line_total']);
        $discount = 0.0;

        if ($couponCode) {
            $coupon = Coupon::active()->where('code', strtoupper($couponCode))->first();
            $error = $this->couponError($coupon, $subtotal);

            if ($error && $throw) {
                throw ValidationException::withMessages(['code' => $error]);
            }

            if (! $error && $coupon) {
                $eligible = collect($items)->filter(function ($item) use ($coupon) {
                    if ($coupon->menu_item_id) {
                        return (int) $item['menu_item_id'] === (int) $coupon->menu_item_id;
                    }

                    if ($coupon->menu_category_id) {
                        return (int) $item['category_id'] === (int) $coupon->menu_category_id;
                    }

                    return true;
                });
                $eligibleSubtotal = $eligible->sum(fn ($item) => (float) $item['line_total']);
                $discount = $coupon->discount_type === 'percent'
                    ? $eligibleSubtotal * ((float) $coupon->discount_value / 100)
                    : min((float) $coupon->discount_value, $eligibleSubtotal);

                if ($coupon->maximum_discount_amount) {
                    $discount = min($discount, (float) $coupon->maximum_discount_amount);
                }
            }
        }

        $discountedSubtotal = max(round($subtotal - $discount, 2), 0);
        $pricing = $this->deliveryTaxSettings();
        $deliveryCharge = $this->deliveryChargeForSubtotal($discountedSubtotal, $pricing);
        $taxAmount = $discountedSubtotal > 0 ? $pricing['tax_amount'] : 0.0;

        return [
            'items' => $items,
            'subtotal' => $subtotal,
            'discount_amount' => round($discount, 2),
            'delivery_charge_amount' => $deliveryCharge,
            'tax_amount' => $taxAmount,
            'total' => round($discountedSubtotal + $deliveryCharge + $taxAmount, 2),
        ];
    }

    private function deliveryTaxSettings(): array
    {
        $siteInformation = SiteInformation::query()->first();

        return [
            'delivery_free_above_amount' => max((float) ($siteInformation?->delivery_free_above_amount ?? 0), 0),
            'delivery_charge_amount' => max((float) ($siteInformation?->delivery_charge_amount ?? 0), 0),
            'tax_amount' => max((float) ($siteInformation?->tax_amount ?? 0), 0),
        ];
    }

    private function deliveryChargeForSubtotal(float $discountedSubtotal, array $pricing): float
    {
        if ($discountedSubtotal <= 0) {
            return 0.0;
        }

        $freeAbove = $pricing['delivery_free_above_amount'];

        if ($freeAbove > 0 && $discountedSubtotal >= $freeAbove) {
            return 0.0;
        }

        return round($pricing['delivery_charge_amount'], 2);
    }

    private function validCouponCodeForCart(Cart $cart, ?string $couponCode): ?string
    {
        $code = strtoupper(trim((string) $couponCode));

        if ($code === '') {
            return null;
        }

        $subtotal = $cart->items->sum(fn (CartItem $cartItem) => (float) $cartItem->unit_price * $cartItem->quantity);
        $coupon = Coupon::active()->where('code', $code)->first();

        return $this->couponError($coupon, $subtotal) ? null : $code;
    }

    private function couponError(?Coupon $coupon, float $subtotal): ?string
    {
        if (! $coupon) {
            return 'Invalid promo code.';
        }

        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            return 'Promo code is not active yet.';
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return 'Promo code has expired.';
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return 'Promo code usage limit reached.';
        }

        if ($subtotal < (float) $coupon->minimum_order_amount) {
            return 'Minimum order amount not reached for this promo code.';
        }

        return null;
    }

    private function userFromBearerToken(Request $request): ?User
    {
        $token = $request->bearerToken();

        return $token ? User::query()->where('remember_token', $token)->first() : null;
    }
}
