<?php

namespace App\Models\CmsKit;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AboutUs extends Model
{
    use SoftDeletes;

    protected $table = 'about_us';

    protected $fillable = [
        'line_1',
        'line_2',
        'about_page_title',
        'short_description',
        'long_description',
        'button_text',
        'button_url',
        'video_type',
        'video_url',
        'video_file',
        'video_thumbnail',
        'mission',
        'vision',
        'core_value',
        'translations',
        'extra_fields',
        'is_active',
    ];

    protected $casts = [
        'translations' => 'array',
        'extra_fields' => 'array',
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
