<?php

namespace App\Models\CmsKit;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Offer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'menu_item_id',
        'image',
        'alt_text',
        'offer_percent',
        'offer_price',
        'translations',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'translations' => 'array',
        'offer_percent' => 'decimal:2',
        'offer_price' => 'decimal:2',
        'sort_order' => 'integer',
        'status' => 'boolean',
    ];

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    public function getTranslation(string $attribute, ?string $lang = null): ?string
    {
        $lang = $lang ?? app()->getLocale();

        return $this->translations[$lang][$attribute]
            ?? ($this->translations[config('app.fallback_locale')][$attribute] ?? null)
            ?? $this->{$attribute};
    }
}
