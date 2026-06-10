<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

final class PublicStorageUrl
{
    public static function make(?string $path, int|string|Carbon|null $version = null): ?string
    {
        if (! $path) {
            return null;
        }

        $url = request()->getSchemeAndHttpHost().'/storage/'.ltrim($path, '/');

        if ($version === null) {
            return $url;
        }

        if ($version instanceof Carbon) {
            $version = $version->getTimestamp();
        }

        return $url.'?v='.rawurlencode((string) $version);
    }

    public static function fromModel(?string $path, ?Model $model): ?string
    {
        return self::make($path, $model?->updated_at);
    }
}
