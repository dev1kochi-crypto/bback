<?php

namespace App\Http\Controllers\Api;

use App\Models\CmsKit\Enquiry;
use App\Models\CmsKit\SiteInformation;
use App\Support\SitePayloadBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function show(): JsonResponse
    {
        $locale = app()->getLocale();
        $fallbackLocale = config('app.fallback_locale', 'en');
        $siteInformation = SiteInformation::query()->first();
        $extraFields = $siteInformation?->extra_fields ?? [];
        $googleMapLink = $extraFields['google_map_link'] ?? null;
        $address = $this->translatedValue($siteInformation, 'address', $locale, $fallbackLocale);

        $site = SitePayloadBuilder::build($siteInformation);

        return response()->json([
            'site' => $site,
            'contact' => [
                'phone' => $siteInformation?->phone_1,
                'email' => $siteInformation?->email_1,
                'whatsapp' => $siteInformation?->whatsapp_number,
                'address' => $address,
                'google_map_link' => $googleMapLink,
                'map_embed_url' => $this->resolveMapEmbedUrl($googleMapLink, $address),
                'opening_hours' => $this->openingHours($siteInformation, $locale, $fallbackLocale),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $enquiry = Enquiry::query()->create([
            'name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'message' => $validated['message'],
            'page_source' => 'contact',
            'page_url' => $request->input('page_url') ?? $request->headers->get('referer'),
        ]);

        $this->notifyAdmin($enquiry);

        return response()->json([
            'message' => 'Thank you. Your message has been received.',
        ], 201);
    }

    private function notifyAdmin(Enquiry $enquiry): void
    {
        $recipient = $this->adminRecipient();

        if (! $recipient) {
            return;
        }

        Mail::send('emails.admin.contact-enquiry', ['enquiry' => $enquiry], static function ($message) use ($recipient, $enquiry): void {
            $message
                ->to($recipient)
                ->subject('New contact enquiry')
                ->replyTo($enquiry->email, $enquiry->name);
        });
    }

    private function adminRecipient(): ?string
    {
        return config('mail.admin_recipient')
            ?? SiteInformation::query()->value('receipt_email')
            ?? SiteInformation::query()->value('email_1');
    }

    private function translatedValue(?SiteInformation $siteInformation, string $field, string $locale, string $fallbackLocale): ?string
    {
        if (! $siteInformation) {
            return null;
        }

        $translations = $siteInformation->translations ?? [];

        return $translations[$locale][$field]
            ?? ($translations[$fallbackLocale][$field] ?? null)
            ?? $siteInformation->{$field};
    }

    private function openingHours(?SiteInformation $siteInformation, string $locale, string $fallbackLocale): ?string
    {
        if (! $siteInformation) {
            return null;
        }

        $translations = $siteInformation->translations ?? [];

        return data_get($translations, "{$locale}.extra_fields.opening_hours")
            ?? data_get($translations, "{$fallbackLocale}.extra_fields.opening_hours")
            ?? data_get($siteInformation->extra_fields, 'opening_hours')
            ?? null;
    }

    private function resolveMapEmbedUrl(?string $googleMapLink, ?string $address): ?string
    {
        $googleMapLink = is_string($googleMapLink) ? trim($googleMapLink) : null;
        $address = is_string($address) ? trim(strip_tags($address)) : null;

        if ($googleMapLink) {
            if (str_contains($googleMapLink, '/maps/embed')) {
                return $googleMapLink;
            }

            $query = parse_url($googleMapLink, PHP_URL_QUERY);
            parse_str($query ?: '', $params);

            $mapQuery = $params['q'] ?? $params['query'] ?? null;

            if (is_string($mapQuery) && trim($mapQuery) !== '') {
                return $this->googleMapsEmbedUrl($mapQuery);
            }

            if (preg_match('~/maps/place/([^/?#]+)~', $googleMapLink, $matches)) {
                return $this->googleMapsEmbedUrl(urldecode(str_replace('+', ' ', $matches[1])));
            }

            if (preg_match('~/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)~', $googleMapLink, $matches)) {
                return $this->googleMapsEmbedUrl($matches[1] . ',' . $matches[2]);
            }

            if ($address) {
                return $this->googleMapsEmbedUrl($address);
            }

            return $this->googleMapsEmbedUrl($googleMapLink);
        }

        if (! $address) {
            return null;
        }

        return $this->googleMapsEmbedUrl($address);
    }

    private function googleMapsEmbedUrl(string $query): string
    {
        return 'https://www.google.com/maps?q=' . urlencode(trim($query)) . '&output=embed';
    }

    private function publicStorageUrl(string $path): string
    {
        return request()->getSchemeAndHttpHost() . '/storage/' . ltrim($path, '/');
    }
}
