'use client';

import { AuthButton, AuthForm, AuthInput, AuthLabel, AuthShell, AuthStatus } from '@/components/auth/AuthShell';
import { resetCustomerPassword } from '@/lib/api';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const resetToken = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<'neutral' | 'error' | 'success'>('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await resetCustomerPassword({
        email,
        reset_token: resetToken,
        password,
        password_confirmation: passwordConfirmation,
      });

      setTone('success');
      setMessage(response.message);
      window.setTimeout(() => router.push('/login'), 900);
    } catch (error) {
      setTone('error');
      setMessage(errorMessage(error, 'Unable to reset password.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Create a New Password" subtitle="Create your new password. Please keep it safe and do not share it with anyone.">
      <AuthForm onSubmit={handleSubmit}>
        <label className="block">
          <AuthLabel>New Password</AuthLabel>
          <AuthInput type="password" placeholder="Enter new password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
        </label>
        <label className="block">
          <AuthLabel>Confirm Password</AuthLabel>
          <AuthInput type="password" placeholder="Enter confirm password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} minLength={8} required />
        </label>
        <AuthButton type="submit" disabled={isSubmitting} className="mt-6">{isSubmitting ? 'Saving...' : 'Continue'}</AuthButton>
      </AuthForm>
      <AuthStatus message={message} tone={tone} />
      {!email || !resetToken ? (
        <p className="mt-3 font-body text-[11px] font-semibold text-white/50">
          Missing reset session. <Link href="/forgot-password" className="text-ember">Request a new OTP.</Link>
        </p>
      ) : null}
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
