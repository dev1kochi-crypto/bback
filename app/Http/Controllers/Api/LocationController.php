<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LocationController extends Controller
{
    public function reverseGeocode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $latitude = (float) $data['latitude'];
        $longitude = (float) $data['longitude'];

        return response()->json($this->resolveReverseGeocode($latitude, $longitude));
    }

    private function resolveReverseGeocode(float $latitude, float $longitude): array
    {
        $googleKey = config('services.google_maps.key');
        $mapboxToken = config('services.mapbox.token');

        if ($googleKey && str_starts_with($googleKey, 'pk.')) {
            $mapboxToken = $googleKey;
            $googleKey = null;
        }

        if ($googleKey) {
            $googleResult = $this->reverseGeocodeWithGoogle($latitude, $longitude);

            if ($this->hasAddress($googleResult)) {
                return $googleResult;
            }
        }

        if ($mapboxToken) {
            $mapboxResult = $this->reverseGeocodeWithMapbox($latitude, $longitude, $mapboxToken);

            if ($this->hasAddress($mapboxResult)) {
                return $mapboxResult;
            }
        }

        return $this->reverseGeocodeWithOpenStreetMap($latitude, $longitude);
    }

    private function reverseGeocodeWithGoogle(float $latitude, float $longitude): array
    {
        $response = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
            'latlng' => "{$latitude},{$longitude}",
            'key' => config('services.google_maps.key'),
            'result_type' => 'street_address|premise|subpremise|route|sublocality|postal_code',
        ]);

        if ($response->failed()) {
            return [];
        }

        $result = collect($response->json('results', []))->first();

        if (! $result) {
            return [];
        }

        $components = collect($result['address_components'] ?? []);
        $component = static function (string $type) use ($components): ?string {
            $match = $components->first(fn (array $component): bool => in_array($type, $component['types'] ?? [], true));

            return $match['long_name'] ?? null;
        };

        $street = collect([
            $component('street_number'),
            $component('route'),
            $component('sublocality_level_2'),
            $component('sublocality_level_1'),
        ])->filter()->unique()->implode(', ');

        return [
            'city' => $component('locality') ?? $component('administrative_area_level_3') ?? $component('administrative_area_level_2'),
            'postal_code' => $component('postal_code'),
            'address_line_1' => $street ?: ($result['formatted_address'] ?? null),
            'formatted_address' => $result['formatted_address'] ?? null,
            'provider' => 'google',
        ];
    }

    private function reverseGeocodeWithMapbox(float $latitude, float $longitude, string $token): array
    {
        $response = Http::get("https://api.mapbox.com/geocoding/v5/mapbox.places/{$longitude},{$latitude}.json", [
            'access_token' => $token,
            'types' => 'address,poi,neighborhood,locality,place,postcode,district',
            'country' => 'in',
            'limit' => 5,
        ]);

        if ($response->failed()) {
            return [];
        }

        $feature = collect($response->json('features', []))
            ->sortBy(fn (array $feature): int => $this->mapboxFeatureRank($feature))
            ->first();

        if (! $feature) {
            return [];
        }

        $context = collect($feature['context'] ?? []);
        $contextValue = static function (string $prefix) use ($context): ?string {
            $match = $context->first(fn (array $item): bool => str_starts_with($item['id'] ?? '', $prefix));

            return $match['text'] ?? null;
        };

        $locality = $contextValue('locality') ?? $contextValue('neighborhood');
        $street = collect([
            $feature['address'] ?? null,
            $feature['text'] ?? null,
            $locality,
        ])->filter()->unique()->implode(', ');

        return [
            'city' => $contextValue('place') ?? $contextValue('district') ?? $locality,
            'postal_code' => $contextValue('postcode') ?? (in_array('postcode', $feature['place_type'] ?? [], true) ? ($feature['text'] ?? null) : null),
            'address_line_1' => $street ?: ($feature['place_name'] ?? null),
            'formatted_address' => $feature['place_name'] ?? null,
            'provider' => 'mapbox',
        ];
    }

    private function mapboxFeatureRank(array $feature): int
    {
        $types = $feature['place_type'] ?? [];

        foreach (['address', 'poi', 'neighborhood', 'locality', 'place', 'postcode', 'district'] as $rank => $type) {
            if (in_array($type, $types, true)) {
                return $rank;
            }
        }

        return 99;
    }

    private function reverseGeocodeWithOpenStreetMap(float $latitude, float $longitude): array
    {
        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'User-Agent' => config('app.name', 'B.back') . ' checkout reverse geocoder',
        ])->get('https://nominatim.openstreetmap.org/reverse', [
            'format' => 'jsonv2',
            'lat' => $latitude,
            'lon' => $longitude,
            'addressdetails' => 1,
            'zoom' => 18,
        ]);

        if ($response->failed()) {
            return [];
        }

        $address = $response->json('address', []);
        $street = collect([
            $address['road'] ?? null,
            $address['suburb'] ?? null,
            $address['neighbourhood'] ?? null,
            $address['quarter'] ?? null,
            $address['city_district'] ?? null,
        ])->filter()->unique()->implode(', ');

        return [
            'city' => $address['city'] ?? $address['town'] ?? $address['village'] ?? $address['municipality'] ?? $address['county'] ?? null,
            'postal_code' => $address['postcode'] ?? null,
            'address_line_1' => $street ?: ($response->json('display_name') ?: null),
            'formatted_address' => $response->json('display_name'),
            'provider' => 'openstreetmap',
        ];
    }

    private function hasAddress(array $result): bool
    {
        return (bool) ($result['address_line_1'] ?? $result['city'] ?? $result['postal_code'] ?? null);
    }
}
