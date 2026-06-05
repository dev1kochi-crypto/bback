<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerOrder extends Model
{
    protected $fillable = [
        'user_id',
        'customer_address_id',
        'order_number',
        'items',
        'coupon_code',
        'subtotal',
        'discount_amount',
        'delivery_charge_amount',
        'tax_amount',
        'total',
        'name',
        'email',
        'phone',
        'city',
        'postal_code',
        'address_line_1',
        'address_line_2',
        'landmark',
        'address_type',
        'latitude',
        'longitude',
        'notes',
        'status',
        'payment_status',
    ];

    protected $casts = [
        'items' => 'array',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'delivery_charge_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getDisplayOrderNumberAttribute(): string
    {
        $number = (string) $this->order_number;

        if (preg_match('/^BB-\d{6}$/', $number)) {
            return '#' . $number;
        }

        if (preg_match('/^BB-\d{8}-[A-Z0-9]{6}$/i', $number)) {
            return '#BB-' . str_pad((string) $this->id, 6, '0', STR_PAD_LEFT);
        }

        return '#' . ltrim($number, '#');
    }
}
