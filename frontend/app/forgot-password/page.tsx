'use client';

import { AuthButton, AuthForm, AuthInput, AuthLabel, AuthShell, AuthStatus } from '@/components/auth/AuthShell';
import { sendPasswordOtp } from '@/lib/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await sendPasswordOtp({ email });
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setMessage(errorMessage(error, 'Unable to send OTP. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Forgot Password" subtitle="Please enter your email and we will send an OTP code in the next step to reset your password.">
      <AuthForm onSubmit={handleSubmit}>
        <label className="block">
          <AuthLabel>Email</AuthLabel>
          <AuthInput type="email" placeholder="Enter email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <AuthButton type="submit" disabled={isSubmitting} className="mt-6">{isSubmitting ? 'Sending...' : 'Continue'}</AuthButton>
      </AuthForm>
      <AuthStatus message={message} tone="error" />
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
