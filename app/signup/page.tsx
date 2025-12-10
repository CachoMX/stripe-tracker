'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get redirect params from URL
  const planFromUrl = searchParams.get('plan');
  const redirectTo = searchParams.get('redirect');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      setSuccess(true);

      // Auto login after signup
      if (data.user) {
        setTimeout(() => {
          // If there's a plan selected, redirect to pricing to complete checkout
          if (planFromUrl && redirectTo === 'pricing') {
            router.push(`/pricing?plan=${planFromUrl}&autoCheckout=true`);
          } else {
            router.push('/dashboard');
          }
          router.refresh();
        }, 2000);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6">
            <Image
              src="/images/ping-icon-export.svg"
              alt="Ping"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </Link>
        </div>

        {/* Signup Card */}
        <div className="card">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Get Started
            </h1>
            <p className="text-small">
              Create your Ping account
            </p>
          </div>

          {error && (
            <div className="alert alert-danger mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-6">
              Account created successfully! Redirecting to dashboard...
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="••••••••"
                minLength={6}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-small">
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-small" style={{ color: 'var(--color-text-muted)' }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
