<?php

namespace App\Models\CmsKit;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuSignatureItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'image',
        'image_alt',
        'title',
        'translations',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'translations' => 'array',
        'sort_order' => 'integer',
        'status' => 'boolean',
    ];

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
