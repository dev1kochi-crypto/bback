<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        $token = Str::random(80);
        $user->forceFill(['remember_token' => $token])->save();

        return response()->json([
            'message' => 'Logged in successfully.',
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function sendLoginOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:40'],
        ]);

        $phone = $this->normalizePhoneNumber($data['phone']);
        $user = User::query()->where('phone', $phone)->first();

        $user ??= User::query()->create([
            'name' => 'Customer',
            'phone' => $phone,
            'password' => Str::random(40),
        ]);

        $otp = $this->generatePhoneOtp();
        $user->forceFill([
            'phone' => $phone,
            'phone_login_otp' => Hash::make($otp),
            'phone_login_otp_expires_at' => now()->addMinutes(10),
        ])->save();

        if (! $this->phoneOtpTestEnabled()) {
            $this->sendSms($phone, "Your B.back login OTP is {$otp}. This code expires in 10 minutes.");
        }

        return response()->json([
            'message' => 'OTP sent to your phone number.',
        ]);
    }

    public function verifyLoginOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:40'],
            'otp' => ['required', 'digits:4'],
        ]);

        $phone = $this->normalizePhoneNumber($data['phone']);
        $user = User::query()->where('phone', $phone)->first();

        if (! $user || ! $user->phone_login_otp) {
            throw ValidationException::withMessages([
                'otp' => 'Invalid OTP code.',
            ]);
        }

        if ($user->phone_login_otp_expires_at?->isPast()) {
            throw ValidationException::withMessages([
                'otp' => 'OTP code has expired. Please request a new code.',
            ]);
        }

        if (! Hash::check($data['otp'], $user->phone_login_otp)) {
            throw ValidationException::withMessages([
                'otp' => 'Invalid OTP code.',
            ]);
        }

        $token = Str::random(80);
        $user->forceFill([
            'remember_token' => $token,
            'phone_login_otp' => null,
            'phone_login_otp_expires_at' => null,
        ])->save();

        return response()->json([
            'message' => 'Logged in successfully.',
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function sendPasswordOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();

        if ($user) {
            $otp = (string) random_int(1000, 9999);

            $user->forceFill([
                'password_reset_otp' => Hash::make($otp),
                'password_reset_otp_expires_at' => now()->addMinutes(10),
                'password_reset_otp_verified_at' => null,
                'password_reset_token' => null,
            ])->save();

            Mail::raw(
                "Your B.back password reset OTP is {$otp}. This code expires in 10 minutes.",
                static function ($message) use ($user): void {
                    $message
                        ->to($user->email, $user->name)
                        ->subject('Your B.back OTP Code');
                }
            );
        }

        return response()->json([
            'message' => 'If the email exists, an OTP has been sent.',
        ]);
    }

    public function verifyPasswordOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'digits:4'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();

        if (! $user || ! $user->password_reset_otp) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid OTP code.'],
            ]);
        }

        if ($user->password_reset_otp_expires_at?->isPast()) {
            throw ValidationException::withMessages([
                'otp' => ['OTP code has expired. Please request a new code.'],
            ]);
        }

        if (! Hash::check($data['otp'], $user->password_reset_otp)) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid OTP code.'],
            ]);
        }

        $resetToken = Str::random(64);

        $user->forceFill([
            'password_reset_otp_verified_at' => now(),
            'password_reset_token' => Hash::make($resetToken),
        ])->save();

        return response()->json([
            'message' => 'OTP verified successfully.',
            'reset_token' => $resetToken,
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'reset_token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();

        if (
            ! $user
            || ! $user->password_reset_token
            || ! $user->password_reset_otp_verified_at
            || ! Hash::check($data['reset_token'], $user->password_reset_token)
        ) {
            throw ValidationException::withMessages([
                'password' => ['Password reset session is invalid. Please verify your OTP again.'],
            ]);
        }

        if ($user->password_reset_otp_verified_at->lt(now()->subMinutes(15))) {
            throw ValidationException::withMessages([
                'password' => ['Password reset session has expired. Please request a new OTP.'],
            ]);
        }

        $user->forceFill([
            'password' => $data['password'],
            'password_reset_otp' => null,
            'password_reset_otp_expires_at' => null,
            'password_reset_otp_verified_at' => null,
            'password_reset_token' => null,
        ])->save();

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->userFromBearerToken($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json([
            'user' => $this->userPayload($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $this->userFromBearerToken($request);

        if ($user) {
            $user->forceFill(['remember_token' => null])->save();
        }

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function socialRedirect(string $provider): JsonResponse
    {
        if (! in_array($provider, ['google', 'apple'], true)) {
            abort(404);
        }

        $clientId = config("services.{$provider}.client_id");

        if (! $clientId) {
            return response()->json([
                'message' => ucfirst($provider) . ' login is not configured yet. Add provider credentials to .env to enable it.',
            ], 503);
        }

        return response()->json([
            'message' => ucfirst($provider) . ' login credentials are configured. Install laravel/socialite to complete OAuth callbacks.',
        ], 501);
    }

    private function userFromBearerToken(Request $request): ?User
    {
        $token = $request->bearerToken();

        if (! $token) {
            return null;
        }

        return User::query()->where('remember_token', $token)->first();
    }

    private function sendSms(string $to, string $body): void
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.from');

        if (! $sid || ! $token || ! $from) {
            throw ValidationException::withMessages([
                'phone' => 'Phone OTP service is not configured yet.',
            ]);
        }

        $response = Http::asForm()
            ->withBasicAuth($sid, $token)
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                'From' => $from,
                'To' => $to,
                'Body' => $body,
            ]);

        if ($response->failed()) {
            $twilioMessage = $response->json('message');

            throw ValidationException::withMessages([
                'phone' => $twilioMessage ? "Could not send OTP: {$twilioMessage}" : 'Could not send OTP to this phone number.',
            ]);
        }
    }

    private function normalizePhoneNumber(string $phone): string
    {
        $phone = trim($phone);

        if (str_starts_with($phone, '+')) {
            return $phone;
        }

        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if (strlen($digits) === 10) {
            return '+91' . $digits;
        }

        if (strlen($digits) === 12 && str_starts_with($digits, '91')) {
            return '+' . $digits;
        }

        return $phone;
    }

    private function generatePhoneOtp(): string
    {
        if ($this->phoneOtpTestEnabled()) {
            return $this->phoneOtpTestCode();
        }

        return (string) random_int(1000, 9999);
    }

    private function phoneOtpTestEnabled(): bool
    {
        return (bool) config('services.phone_otp.test_enabled');
    }

    private function phoneOtpTestCode(): string
    {
        $code = preg_replace('/\D+/', '', (string) config('services.phone_otp.test_code')) ?: '1234';

        return str_pad(substr($code, 0, 4), 4, '0');
    }

    /**
     * @return array{id:int,name:string,email:string|null,avatar:string|null}
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
        ];
    }
}
