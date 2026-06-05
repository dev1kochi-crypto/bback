'use client';

import { AuthButton, AuthForm, AuthInput, AuthShell, AuthStatus } from '@/components/auth/AuthShell';
import { sendLoginOtp, sendPasswordOtp, verifyLoginOtp, verifyPasswordOtp } from '@/lib/api';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useRef, useState } from 'react';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const phone = searchParams.get('phone') ?? '';
  const mode = searchParams.get('mode') ?? (phone ? 'login' : 'reset');
  const [digits, setDigits] = useState(['', '', '', '']);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<'neutral' | 'error' | 'success'>('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const otp = useMemo(() => digits.join(''), [digits]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        const response = await verifyLoginOtp({ phone, otp });

        window.localStorage.setItem('auth_token', response.token);
        window.localStorage.setItem('user', JSON.stringify(response.user));
        window.dispatchEvent(new Event('storage'));
        setTone('success');
        setMessage(response.message);
        router.push('/');
        return;
      }

      const response = await verifyPasswordOtp({ email, otp });
      setTone('success');
      setMessage(response.message);
      router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(response.reset_token)}`);
    } catch (error) {
      setTone('error');
      setMessage(errorMessage(error, 'Unable to verify OTP.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setMessage(null);

    try {
      if (mode === 'login') {
        await sendLoginOtp({ phone });
      } else {
        await sendPasswordOtp({ email });
      }

      setTone('success');
      setMessage('A new OTP has been sent.');
    } catch (error) {
      setTone('error');
      setMessage(errorMessage(error, 'Unable to resend OTP.'));
    }
  }

  return (
    <AuthShell title={mode === 'login' ? 'Verify Phone' : 'Verify OTP'} subtitle={mode === 'login' ? 'Enter the OTP sent to your phone number to login.' : 'We have sent an OTP code to your email address. Please enter OTP below to verify.'}>
      <AuthForm className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex justify-center gap-3">
          {digits.map((digit, index) => (
            <AuthInput
              key={index}
              ref={(node) => { inputs.current[index] = node; }}
              aria-label={`OTP digit ${index + 1}`}
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => {
                const nextDigit = event.target.value.replace(/\D/g, '').slice(-1);
                setDigits((current) => current.map((value, valueIndex) => (valueIndex === index ? nextDigit : value)));
                if (nextDigit && index < 3) {
                  inputs.current[index + 1]?.focus();
                }
              }}
              className="h-12 w-12 px-0 text-center text-[18px]"
              required
            />
          ))}
        </div>
        <AuthButton type="submit" disabled={isSubmitting || otp.length !== 4}>{isSubmitting ? 'Verifying...' : 'Verify'}</AuthButton>
      </AuthForm>
      <button type="button" onClick={handleResend} className="mt-4 block w-full text-center font-body text-[12px] font-bold text-white/58 transition hover:text-ember">
        Resend OTP
      </button>
      <AuthStatus message={message} tone={tone} />
    </AuthShell>
  );
}

function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
    const errors = error.response?.data?.errors;
    const firstError = errors ? Object.values(errors).flat()[0] : null;

    return firstError ?? error.response?.data?.message ?? fallback;
  }

  return fallback;
}
