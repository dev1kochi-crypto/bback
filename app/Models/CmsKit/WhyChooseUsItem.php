<?php

namespace App\Models\CmsKit;

use Illuminate\Database\Eloquent\Model;

class WhyChooseUsItem extends Model
{
    protected $fillable = [
        'icon',
        'icon_alt',
        'line_1',
        'line_2',
        'translations',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'translations' => 'array',
        'is_active' => 'boolean',
    ];

    public function getTranslation(string $attribute, ?string $lang = null): ?string
    {
        $lang = $lang ?? app()->getLocale();

        return $this->translations[$lang][$attribute]
            ?? ($this->translations[config('app.fallback_locale')][$attribute] ?? null)
            ?? $this->{$attribute};
    }
}
