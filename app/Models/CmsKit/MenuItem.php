<?php

namespace App\Models\CmsKit;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuItem extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'menu_category_id',
        'image',
        'image_alt',
        'name',
        'description',
        'translations',
        'spicy',
        'food_type',
        'price',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'translations' => 'array',
        'spicy' => 'boolean',
        'price' => 'decimal:2',
        'sort_order' => 'integer',
        'status' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id');
    }

    public function signatureItem(): HasOne
    {
        return $this->hasOne(MenuSignatureItem::class);
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
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
