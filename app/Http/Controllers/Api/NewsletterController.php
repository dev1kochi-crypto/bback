<?php

namespace App\Http\Controllers\Api;

use App\Models\CmsKit\NewsletterSignup;
use App\Models\CmsKit\SiteInformation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $signup = NewsletterSignup::query()->firstOrCreate([
            'email' => $data['email'],
        ]);

        $this->notifyAdmin($signup);

        return response()->json([
            'message' => $signup->wasRecentlyCreated
                ? 'Thanks for subscribing.'
                : 'You are already subscribed.',
        ], $signup->wasRecentlyCreated ? 201 : 200);
    }

    private function notifyAdmin(NewsletterSignup $signup): void
    {
        $recipient = $this->adminRecipient();

        if (! $recipient) {
            return;
        }

        Mail::send('emails.admin.newsletter-signup', ['signup' => $signup], static function ($message) use ($recipient, $signup): void {
            $message
                ->to($recipient)
                ->subject('New newsletter signup')
                ->replyTo($signup->email);
        });
    }

    private function adminRecipient(): ?string
    {
        return config('mail.admin_recipient')
            ?? SiteInformation::query()->value('receipt_email')
            ?? SiteInformation::query()->value('email_1');
    }
}
