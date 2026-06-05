'use client';

import { AuthButton, AuthForm, AuthInput, AuthLabel, AuthShell, AuthStatus } from '@/components/auth/AuthShell';
import { sendLoginOtp } from '@/lib/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<'neutral' | 'error' | 'success'>('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await sendLoginOtp({ phone });

      setTone('success');
      setMessage(response.message);
      router.push(`/verify-otp?phone=${encodeURIComponent(phone)}&mode=login`);
    } catch (error) {
      setTone('error');
      setMessage(errorMessage(error, 'Unable to send OTP. Please check your phone number.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Login" subtitle="Enter your phone number and we will send a one-time password to login or create your account.">
      <AuthForm onSubmit={handleSubmit}>
        <label className="block">
          <AuthLabel>Phone Number</AuthLabel>
          <AuthInput type="tel" placeholder="Enter phone number" value={phone} onChange={(event) => setPhone(event.target.value)} required />
        </label>
        <AuthButton type="submit" disabled={isSubmitting} className="mt-6">
          {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
        </AuthButton>
      </AuthForm>
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
